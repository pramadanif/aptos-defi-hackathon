"use client";

import { TokenCard } from "./TokenCard";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Zap, Filter } from "lucide-react";

// Mock data
const mockTokens = [
  {
    id: "1",
    name: "MoonDoge",
    symbol: "MDOGE",
    price: 0.000042,
    change24h: 234.5,
    volume: "$1.2M",
    marketCap: "$8.4M",
    creator: {
      name: "CryptoWizard",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
    },
    progress: 78,
    socialStats: {
      views: 12400,
      likes: 892,
      comments: 156
    },
    isNew: true,
    isHot: true
  },
  {
    id: "2",
    name: "NeonCat",
    symbol: "NCAT",
    price: 0.000156,
    change24h: 89.3,
    volume: "$890K",
    marketCap: "$5.2M",
    creator: {
      name: "NeonMaster",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
    },
    progress: 45,
    socialStats: {
      views: 8900,
      likes: 654,
      comments: 89
    },
    isHot: true
  },
  {
    id: "3",
    name: "CyberPepe",
    symbol: "CPEPE",
    price: 0.000089,
    change24h: -12.4,
    volume: "$650K",
    marketCap: "$3.1M",
    creator: {
      name: "PepeKing",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
    },
    progress: 32,
    socialStats: {
      views: 5600,
      likes: 423,
      comments: 67
    }
  },
  {
    id: "4",
    name: "GalaxyShiba",
    symbol: "GSHIB",
    price: 0.000234,
    change24h: 45.7,
    volume: "$1.8M",
    marketCap: "$12.3M",
    creator: {
      name: "ShibaLord",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4"
    },
    progress: 67,
    socialStats: {
      views: 15600,
      likes: 1234,
      comments: 234
    },
    isNew: true
  }
];

export function TrendingSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-morphism border border-primary/30 mb-4">
            <TrendingUp className="w-4 h-4 text-accent mr-2" />
            <span className="text-sm">Live Markets</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            Trending <span className="text-gradient-primary">Tokens</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the hottest meme coins and emerging tokens that are making waves in the crypto space.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Tabs defaultValue="trending" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
              <TabsList className="glass-morphism bg-transparent border border-primary/20">
                <TabsTrigger 
                  value="trending" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="new"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  New
                </TabsTrigger>
                <TabsTrigger 
                  value="hot"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Hot
                </TabsTrigger>
              </TabsList>

              <Button variant="outline" className="glass-morphism border-primary/30 mt-4 sm:mt-0">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <TabsContent value="trending">
              <TokenGrid tokens={mockTokens} />
            </TabsContent>
            
            <TabsContent value="new">
              <TokenGrid tokens={mockTokens.filter(token => token.isNew)} />
            </TabsContent>
            
            <TabsContent value="hot">
              <TokenGrid tokens={mockTokens.filter(token => token.isHot)} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Load More */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button 
            variant="outline" 
            size="lg"
            className="glass-morphism border-secondary/50 hover:border-secondary hover:neon-glow-cyan transition-all duration-300 px-8"
          >
            Load More Tokens
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function TokenGrid({ tokens }: { tokens: typeof mockTokens }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tokens.map((token, index) => (
        <motion.div
          key={token.id}
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <TokenCard token={token} />
        </motion.div>
      ))}
    </div>
  );
}