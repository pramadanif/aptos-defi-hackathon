"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Wallet, Search, Menu, TrendingUp, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState, useMemo } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";

export function Header() {
  const pathname = usePathname();
  const { wallets, connect, disconnect, account, connected } = useWallet();
  const [open, setOpen] = useState(false);

  const shortAddr = useMemo(() => {
    const addr = account?.address?.toString();
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  }, [account]);

  const installedWallets = useMemo(() => {
    // Only keep wallets with readyState === "Installed" to avoid deep-link new tabs
    return wallets.filter((w: any) => w?.readyState === "Installed" || w?.installed === true);
  }, [wallets]);

  async function handleConnect(name: string) {
    try {
      // Prevent deep-link behavior when wallet is not installed
      const target: any = wallets.find((w) => w.name === name);
      const isInstalled = target?.readyState === "Installed" || target?.installed === true;
      if (!isInstalled) {
        toast.error("Wallet not installed", {
          description: "Please install the extension first to open the popup in-page.",
        });
        return;
      }

      await connect(name);
      toast.success("Wallet connected", { description: name });
      setOpen(false);
    } catch (e: any) {
      toast.error("Failed to connect", { description: e?.message || String(e) });
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect();
      toast.success("Disconnected");
    } catch (e: any) {
      toast.error("Failed to disconnect", { description: e?.message || String(e) });
    }
  }
  return (
    <motion.header 
      className="glass-morphism sticky top-0 z-50 w-full border-b border-primary/20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center neon-glow-pink">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient-primary">
              Aptos DeFi
            </h1>
          </motion.div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" currentPath={pathname}>Trade</NavLink>
            <NavLink href="/launch" currentPath={pathname}>Launch</NavLink>
            <NavLink href="/portfolio" currentPath={pathname}>Portfolio</NavLink>
            <NavLink href="#" currentPath={pathname}>Analytics</NavLink>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search tokens..." 
              className="pl-10 w-64 bg-muted/20 border-primary/30 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Wallet & Menu */}
          <div className="flex items-center space-x-3">
            {!connected ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      className="bg-gradient-primary border-0 neon-glow-pink hover:neon-glow-cyan transition-all duration-300"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-2">
                    {installedWallets.length === 0 && (
                      <p className="text-sm text-muted-foreground">No wallets detected. Please install Petra, Martian, or OKX Wallet extension.</p>
                    )}
                    {installedWallets.map((w) => (
                      <Button key={w.name} variant="outline" className="justify-start" onClick={() => handleConnect(w.name)}>
                        {w.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={w.icon} alt="" className="w-5 h-5 mr-2" />
                        ) : (
                          <Wallet className="w-4 h-4 mr-2" />
                        )}
                        {w.name}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-primary/30">
                  <Wallet className="w-4 h-4 mr-2" />
                  {shortAddr}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDisconnect} title="Disconnect">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function NavLink({ href, children, currentPath }: { href: string; children: React.ReactNode; currentPath: string | null }) {
  const isActive = href !== "#" && (currentPath === href || (href !== "/" && currentPath?.startsWith(href)));
  return (
    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg transition-all duration-300 ${
          isActive 
            ? "text-primary neon-glow-pink" 
            : "text-muted-foreground hover:text-foreground hover:neon-glow-cyan"
        }`}
      >
        {children}
      </Link>
    </motion.span>
  );
}