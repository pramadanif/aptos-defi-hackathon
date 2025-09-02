"use client";

import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { TrendingSection } from "../components/TrendingSection";
import { TradingDashboard } from "../components/TradingDashboard";
import { Footer } from "../components/Footer";
import { Toaster } from "../components/ui/sonner";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <Header />
      
      <main className="relative z-10">
        <HeroSection />
        <TrendingSection />
        <TradingDashboard />
      </main>
      
      <Footer />
      
      {/* Toast Notifications */}
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
