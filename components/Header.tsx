"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Wallet, Search, Menu, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                className="bg-gradient-primary border-0 neon-glow-pink hover:neon-glow-cyan transition-all duration-300"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </motion.div>
            
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