"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpDown, 
  BarChart3, 
  Coins,
  Target,
  Zap,
  RefreshCw,
  Info,
  Clock,
  Users,
  DollarSign
} from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import Image from "next/image";

interface TokenInfo {
  name: string;
  symbol: string;
  fa_object_addr: string;
  apt_reserves: number;
  token_supply: number;
  is_graduated: boolean;
  creator: string;
  user_balance?: number;
  total_volume?: number;
  trade_count?: number;
  icon_uri?: string;
  project_uri?: string;
}

const dummyTokens: TokenInfo[] = [
  {
    name: "Pepe Inu",
    symbol: "PEPEINU",
    fa_object_addr: "0x1234567890abcdef1234567890abcdef12345678",
    apt_reserves: 1250.75,
    token_supply: 1000000000,
    is_graduated: false,
    creator: "0xabcdef1234567890abcdef1234567890abcdef12",
    user_balance: 15000.25,
    total_volume: 25000,
    trade_count: 142,
    icon_uri: "",
    project_uri: ""
  },
  {
    name: "Doge Moon",
    symbol: "DOGEMOON",
    fa_object_addr: "0x2345678901bcdef12345678901bcdef123456789",
    apt_reserves: 890.50,
    token_supply: 1000000000,
    is_graduated: false,
    creator: "0xbcdef12345678901bcdef12345678901bcdef123",
    user_balance: 0,
    total_volume: 18500,
    trade_count: 89,
    icon_uri: "",
    project_uri: ""
  },
  {
    name: "Shiba Rocket",
    symbol: "SHIBROCKET",
    fa_object_addr: "0x3456789012cdef123456789012cdef1234567890",
    apt_reserves: 2100.25,
    token_supply: 1000000000,
    is_graduated: false,
    creator: "0xcdef123456789012cdef123456789012cdef1234",
    user_balance: 5000,
    total_volume: 42000,
    trade_count: 256,
    icon_uri: "",
    project_uri: ""
  },
  {
    name: "Baby Floki",
    symbol: "BABYFLOKI",
    fa_object_addr: "0x456789013def12345678901def1234567890123",
    apt_reserves: 750.80,
    token_supply: 1000000000,
    is_graduated: false,
    creator: "0xdef123456789013def123456789013def12345678",
    user_balance: 25000,
    total_volume: 15000,
    trade_count: 67,
    icon_uri: "",
    project_uri: ""
  },
  {
    name: "SafeMoon V2",
    symbol: "SAFEMOONV2",
    fa_object_addr: "0x56789014ef123456789014ef123456789014ef12",
    apt_reserves: 3200.40,
    token_supply: 1000000000,
    is_graduated: false,
    creator: "0xef123456789014ef123456789014ef123456789",
    user_balance: 0,
    total_volume: 68000,
    trade_count: 324,
    icon_uri: "",
    project_uri: ""
  },
  {
    name: "Bonk Inu",
    symbol: "BONKINU",
    fa_object_addr: "0x6789015f1234567890f1234567890f1234567890",
    apt_reserves: 1850.90,
    token_supply: 1000000000,
    is_graduated: false,
    creator: "0xf1234567890f1234567890f1234567890f123456",
    user_balance: 8500,
    total_volume: 35000,
    trade_count: 178,
    icon_uri: "",
    project_uri: ""
  },
  {
    name: "Wojak Coin",
    symbol: "WOJAK",
    fa_object_addr: "0x789016f123456789016f123456789016f1234567",
    apt_reserves: 22000.75,
    token_supply: 1000000000,
    is_graduated: true,
    creator: "0x123456789016f123456789016f123456789016f1",
    user_balance: 0,
    total_volume: 125000,
    trade_count: 892,
    icon_uri: "",
    project_uri: ""
  },
  {
    name: "Chad Token",
    symbol: "CHAD",
    fa_object_addr: "0x89017f123456789017f123456789017f123456789",
    apt_reserves: 1650.30,
    token_supply: 1000000000,
    is_graduated: false,
    creator: "0x23456789017f123456789017f123456789017f12",
    user_balance: 12000,
    total_volume: 28500,
    trade_count: 156,
    icon_uri: "",
    project_uri: ""
  }
];

export function BondingCurveTrading() {
  const { account, signAndSubmitTransaction } = useWallet() as any;
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [aptAmount, setAptAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>(dummyTokens);
  const [activeTab, setActiveTab] = useState("buy");
  const [loadingTokens, setLoadingTokens] = useState(false);

  const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR;
  
  if (!MODULE_ADDR) {
    throw new Error("NEXT_PUBLIC_MODULE_ADDR environment variable is required");
  }
  const GRADUATION_THRESHOLD = 21500;
  const VIRTUAL_APT_RESERVES = 28.24;

  const config = useMemo(() => {
    const nodeUrl = process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    const apiKey = process.env.NEXT_PUBLIC_APTOS_API_KEY;
    
    return new AptosConfig({ 
      network: Network.TESTNET,
      fullnode: nodeUrl,
      ...(apiKey && {
        clientConfig: {
          HEADERS: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      })
    });
  }, []);
  
  const aptos = useMemo(() => new Aptos(config), [config]);

  // Function to get user's token balance
  const getUserTokenBalance = async (faObjectAddr: string): Promise<number> => {
    if (!account?.address) return 0;
    
    try {
      const balance = await aptos.view({
        payload: {
          function: `${MODULE_ADDR}::bonding_curve_pool::get_token_balance`,
          typeArguments: [],
          functionArguments: [account.address, faObjectAddr]
        }
      });
      return Number(balance[0]) / 100000000;
    } catch (error) {
      console.warn(`Could not get user balance for ${faObjectAddr}:`, error);
      return 0;
    }
  };

  // Function to fetch all bonding curve pools from API
  const fetchBondingCurvePools = async () => {
    setLoadingTokens(true);
    try {
      console.log("Fetching tokens from API...");

      const response = await fetch('/api/tokens');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch tokens');
      }

      const apiTokens = result.data;

      console.log("API Tokens:", apiTokens);

      if (!Array.isArray(apiTokens) || apiTokens.length === 0) {
        toast.info("No real tokens found. Showing demo tokens.");
        return;
      }

      const tokenPromises = apiTokens.map(async (token: any) => {
        try {
          console.log(`Processing token: ${token.name} (${token.symbol})`);

          const aptReserves = token.pool_stats ? Number(token.pool_stats.apt_reserves) / 100000000 : 0;
          const isGraduated = token.pool_stats ? token.pool_stats.is_graduated : false;
          const totalVolume = token.pool_stats ? Number(token.pool_stats.total_volume) / 100000000 : 0;
          const tradeCount = token._count ? token._count.trades : 0;

          const userBalance = await getUserTokenBalance(token.address);

          return {
            fa_object_addr: token.address,
            name: token.name,
            symbol: token.symbol,
            apt_reserves: aptReserves,
            token_supply: 1000000000,
            is_graduated: isGraduated,
            creator: token.creator,
            user_balance: userBalance,
            total_volume: totalVolume,
            trade_count: tradeCount,
            icon_uri: token.icon_uri || "",
            project_uri: token.project_uri || ""
          } as TokenInfo;

        } catch (error) {
          console.error(`Error processing token ${token.address}:`, error);
          return null;
        }
      });

      const resolvedTokens = (await Promise.all(tokenPromises))
        .filter((token): token is TokenInfo => token !== null)
        .sort((a, b) => b.apt_reserves - a.apt_reserves);

      console.log("Resolved tokens:", resolvedTokens);
      
      if (resolvedTokens.length > 0) {
        setTokens(resolvedTokens);
        setSelectedToken(resolvedTokens[0]);
        toast.success(`Found ${resolvedTokens.length} bonding curve pools`);
      } else {
        toast.info("No real tokens found. Showing demo tokens.");
      }

    } catch (error: any) {
      console.error("Error fetching bonding curve pools:", error);
      
      if (error.message?.includes("Resource not found") || error.message?.includes("Function not found")) {
        toast.info("Showing demo tokens - Create real tokens in the Launch page.");
      } else {
        toast.info("Showing demo tokens - Network error occurred.");
      }
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    fetchBondingCurvePools();
  }, []);

  // Bonding curve calculation (XYK formula)
  const calculateTokensOut = (aptIn: number, aptReserves: number, tokenSupply: number): number => {
    const x = aptReserves + VIRTUAL_APT_RESERVES;
    const y = tokenSupply;
    return (y * aptIn) / (x + aptIn);
  };

  const calculateAptOut = (tokensIn: number, aptReserves: number, tokenSupply: number): number => {
    const x = aptReserves + VIRTUAL_APT_RESERVES;
    const y = tokenSupply;
    return (x * tokensIn) / (y + tokensIn);
  };

  const graduationProgress = selectedToken 
    ? Math.min((selectedToken.apt_reserves / GRADUATION_THRESHOLD) * 100, 100)
    : 0;

  const estimatedTokens = useMemo(() => {
    if (!selectedToken || !aptAmount || isNaN(Number(aptAmount))) return 0;
    return calculateTokensOut(
      Number(aptAmount), 
      selectedToken.apt_reserves, 
      selectedToken.token_supply
    );
  }, [aptAmount, selectedToken]);

  const estimatedApt = useMemo(() => {
    if (!selectedToken || !tokenAmount || isNaN(Number(tokenAmount))) return 0;
    return calculateAptOut(
      Number(tokenAmount),
      selectedToken.apt_reserves,
      selectedToken.token_supply
    );
  }, [tokenAmount, selectedToken]);

  const handleBuyTokens = async () => {
    if (!account || !selectedToken || !aptAmount) {
      toast.error("Please connect wallet and enter APT amount");
      return;
    }

    if (selectedToken.is_graduated) {
      toast.error("Token has graduated to DEX");
      return;
    }

    setIsLoading(true);
    try {
      const aptInOctas = Math.floor(Number(aptAmount) * 100000000);
      
      console.log(`Buying tokens: ${aptAmount} APT (${aptInOctas} octas) for ${selectedToken.symbol}`);

      const transaction = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDR}::bonding_curve_pool::buy_tokens`,
          typeArguments: [],
          functionArguments: [
            selectedToken.fa_object_addr,
            aptInOctas.toString()
          ],
        },
      });

      const txHash = transaction.hash;
      console.log("Buy transaction submitted:", txHash);

      toast.success("🎉 Purchase successful!", {
        description: `Bought ~${estimatedTokens.toFixed(2)} ${selectedToken.symbol}`,
        duration: 5000
      });

      setAptAmount("");
      setTokenAmount("");
      
      setTimeout(() => {
        fetchBondingCurvePools();
      }, 2000);

    } catch (error: any) {
      console.error("Buy error:", error);
      toast.error("Purchase failed", {
        description: error?.message || "Transaction failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellTokens = async () => {
    if (!account || !selectedToken || !tokenAmount) {
      toast.error("Please connect wallet and enter token amount");
      return;
    }

    if (selectedToken.is_graduated) {
      toast.error("Token has graduated to DEX");
      return;
    }

    if (!selectedToken.user_balance || selectedToken.user_balance < Number(tokenAmount)) {
      toast.error("Insufficient token balance");
      return;
    }

    setIsLoading(true);
    try {
      toast.info("Sell functionality not available", {
        description: "The current bonding curve only supports buying. Selling would need to be added to the smart contract."
      });
      
    } catch (error: any) {
      console.error("Sell error:", error);
      toast.error("Sale failed", {
        description: error?.message || "Transaction failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Background overlay for brightness */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="bg-gradient-primary/20 border-primary/30 text-primary mb-4">
            <BarChart3 className="w-4 h-4 mr-2" />
            Bonding Curve Trading
          </Badge>
          <h2 className="mt-3 text-4xl font-bold text-gradient-primary">Discover & Trade Tokens</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Explore the hottest meme coins and trade on automated bonding curves. Prices increase as more tokens are bought.
          </p>
        </motion.div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={fetchBondingCurvePools}
            disabled={loadingTokens}
            variant="outline"
            className="glass-morphism border-primary/30 hover:border-primary/50"
          >
            {loadingTokens ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Tokens
          </Button>
        </div>

        {/* Token Grid */}
        {loadingTokens ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading bonding curve pools...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Coins className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tokens Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No bonding curve pools found. Create tokens first in the Launch page to start trading.
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {tokens.map((token, index) => (
              <TokenCard 
                key={token.fa_object_addr} 
                token={token} 
                index={index}
                onSelect={() => setSelectedToken(token)}
                isSelected={selectedToken?.fa_object_addr === token.fa_object_addr}
                graduationThreshold={GRADUATION_THRESHOLD}
              />
            ))}
          </motion.div>
        )}

        {/* Trading Modal/Panel */}
        {selectedToken && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedToken(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-lg font-bold">{selectedToken.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedToken.name}</h3>
                      <p className="text-muted-foreground">{selectedToken.symbol}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedToken(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>

                {/* Token Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <p className="text-2xl font-bold text-primary">{selectedToken.apt_reserves.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">APT Reserves</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <p className="text-2xl font-bold text-secondary">{selectedToken.token_supply.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Pool Supply</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <p className="text-2xl font-bold text-accent">{graduationProgress.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">To Graduation</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <p className="text-2xl font-bold text-green-500">
                      {selectedToken.user_balance ? selectedToken.user_balance.toFixed(2) : "0.00"}
                    </p>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                  </div>
                </div>

                {/* Graduation Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to DEX Graduation</span>
                    <span>{GRADUATION_THRESHOLD.toLocaleString()} APT Target</span>
                  </div>
                  <Progress value={graduationProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <Info className="w-3 h-3" />
                    When graduation threshold is reached, remaining tokens are burned and a DEX pool is created
                  </p>
                </div>

                {/* Trading Interface */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-muted/20">
                    <TabsTrigger value="buy" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Sell
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="buy" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="apt-amount">APT Amount</Label>
                        <Input
                          id="apt-amount"
                          type="number"
                          placeholder="0.0"
                          value={aptAmount}
                          onChange={(e) => setAptAmount(e.target.value)}
                          className="bg-muted/20"
                          disabled={selectedToken.is_graduated}
                        />
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div>
                        <Label htmlFor="token-estimate">You'll receive (estimated)</Label>
                        <Input
                          id="token-estimate"
                          value={estimatedTokens.toFixed(6)}
                          readOnly
                          className="bg-muted/10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedToken.symbol} tokens
                        </p>
                      </div>

                      <Button
                        onClick={handleBuyTokens}
                        disabled={isLoading || !aptAmount || selectedToken.is_graduated || !account}
                        className="w-full bg-gradient-primary border-0 neon-glow-pink"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Wallet className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? "Processing..." : `Buy ${selectedToken.symbol}`}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="token-amount">Token Amount</Label>
                        <Input
                          id="token-amount"
                          type="number"
                          placeholder="0.0"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(e.target.value)}
                          className="bg-muted/20"
                          disabled={selectedToken.is_graduated}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedToken.symbol} tokens to sell
                        </p>
                      </div>

                      <div className="flex items-center justify-center">
                        <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div>
                        <Label htmlFor="apt-estimate">You'll receive (estimated)</Label>
                        <Input
                          id="apt-estimate"
                          value={estimatedApt.toFixed(6)}
                          readOnly
                          className="bg-muted/10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">APT</p>
                      </div>

                      <Button
                        onClick={handleSellTokens}
                        disabled={isLoading || !tokenAmount || selectedToken.is_graduated || !account}
                        className="w-full bg-gradient-secondary border-0 neon-glow-cyan"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? "Processing..." : `Sell ${selectedToken.symbol}`}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {selectedToken.is_graduated && (
                  <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30 mt-6">
                    <div className="flex items-center gap-2 text-secondary mb-2">
                      <Target className="w-5 h-5" />
                      <span className="font-semibold">Token Graduated!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This token has reached the graduation threshold and is now available on DEX. 
                      Trading on the bonding curve is no longer available.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Decorative elements */}
      <motion.div
        className="pointer-events-none fixed right-[-120px] top-[20%] w-[260px] h-[260px] rounded-full"
        style={{ background: "radial-gradient(circle at 30% 30%, rgba(0,245,255,0.35), transparent 60%)" }}
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none fixed left-[-120px] bottom-[15%] w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle at 70% 40%, rgba(255,0,110,0.28), transparent 60%)" }}
        animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
    </section>
  );
}

// Token Card Component with NSFW animations
interface TokenCardProps {
  token: TokenInfo;
  index: number;
  onSelect: () => void;
  isSelected: boolean;
  graduationThreshold: number;
}

function TokenCard({ token, index, onSelect, isSelected, graduationThreshold }: TokenCardProps) {
  const graduationProgress = Math.min((token.apt_reserves / graduationThreshold) * 100, 100);
  const isGraduated = token.is_graduated;
  const priceChange = Math.random() > 0.5 ? Math.random() * 50 : -Math.random() * 30; // Mock price change
  const timeAgo = `${Math.floor(Math.random() * 60)}m ago`;
  const marketCap = `$${(token.apt_reserves * 10).toFixed(1)}K`; // Mock market cap

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        rotateX: 2,
        rotateY: 2,
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 group liquid-glass ${
        isSelected
          ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 neon-glow-pink shadow-xl"
          : "border-slate-600/50 hover:border-cyan-400/50 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-md hover:from-cyan-500/10 hover:to-pink-500/10"
      }`}
      onClick={onSelect}
      style={{
        background: isSelected 
          ? "linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(236,72,153,0.15) 100%)"
          : "linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(51,65,85,0.8) 100%)",
        backdropFilter: "blur(12px)",
        border: isSelected 
          ? "1px solid rgba(34,211,238,0.5)"
          : "1px solid rgba(100,116,139,0.3)"
      }}
    >
      {/* NSFW Wiggle Animation */}
      <motion.div
        animate={{
          rotate: [0, 1, -1, 0],
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="p-4"
      >
        {/* Header with token icon and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/40 to-pink-400/40 flex items-center justify-center relative overflow-hidden shadow-lg"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              {token.icon_uri ? (
                <Image
                  src={token.icon_uri}
                  alt={token.symbol}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-200 to-pink-200 bg-clip-text text-transparent">
                  {token.symbol.charAt(0)}
                </span>
              )}
              
              {/* Animated ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner glow */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-400/20 to-pink-400/20 blur-sm" />
            </motion.div>
            <div>
              <h3 className="font-bold text-sm truncate max-w-[100px] text-slate-100">{token.symbol}</h3>
              <p className="text-xs text-slate-400 truncate max-w-[100px]">{token.name}</p>
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex flex-col items-end gap-1">
            {isGraduated && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <Target className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Market Cap</span>
            <span className="text-sm font-semibold text-slate-200">{marketCap}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Price Change</span>
            <span className={`text-sm font-semibold flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Graduation Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Progress
            </span>
            <span>{graduationProgress.toFixed(1)}%</span>
          </div>
          <Progress value={graduationProgress} className="h-2" />
        </div>
      </motion.div>
    </motion.div>
  );
}
