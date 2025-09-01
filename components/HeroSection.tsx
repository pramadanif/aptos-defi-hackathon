"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Rocket, Zap, TrendingUp, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-morphism border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-accent mr-2" />
              <span className="text-sm">The Future of Meme Coins</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-7xl font-bold mb-6"
          >
            Launch Your Token
            <br />
            <span className="text-gradient-primary">Into The Future</span>
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Create, trade, and discover the next big meme coin on the most advanced 
            decentralized platform. No coding required, just pure innovation.
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button 
              size="lg"
              className="bg-gradient-primary border-0 neon-glow-pink hover:neon-glow-cyan transition-all duration-300 px-8 py-6"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Launch Token
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="glass-morphism border-secondary/50 hover:border-secondary hover:neon-glow-cyan transition-all duration-300 px-8 py-6"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Explore Markets
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <StatCard 
              icon={<Zap className="w-6 h-6" />}
              title="24h Volume"
              value="$2.4M"
              change="+23%"
            />
            <StatCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Total Tokens"
              value="12,847"
              change="+156"
            />
            <StatCard 
              icon={<Sparkles className="w-6 h-6" />}
              title="Market Cap"
              value="$45.2M"
              change="+18%"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, title, value, change }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="glass-morphism p-6 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300"
    >
      <div className="flex items-center justify-center text-accent mb-2">
        {icon}
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-accent">{change}</p>
    </motion.div>
  );
}