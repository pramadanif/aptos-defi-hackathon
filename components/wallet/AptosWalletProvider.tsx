"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ReactNode } from "react";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";

export default function AptosWalletProvider({ children }: { children: ReactNode }) {
  const onError = (error: unknown) => {
    console.error(error);
    toast.error("Wallet error", {
      description: error instanceof Error ? error.message : String(error),
    });
  };

  return (
    <AptosWalletAdapterProvider autoConnect onError={onError}>
      {children}
      {/* Ensure a global toaster exists even if page forgot it */}
      <Toaster />
    </AptosWalletAdapterProvider>
  );
}
