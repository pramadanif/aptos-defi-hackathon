"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, ShoppingCart, BarChart3 } from "lucide-react";

interface TokenCardProps {
  token: {
    id: string;
    address: string;
    name: string;
    symbol: string;
    price: number;
    change24h: number;
    volume: string;
    marketCap: string;
    creator: {
      name: string;
      avatar: string;
    };
    progress: number;
    socialStats: {
      views: number;
      likes: number;
      comments: number;
    };
    isNew?: boolean;
    isHot?: boolean;
    iconUri?: string;
    projectUri?: string;
  };
}

export function TokenCard({ token }: TokenCardProps) {
  const router = useRouter();
  const isPositive = token.change24h > 0;
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/coin/${token.address}`);
  };
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        rotateY: 2,
        boxShadow: isPositive 
          ? "0 25px 50px -12px rgba(57, 255, 20, 0.4), 0 0 0 1px rgba(57, 255, 20, 0.2)" 
          : "0 25px 50px -12px rgba(255, 20, 147, 0.4), 0 0 0 1px rgba(255, 20, 147, 0.2)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{ backgroundSize: "200% 200%" }}
        />

        <CardContent className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <motion.div
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -10, 10, 0],
                    boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Avatar className="w-12 h-12 ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300">
                    <AvatarImage src={token.iconUri || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                      {token.symbol.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                {token.isNew && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                      NEW
                    </Badge>
                  </motion.div>
                )}
              </div>
              <div>
                <motion.h3 
                  className="font-bold text-lg bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {token.name}
                </motion.h3>
                <p className="text-muted-foreground text-sm">${token.symbol}</p>
              </div>
            </div>
            
            {token.isHot && (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.2 }}
              >
                <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 shadow-lg">
                  🔥 HOT
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Price & Change */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <motion.span 
                className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                ${token.price.toFixed(6)}
              </motion.span>
              <motion.div 
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                  isPositive 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={{ 
                    y: isPositive ? [0, -3, 0] : [0, 3, 0],
                    rotate: isPositive ? [0, 10, 0] : [0, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </motion.div>
                <span className="font-medium text-sm">
                  {isPositive ? "+" : ""}{token.change24h.toFixed(2)}%
                </span>
              </motion.div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress to Moon</span>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-medium"
                >
                  {token.progress}%
                </motion.span>
              </div>
              <div className="relative">
                <Progress 
                  value={token.progress} 
                  className="h-2 bg-slate-700/50"
                />
                <motion.div
                  className="absolute inset-0 h-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${
                      isPositive ? "#39ff14" : "#ff1493"
                    } 0%, transparent 100%)`,
                    width: `${token.progress}%`
                  }}
                  animate={{ 
                    boxShadow: [
                      `0 0 10px ${isPositive ? "#39ff14" : "#ff1493"}40`,
                      `0 0 20px ${isPositive ? "#39ff14" : "#ff1493"}60`,
                      `0 0 10px ${isPositive ? "#39ff14" : "#ff1493"}40`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            >
              <p className="text-muted-foreground">Volume 24h</p>
              <p className="font-medium text-cyan-400">{token.volume}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            >
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium text-pink-400">{token.marketCap}</p>
            </motion.div>
          </div>

          {/* Enhanced Creator Section */}
          <motion.div 
            className="flex items-center space-x-2 mb-4 p-3 rounded-lg bg-gradient-to-r from-slate-800/20 to-slate-700/20 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -1 }}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={token.creator.avatar} />
                <AvatarFallback className="text-xs">{token.creator.name[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <span className="text-sm text-muted-foreground">by</span>
            <motion.span 
              className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              {token.creator.name}
            </motion.span>
          </motion.div>

          {/* Enhanced Social Stats */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <motion.div 
              className="flex items-center space-x-1 text-muted-foreground hover:text-cyan-400 cursor-pointer transition-colors duration-300"
              whileHover={{ scale: 1.05, y: -1 }}
            >
              <Eye className="w-4 h-4" />
              <span>{token.socialStats.views}</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-muted-foreground hover:text-pink-400 cursor-pointer transition-colors duration-300"
              whileHover={{ scale: 1.05, y: -1 }}
            >
              <Heart className="w-4 h-4" />
              <span>{token.socialStats.likes}</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-muted-foreground hover:text-purple-400 cursor-pointer transition-colors duration-300"
              whileHover={{ scale: 1.05, y: -1 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{token.socialStats.comments}</span>
            </motion.div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex space-x-3">
            {/* Buy Now Button - Primary CTA */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <motion.button 
                onClick={handleBuyNow}
                whileHover={{ 
                  y: -3,
                  rotateY: 5,
                  boxShadow: "0 20px 40px -12px rgba(236, 72, 153, 0.6)"
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15
                }}
                className="relative w-full overflow-hidden bg-gradient-to-r from-pink-500 to-cyan-500 border-0 px-4 py-3 text-white font-bold rounded-lg inline-flex items-center justify-center group"
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                />
                
                {/* Button content */}
                <motion.div 
                  className="relative z-10 flex items-center"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      repeatType: "reverse" 
                    }}
                    className="group-hover:animate-pulse"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  </motion.div>
                  <span className="text-sm font-bold">Buy Now</span>
                </motion.div>

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: [
                      "0 0 0 rgba(236, 72, 153, 0)",
                      "0 0 20px rgba(236, 72, 153, 0.3)",
                      "0 0 0 rgba(236, 72, 153, 0)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.button>
            </motion.div>

            {/* View Chart Button - Secondary CTA */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <motion.button 
                whileHover={{ 
                  y: -3,
                  rotateY: -5,
                  boxShadow: "0 20px 40px -12px rgba(6, 182, 212, 0.5)"
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15
                }}
                className="relative w-full overflow-hidden glass-morphism border-2 border-gradient-to-r from-cyan-400/50 to-pink-400/50 hover:border-secondary px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 text-white font-bold rounded-lg inline-flex items-center justify-center group backdrop-blur-xl transition-all duration-300"
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: "300% 300%" }}
                />
                
                {/* Button content */}
                <motion.div 
                  className="relative z-10 flex items-center"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 180]
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="group-hover:text-cyan-300"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                  </motion.div>
                  <span className="text-sm font-bold">View Chart</span>
                </motion.div>

                {/* Border glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-transparent"
                  animate={{
                    borderColor: [
                      "rgba(6, 182, 212, 0)",
                      "rgba(6, 182, 212, 0.5)",
                      "rgba(6, 182, 212, 0)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}