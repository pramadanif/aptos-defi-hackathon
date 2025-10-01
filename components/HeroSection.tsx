"use client";

import { motion } from "framer-motion";
import { Rocket, Zap, TrendingUp, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

// Spectacular Text Animation Component
function SpectacularTextAnimation({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(' ');
  
  return (
    <div className="relative">
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/30 to-pink-500/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main text with word-by-word animation */}
      <div className="relative z-10">
        {words.map((word, wordIndex) => (
          <motion.span
            key={wordIndex}
            initial={{ 
              y: 100, 
              opacity: 0,
              rotateX: 90,
              scale: 0.5
            }}
            animate={{ 
              y: 0, 
              opacity: 1,
              rotateX: 0,
              scale: 1
            }}
            transition={{
              duration: 0.8,
              delay: delay / 1000 + wordIndex * 0.15,
              type: "spring",
              stiffness: 100,
              damping: 12
            }}
            className="inline-block mr-4"
          >
            {/* Each letter with individual effects */}
            {word.split('').map((letter, letterIndex) => (
              <motion.span
                key={letterIndex}
                className="inline-block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                whileHover={{
                  scale: 1.2,
                  y: -10,
                  rotate: [0, -10, 10, 0],
                  color: "#ffffff",
                  filter: 'brightness(1.2)'
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  backgroundPosition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  },
                  default: { duration: 0.3 }
                }}
                style={{
                  backgroundSize: "200% 200%",
                  textShadow: "0 0 30px rgba(139, 69, 199, 0.5)"
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.span>
        ))}
      </div>
      
      {/* Energy waves */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 border-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 rounded-lg"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.6, 0.3, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

// Enhanced Animated Text component
function AnimatedText({ children, delay = 0, className = "" }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string; 
}) {
  return (
    <motion.div
      initial={{ 
        y: 50, 
        opacity: 0,
        rotateX: 45,
        scale: 0.8
      }}
      animate={{ 
        y: 0, 
        opacity: 1,
        rotateX: 0,
        scale: 1
      }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 120,
        damping: 15
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Predefined positions for consistency between server and client
  const floatingElementPositions = [
    { left: 15, top: 20, delay: 0 },
    { left: 75, top: 15, delay: 0.5 },
    { left: 25, top: 70, delay: 1 },
    { left: 85, top: 60, delay: 1.5 },
    { left: 50, top: 40, delay: 2 }
  ];

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-pink-500/20 to-cyan-500/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.6, 0.2],
            rotate: [360, 180, 0],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Fixed floating elements with predefined positions */}
        {isMounted && floatingElementPositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full opacity-60"
            animate={{
              x: [0, 50 - i * 10, 0],
              y: [0, 30 - i * 5, 0],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: pos.delay,
              ease: "easeInOut"
            }}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <AnimatedText delay={0} className="mb-6">
            <motion.div
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                boxShadow: "0 0 50px rgba(6, 182, 212, 0.4)"
              }}
              className="inline-flex items-center px-6 py-3 rounded-full glass-morphism border border-primary/30 mb-6 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 backdrop-blur-xl"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Sparkles className="w-5 h-5 text-cyan-400 mr-3" />
              </motion.div>
              <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                The Future of Meme Coins
              </span>
            </motion.div>
          </AnimatedText>

          <motion.h1
            initial={{ y: 100, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 80 }}
            className="text-4xl lg:text-7xl font-bold mb-6"
          >
            <SpectacularTextAnimation text="Launch Your Coin Into The Future" delay={500} />
          </motion.h1>

          <AnimatedText delay={0.8} className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto">
            <motion.p
              className="bg-gradient-to-r from-slate-300 via-blue-300 to-purple-300 bg-clip-text text-transparent font-medium"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "300% 300%" }}
            >
              Create, trade, and discover the next big meme coin on the most advanced 
              decentralized platform. No coding required, just pure innovation.
            </motion.p>
          </AnimatedText>

          <AnimatedText delay={1.0} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="/launch">
              <motion.button 
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  rotateY: 10,
                  boxShadow: "0 30px 60px -12px rgba(236, 72, 153, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15
                }}
                className="relative overflow-hidden bg-gradient-to-r from-pink-500 to-cyan-500 border-0 neon-glow-pink hover:neon-glow-cyan transition-all duration-300 px-8 py-4 text-white font-bold rounded-lg inline-flex items-center group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                />
                <motion.div 
                  className="relative z-10 flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="group-hover:animate-pulse"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                  </motion.div>
                  Launch Token
                </motion.div>
              </motion.button>
            </a>
            <a href="/bonding-curve">
              <motion.button 
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  rotateY: -10,
                  boxShadow: "0 30px 60px -12px rgba(6, 182, 212, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15
                }}
                className="relative overflow-hidden glass-morphism border-2 border-gradient-to-r from-cyan-400 to-pink-400 hover:border-secondary hover:neon-glow-cyan transition-all duration-300 px-8 py-4 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 text-white font-bold rounded-lg inline-flex items-center group backdrop-blur-xl"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: "300% 300%" }}
                />
                <motion.div 
                  className="relative z-10 flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="group-hover:text-cyan-300"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                  </motion.div>
                  Explore Markets
                </motion.div>
              </motion.button>
            </a>
          </AnimatedText>

          {/* Enhanced Stats */}
          <AnimatedText delay={1.2} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <StatCard 
              icon={<Zap className="w-6 h-6" />}
              title="24h Volume"
              value="$2.4M"
              change="+23%"
              isMounted={isMounted}
            />
            <StatCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Total Tokens"
              value="12,847"
              change="+156"
              isMounted={isMounted}
            />
            <StatCard 
              icon={<Sparkles className="w-6 h-6" />}
              title="Market Cap"
              value="$45.2M"
              change="+18%"
              isMounted={isMounted}
            />
          </AnimatedText>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, title, value, change, isMounted }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  isMounted: boolean;
}) {
  // Predefined positions for particles to avoid hydration mismatch
  const particlePositions = [
    { left: 25, top: 30 },
    { left: 75, top: 20 },
    { left: 50, top: 70 }
  ];

  return (
    <motion.div
      whileHover={{ 
        scale: 1.08, 
        y: -8, 
        rotateY: 10,
        boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.4)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-morphism p-6 rounded-xl border border-gradient-to-r from-cyan-400/30 to-pink-400/30 hover:border-primary/60 transition-all duration-300 bg-gradient-to-br from-cyan-500/5 to-pink-500/5 backdrop-blur-xl relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ backgroundSize: "200% 200%" }}
      />
      
      <motion.div 
        className="flex items-center justify-center mb-3 relative z-10"
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <motion.div 
          className="text-cyan-400"
          whileHover={{ 
            scale: 1.3,
            rotate: 360,
            color: "#ec4899"
          }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
      </motion.div>
      
      <h3 className="text-sm bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent mb-2 font-medium relative z-10">{title}</h3>
      
      <motion.p 
        className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent relative z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {value}
      </motion.p>
      
      <motion.p 
        className="text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent relative z-10"
        animate={{ 
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ backgroundSize: "200% 200%" }}
      >
        {change}
      </motion.p>
      
      {/* Fixed floating micro-particles */}
      {isMounted && particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          animate={{
            x: [0, 20 - i * 10, 0],
            y: [0, 15 - i * 5, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5
          }}
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`
          }}
        />
      ))}
    </motion.div>
  );
}