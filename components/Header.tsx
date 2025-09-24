"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { TrendingUp, Menu, X, Wallet, Search, LogOut, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50 w-full shadow-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(59,130,246,0.1) 100%)"
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <motion.div 
            className="flex items-center space-x-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div 
              className="w-10 h-10 rounded-xl overflow-hidden relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 opacity-50 blur-sm"></div>
              <Image 
                src="/BULLPUMP_FIX.png" 
                alt="BullPump Logo" 
                width={40} 
                height={40}
                className="w-full h-full object-contain relative z-10"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(168,85,247,0.3)",
                    "0 0 30px rgba(236,72,153,0.4)",
                    "0 0 20px rgba(59,130,246,0.3)",
                    "0 0 20px rgba(168,85,247,0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            
            <div className="relative">
              <motion.h1 
                className="text-2xl font-black tracking-tight relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.span
                  className="relative inline-block"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #a855f7 25%, #ec4899 50%, #06b6d4 75%, #ffffff 100%)",
                    backgroundSize: "400% 400%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 20px rgba(168,85,247,0.5))"
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  BullPump
                </motion.span>
                
                {/* Floating sparkles */}
                <motion.div
                  className="absolute -top-1 -right-2"
                  animate={{
                    rotate: [0, 360],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 opacity-70" />
                </motion.div>
                
                {/* Glowing underline */}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 opacity-0 group-hover:opacity-100"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.h1>
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 blur-xl -z-10"
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          {/* Enhanced Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink href="/" currentPath={pathname}>Trade</NavLink>
            <NavLink href="/launch" currentPath={pathname}>Launch</NavLink>
            <NavLink href="/bonding-curve" currentPath={pathname}>Explore</NavLink>
            <NavLink href="/portfolio" currentPath={pathname}>Portfolio</NavLink>
          </nav>

          {/* Enhanced Search Bar */}
          <motion.div 
            className="hidden lg:flex items-center relative group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute left-3 z-10"
              whileHover={{ scale: 1.1, rotate: 15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Search className="w-4 h-4 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
            </motion.div>
            <Input 
              placeholder="Search tokens..." 
              className="pl-10 w-64 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl
                         focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20
                         hover:bg-white/15 transition-all duration-300
                         placeholder:text-white/60 text-white"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(168,85,247,0.05) 100%)"
              }}
            />
          </motion.div>

          {/* Enhanced Wallet & Menu */}
          <div className="flex items-center space-x-3">
            {!connected ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button 
                      className="relative overflow-hidden rounded-xl px-6 py-2.5 font-semibold text-white
                                 border border-white/20 hover:border-white/40 transition-all duration-300
                                 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20
                                 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-cyan-500/30
                                 shadow-lg hover:shadow-xl backdrop-blur-sm"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 opacity-0 hover:opacity-20 transition-opacity duration-300"
                        whileHover={{
                          background: [
                            "linear-gradient(45deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2), rgba(6,182,212,0.2))",
                            "linear-gradient(45deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
                            "linear-gradient(45deg, rgba(236,72,153,0.2), rgba(6,182,212,0.2), rgba(168,85,247,0.2))"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative z-10 flex items-center">
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </div>
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Connect Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-2">
                    {installedWallets.length === 0 && (
                      <p className="text-sm text-white/60">No wallets detected. Please install Petra, Martian, or OKX Wallet extension.</p>
                    )}
                    {installedWallets.map((w) => (
                      <Button key={w.name} variant="outline" className="justify-start bg-white/5 border-white/20 text-white hover:bg-white/10" onClick={() => handleConnect(w.name)}>
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
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 rounded-xl">
                    <Wallet className="w-4 h-4 mr-2 text-purple-400" />
                    {shortAddr}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleDisconnect} 
                    title="Disconnect"
                    className="text-white hover:bg-white/10 rounded-xl hover:text-pink-400 transition-colors duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-white hover:bg-white/10 rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden mt-4 pt-4 border-t border-white/20 overflow-hidden"
            >
              <div className="flex flex-col space-y-2">
                <MobileNavLink href="/" currentPath={pathname} onClick={() => setMobileMenuOpen(false)}>Trade</MobileNavLink>
                <MobileNavLink href="/launch" currentPath={pathname} onClick={() => setMobileMenuOpen(false)}>Launch</MobileNavLink>
                <MobileNavLink href="/bonding-curve" currentPath={pathname} onClick={() => setMobileMenuOpen(false)}>Explore</MobileNavLink>
                <MobileNavLink href="/portfolio" currentPath={pathname} onClick={() => setMobileMenuOpen(false)}>Portfolio</MobileNavLink>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

function NavLink({ href, children, currentPath }: { href: string; children: React.ReactNode; currentPath: string | null }) {
  const isActive = href !== "#" && (currentPath === href || (href !== "/" && currentPath?.startsWith(href)));
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Link
        href={href}
        className={`relative px-4 py-2.5 rounded-xl font-medium transition-all duration-300 overflow-hidden group ${
          isActive 
            ? "text-white shadow-lg" 
            : "text-white/70 hover:text-white"
        }`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 border border-white/30"
            : "bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/20"
        }`} />
        
        {/* Animated background on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{
            background: [
              "linear-gradient(45deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2), rgba(6,182,212,0.2))",
              "linear-gradient(45deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
              "linear-gradient(45deg, rgba(236,72,153,0.2), rgba(6,182,212,0.2), rgba(168,85,247,0.2))"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Text */}
        <span className="relative z-10">{children}</span>
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-1/2 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
            initial={{ width: 0, x: "-50%" }}
            animate={{ width: 32, x: "-50%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

function MobileNavLink({ href, children, currentPath, onClick }: { 
  href: string; 
  children: React.ReactNode; 
  currentPath: string | null;
  onClick: () => void;
}) {
  const isActive = href !== "#" && (currentPath === href || (href !== "/" && currentPath?.startsWith(href)));
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <Link
        href={href}
        onClick={onClick}
        className={`block px-4 py-3 rounded-xl transition-all duration-300 ${
          isActive 
            ? "text-white bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 border border-white/30" 
            : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
}