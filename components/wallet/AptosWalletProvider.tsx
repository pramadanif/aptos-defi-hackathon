"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ReactNode } from "react";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import { Network } from "@aptos-labs/ts-sdk";

export default function AptosWalletProvider({ children }: { children: ReactNode }) {
  const onError = (error: unknown) => {
    console.error(error);
    toast.error("Wallet error", {
      description: error instanceof Error ? error.message : String(error),
    });
  };
  
  // Whitelist extension wallets; cast to any to avoid mismatch with AvailableWallets typings across versions
  const OPT_IN_WALLETS = ["Petra", "Martian", "Martian Wallet", "OKX Wallet", "Pontem Wallet"] as unknown as any;

  return (
    <AptosWalletAdapterProvider
      autoConnect
      onError={onError}
      // Whitelist only extension wallets so the adapter doesn't deep-link to mobile/web
      optInWallets={OPT_IN_WALLETS}
      // Konfigurasi untuk memastikan pop-up mode
      dappConfig={{
        network: Network.TESTNET, // gunakan TESTNET untuk pengembangan
        aptosConnectDappId: undefined, // disable Aptos Connect untuk pop-up behavior
        mizuwallet: {
          manifestURL: "https://your-app-domain.com/manifest.json" // optional
        }
      }}
    >
      {children}
      {/* Ensure a global toaster exists even if page forgot it */}
      <Toaster />
      
      {/* CSS untuk memastikan wallet modal tampil sebagai pop-up */}
      <style jsx global>{`
        /* Force wallet modal to be popup style */
        .wallet-adapter-modal,
        .ant-modal,
        [data-testid="wallet-selector-modal"] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 400px !important;
          height: auto !important;
          max-height: 80vh !important;
          z-index: 9999 !important;
        }
        
        /* Ensure modal backdrop doesn't cover full screen */
        .wallet-adapter-modal-overlay,
        .ant-modal-mask {
          position: fixed !important;
          background-color: rgba(0, 0, 0, 0.5) !important;
          z-index: 9998 !important;
        }
        
        /* Style wallet connection buttons */
        .wallet-adapter-modal-wrapper {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: unset !important;
          height: auto !important;
        }
        
        /* Prevent fullscreen on mobile */
        @media (max-width: 768px) {
          .wallet-adapter-modal,
          [data-testid="wallet-selector-modal"] {
            width: 90vw !important;
            max-width: 400px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </AptosWalletAdapterProvider>
  );
}