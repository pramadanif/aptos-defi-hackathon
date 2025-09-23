"use client";

import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { BondingCurveTrading } from "../../components/BondingCurveTrading";
import { Toaster } from "../../components/ui/sonner";

export default function BondingCurvePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="relative z-10">
        <BondingCurveTrading />
      </main>
      <Footer />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  );
}
