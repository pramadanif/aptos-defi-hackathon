import LaunchTokenForm from "../../components/LaunchTokenForm";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Toaster } from "../../components/ui/sonner";

export const metadata = {
  title: "Launch Token | BullPump",
};

export default function LaunchPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="relative z-10">
        <LaunchTokenForm />
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
