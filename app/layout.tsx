import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import AptosWalletProvider from "../components/wallet/AptosWalletProvider";
// import BackgroundLiquidChrome from "../components/BackgroundLiquidChrome";

// Auto-start real-time indexer on server startup
import '@/lib/indexer-autostart';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArgoPump",
  description: "ArgoPump - The ultimate bonding curve token launchpad on Aptos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AptosWalletProvider>
          {/* <BackgroundLiquidChrome /> */}
          <ThemeProvider>{children}</ThemeProvider>
        </AptosWalletProvider>
      </body>
    </html>
  );
}
