"use client";

import { TokenCard } from "./TokenCard";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Utility function for compact number formatting
const formatCompactNumber = (value: string | number, decimals = 2) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (absNum >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (absNum >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  
  // For numbers less than 1000, show with appropriate decimals
  if (absNum < 1) return num.toFixed(decimals);
  return num.toFixed(decimals < 2 ? decimals : 2);
};

// Mock data - kept for reference but not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const router = useRouter();
  interface Token {
    address: string;
    name: string;
    symbol: string;
    pool_stats?: {
      apt_reserves?: string;
      trade_count?: number;
      is_graduated?: boolean;
      total_volume?: string;
      graduation_threshold?: string;
    };
    creator: string;
    icon_uri?: string;
    project_uri?: string;
    decimals: number;
    created_at: string;
  }
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch tokens from API
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch from Prisma database instead of smart contract
        const response = await fetch('/api/tokens');
        const data = await response.json();
        
        console.log('TrendingSection API response:', data);
        
        if (data.success && Array.isArray(data.data)) {
          console.log('Tokens loaded:', data.data);
          setTokens(data.data);
        } else {
          setError(data.error || 'Failed to fetch tokens');
        }
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Sort tokens for different tabs
  const trendingTokens = tokens.slice(0, 8); // Show first 8 as trending
  const newTokens = tokens.slice().reverse().slice(0, 8); // Show latest 8 as new

  const handleLoadMore = () => {
    router.push('/bonding-curve');
  };

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
              </TabsList>

              <Button variant="outline" className="glass-morphism border-primary/30 mt-4 sm:mt-0">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <TabsContent value="trending">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <span className="ml-3 text-lg">Loading trending tokens...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">Error: {error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <TokenGrid tokens={trendingTokens} />
              )}
            </TabsContent>
            
            <TabsContent value="new">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <span className="ml-3 text-lg">Loading new tokens...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">Error: {error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <TokenGrid tokens={newTokens} />
              )}
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
            onClick={handleLoadMore}
          >
            Explore All Tokens
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

interface TokenGridToken {
  address: string;
  name: string;
  symbol: string;
  pool_stats?: {
    apt_reserves?: string;
    trade_count?: number;
    is_graduated?: boolean;
    total_volume?: string;
    graduation_threshold?: string;
  };
  creator: string;
  icon_uri?: string;
  project_uri?: string;
  decimals: number;
  created_at: string;
}

function TokenGrid({ tokens }: { tokens: TokenGridToken[] }) {
  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tokens found</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tokens.map((token, index) => {
        // Ensure we have a valid address string for the key
        const tokenAddress = token?.address || `token-${index}`;
        
        // Transform Prisma token data to match TokenCard expected format
        const currentPrice = token?.pool_stats?.apt_reserves ? 
          Number(token.pool_stats.apt_reserves) / 1e8 / 1000000000 : 0.000001;
        
        console.log(`Transforming token ${index}:`, {
          name: token?.name,
          symbol: token?.symbol,
          iconUri: token?.icon_uri,
          projectUri: token?.project_uri,
          poolStats: token?.pool_stats
        });
        
        const transformedToken = {
          id: tokenAddress,
          address: tokenAddress, // Add this line to ensure the address is available for navigation
          name: token?.name || "Unknown Token",
          symbol: token?.symbol || "UNK",
          price: currentPrice,
          change24h: 0, // Would need historical data
          volume: token?.pool_stats?.total_volume ? 
            `$${formatCompactNumber(Number(token.pool_stats.total_volume) / 1e8, 2)}` : "$0",
          marketCap: `$${formatCompactNumber(currentPrice * 1000000000, 2)}`, // Assuming 1B supply
          creator: {
            name: token?.creator ? `${token.creator.slice(0, 6)}...${token.creator.slice(-4)}` : "BullPump",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bullpump"
          },
          progress: token?.pool_stats ? 
            (Number(token.pool_stats.apt_reserves) / Number(token.pool_stats.graduation_threshold || 2150000000000)) * 100 : 0,
          socialStats: {
            views: token?.pool_stats?.trade_count || 0,
            likes: 0,
            comments: 0
          },
          isNew: index < 4, // Mark first 4 as new
          iconUri: token?.icon_uri || "",
          projectUri: token?.project_uri || ""
        };
        
        console.log(`Transformed token ${index}:`, transformedToken);
        
        return (
          <motion.div
            key={`${tokenAddress}-${index}`} // Ensure unique key
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <TokenCard token={transformedToken} />
          </motion.div>
        );
      })}
    </div>
  );
}