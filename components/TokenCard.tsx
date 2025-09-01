"use client";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle } from "lucide-react";

interface TokenCardProps {
  token: {
    id: string;
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
  };
}

export function TokenCard({ token }: TokenCardProps) {
  const isPositive = token.change24h > 0;
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        boxShadow: isPositive 
          ? "0 0 30px rgba(57, 255, 20, 0.3)" 
          : "0 0 30px rgba(255, 20, 147, 0.3)"
      }}
      transition={{ type: "spring", stiffness: 400 }}
      className="group"
    >
      <Card className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                  <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} />
                  <AvatarFallback>{token.symbol.slice(0, 2)}</AvatarFallback>
                </Avatar>
                {token.isNew && (
                  <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-1.5 py-0.5">
                    NEW
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{token.name}</h3>
                <p className="text-muted-foreground text-sm">${token.symbol}</p>
              </div>
            </div>
            
            {token.isHot && (
              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                🔥 HOT
              </Badge>
            )}
          </div>

          {/* Price & Change */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">${token.price.toFixed(6)}</span>
              <div className={`flex items-center space-x-1 ${
                isPositive ? "text-accent" : "text-destructive"
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isPositive ? "+" : ""}{token.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress to Moon</span>
                <span>{token.progress}%</span>
              </div>
              <Progress 
                value={token.progress} 
                className="h-2"
                style={{
                  background: `linear-gradient(90deg, ${
                    isPositive ? "var(--neon-green)" : "var(--electric-pink)"
                  } 0%, transparent 100%)`
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">Volume 24h</p>
              <p className="font-medium">{token.volume}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium">{token.marketCap}</p>
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-center space-x-2 mb-4 p-3 rounded-lg bg-muted/10">
            <Avatar className="w-6 h-6">
              <AvatarImage src={token.creator.avatar} />
              <AvatarFallback>{token.creator.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">by</span>
            <span className="text-sm font-medium">{token.creator.name}</span>
          </div>

          {/* Social Stats */}
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{token.socialStats.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{token.socialStats.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{token.socialStats.comments}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <Button 
                className="w-full bg-gradient-primary border-0 neon-glow-pink hover:neon-glow-cyan transition-all duration-300"
                size="sm"
              >
                Buy Now
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <Button 
                variant="outline" 
                className="w-full glass-morphism border-secondary/50 hover:border-secondary"
                size="sm"
              >
                View Chart
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}