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
  Info
} from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

interface TokenInfo {
  name: string;
  symbol: string;
  fa_object_addr: string;
  apt_reserves: number;
  token_supply: number;
  is_graduated: boolean;
  creator: string;
  user_balance?: number;
}

export function BondingCurveTrading() {
  const { account, signAndSubmitTransaction } = useWallet() as any;
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [aptAmount, setAptAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [activeTab, setActiveTab] = useState("buy");
  const [loadingTokens, setLoadingTokens] = useState(false);

  const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR || "0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257";
  const GRADUATION_THRESHOLD = 21500; // 21,500 APT
  const VIRTUAL_APT_RESERVES = 28.24; // 28_24_000000 octas = 28.24 APT

  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Function to get user's token balance
  const getUserTokenBalance = async (faObjectAddr: string): Promise<number> => {
    if (!account?.address) return 0;
    
    try {
      const faAddrString = faObjectAddr.toString();
      const userAddrString = account.address.toString();
      
      const balance = await aptos.view({
        payload: {
          function: `${MODULE_ADDR}::bonding_curve_pool::get_token_balance`,
          typeArguments: [],
          functionArguments: [userAddrString, faAddrString]
        }
      });
      return Number(balance[0]) / 100000000; // Convert to readable units
    } catch (error) {
      console.warn(`Could not get user balance for ${faObjectAddr}:`, error);
      return 0;
    }
  };

  // Function to fetch all bonding curve pools from blockchain
  const fetchBondingCurvePools = async () => {
    if (!MODULE_ADDR || MODULE_ADDR.includes("_HERE")) {
      toast.error("Module address not configured");
      return;
    }

    setLoadingTokens(true);
    try {
      console.log("Fetching bonding curve pools from:", MODULE_ADDR);

      // First, get all tokens from the token factory registry
      const registry = await aptos.view({
        payload: {
          function: `${MODULE_ADDR}::token_factory::get_registry`,
          typeArguments: [],
          functionArguments: []
        }
      });

      console.log("Token registry:", registry);

      if (!Array.isArray(registry[0]) || registry[0].length === 0) {
        setTokens([]);
        toast.info("No tokens found. Create tokens first in the Launch page.");
        return;
      }

      const faObjects = registry[0] as string[];
      console.log("Found FA objects:", faObjects);

      // For each FA object, get pool data and metadata
      const tokenPromises = faObjects.map(async (faObjectAddr: string) => {
        try {
          console.log(`Processing FA object: ${faObjectAddr}`);
          console.log(`FA object type: ${typeof faObjectAddr}`);
          console.log(`FA object length: ${faObjectAddr.length}`);

          // Validate the FA object address format
          if (!faObjectAddr || typeof faObjectAddr !== 'string') {
            console.error(`Invalid FA object address: ${faObjectAddr}`);
            return null;
          }

          // Ensure it's a valid hex address
          const faAddrString = faObjectAddr.toString().trim();
          if (!faAddrString.startsWith('0x') || faAddrString.length !== 66) {
            console.error(`Invalid hex format for FA address: ${faAddrString}`);
            return null;
          }

          console.log(`Checking APT reserves for: ${faAddrString}`);
          
          // Get APT reserves using view function
          let aptReserves = 0;
          let isGraduated = false;
          
          try {
            const aptReservesResult = await aptos.view({
              payload: {
                function: `${MODULE_ADDR}::bonding_curve_pool::get_apt_reserves`,
                typeArguments: [],
                functionArguments: [faAddrString]
              }
            });
            aptReserves = Number(aptReservesResult[0]) / 100000000; // Convert octas to APT
            console.log(`✅ APT reserves for ${faAddrString}: ${aptReserves} APT`);
          } catch (reserveError) {
            console.warn(`❌ No pool found for ${faAddrString}:`, reserveError);
            // Instead of skipping, let's still show the token but indicate no pool
            aptReserves = 0;
            console.log(`Token ${faAddrString} exists but has no bonding curve pool yet`);
          }

          // Get token metadata using view functions
          
          const nameResult = await aptos.view({
            payload: {
              function: "0x1::fungible_asset::name",
              typeArguments: [],
              functionArguments: [faAddrString]
            }
          });

          const symbolResult = await aptos.view({
            payload: {
              function: "0x1::fungible_asset::symbol",
              typeArguments: [],
              functionArguments: [faAddrString]
            }
          });

          // Get current token supply in the pool (remaining tokens)
          const poolStore = await aptos.view({
            payload: {
              function: "0x1::primary_fungible_store::balance",
              typeArguments: [],
              functionArguments: [MODULE_ADDR, faAddrString]
            }
          });

          const tokenSupply = Number(poolStore[0]) / 100000000; // Convert to readable units

          // Check if graduated
          isGraduated = aptReserves >= GRADUATION_THRESHOLD;

          // Get user balance if wallet is connected
          const userBalance = await getUserTokenBalance(faAddrString);

          return {
            name: nameResult[0] as string,
            symbol: symbolResult[0] as string,
            fa_object_addr: faObjectAddr,
            apt_reserves: aptReserves,
            token_supply: tokenSupply,
            is_graduated: isGraduated,
            creator: "Unknown", // We don't have easy access to creator from view functions
            user_balance: userBalance
          } as TokenInfo;

        } catch (error) {
          console.error(`Error processing token ${faObjectAddr}:`, error);
          return null;
        }
      });

      const resolvedTokens = (await Promise.all(tokenPromises))
        .filter((token): token is TokenInfo => token !== null)
        .sort((a, b) => b.apt_reserves - a.apt_reserves); // Sort by APT reserves descending

      console.log("Resolved tokens:", resolvedTokens);
      setTokens(resolvedTokens);
      
      if (resolvedTokens.length > 0) {
        setSelectedToken(resolvedTokens[0]);
        toast.success(`Found ${resolvedTokens.length} bonding curve pools`);
      } else {
        toast.info("No active bonding curve pools found");
      }

    } catch (error: any) {
      console.error("Error fetching bonding curve pools:", error);
      
      if (error.message?.includes("Resource not found") || error.message?.includes("Function not found")) {
        setTokens([]);
        toast.info("No bonding curve pools created yet. Create tokens first in the Launch page.");
      } else {
        toast.error("Failed to fetch bonding curve pools", {
          description: error.message || "Unknown error"
        });
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

    if (selectedToken.apt_reserves === 0) {
      toast.error("No bonding curve pool available for this token");
      return;
    }

    if (selectedToken.is_graduated) {
      toast.error("Token has graduated to DEX");
      return;
    }

    setIsLoading(true);
    try {
      const aptInOctas = Math.floor(Number(aptAmount) * 100000000); // Convert APT to octas
      
      console.log(`Buying tokens: ${aptAmount} APT (${aptInOctas} octas) for ${selectedToken.symbol}`);

      const transaction = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDR}::bonding_curve_pool::buy_tokens`,
          typeArguments: [],
          functionArguments: [
            selectedToken.fa_object_addr, // fa_obj_addr: address
            aptInOctas.toString()          // amount: u64 (in octas)
          ],
        },
      });

      const txHash = transaction.hash;
      console.log("Buy transaction submitted:", txHash);

      toast.success("🎉 Purchase successful!", {
        description: `Bought ~${estimatedTokens.toFixed(2)} ${selectedToken.symbol}`,
        duration: 5000
      });

      // Reset form and refresh pool data
      setAptAmount("");
      setTokenAmount("");
      
      // Refresh pool data after a short delay
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

    // Check if user has enough tokens
    if (!selectedToken.user_balance || selectedToken.user_balance < Number(tokenAmount)) {
      toast.error("Insufficient token balance");
      return;
    }

    setIsLoading(true);
    try {
      // Note: Sell functionality is not implemented in the current smart contract
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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="bg-gradient-primary/20 border-primary/30 text-primary">
            <BarChart3 className="w-4 h-4 mr-2" />
            Bonding Curve
          </Badge>
          <h2 className="mt-3 text-3xl font-bold text-gradient-primary">Trade on Bonding Curves</h2>
          <p className="mt-2 text-muted-foreground">
            Buy and sell tokens with automated market making. Prices increase as more tokens are bought.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token Selection */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
          >
            <Card className="liquid-glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-primary" />
                    Available Tokens
                  </div>
                  <Button
                    onClick={fetchBondingCurvePools}
                    disabled={loadingTokens}
                    variant="outline"
                    size="sm"
                  >
                    {loadingTokens ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingTokens ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Loading bonding curve pools...</p>
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Coins className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      No bonding curve pools found.<br />
                      Create tokens first in the Launch page.
                    </p>
                  </div>
                ) : (
                  tokens.map((token) => (
                    <motion.div
                      key={token.fa_object_addr}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedToken?.fa_object_addr === token.fa_object_addr
                          ? "border-primary bg-primary/10 neon-glow-pink"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedToken(token)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{token.symbol}</h4>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                        {token.user_balance && token.user_balance > 0 && (
                          <p className="text-xs text-primary font-medium">
                            You own: {token.user_balance.toFixed(2)} {token.symbol}
                          </p>
                        )}
                        {token.apt_reserves === 0 && (
                          <p className="text-xs text-yellow-500 font-medium">
                            No bonding curve pool
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{token.apt_reserves.toFixed(2)} APT</p>
                        <p className="text-xs text-muted-foreground">Reserves</p>
                      </div>
                    </div>
                    
                    {/* Graduation Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress to DEX</span>
                        <span>{((token.apt_reserves / GRADUATION_THRESHOLD) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(token.apt_reserves / GRADUATION_THRESHOLD) * 100} 
                        className="h-2"
                      />
                    </div>

                    {token.is_graduated && (
                      <Badge variant="secondary" className="mt-2">
                        <Target className="w-3 h-3 mr-1" />
                        Graduated
                      </Badge>
                    )}
                  </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trading Interface */}
          <motion.div 
            className="lg:col-span-2" 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
          >
            <Card className="liquid-glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5 text-primary" />
                    Trade {selectedToken?.symbol || "Token"}
                  </div>
                  {selectedToken && (
                    <Badge variant={selectedToken.is_graduated ? "secondary" : "default"}>
                      {selectedToken.is_graduated ? "Graduated" : "Active"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedToken ? (
                  <div className="space-y-6">
                    {/* Token Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/20">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{selectedToken.apt_reserves.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">APT Reserves</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">{selectedToken.token_supply.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Pool Supply</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent">{graduationProgress.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">To Graduation</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">
                          {selectedToken.user_balance ? selectedToken.user_balance.toFixed(2) : "0.00"}
                        </p>
                        <p className="text-sm text-muted-foreground">Your Balance</p>
                      </div>
                    </div>

                    {/* Graduation Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to DEX Graduation</span>
                        <span>{GRADUATION_THRESHOLD.toLocaleString()} APT Target</span>
                      </div>
                      <Progress value={graduationProgress} className="h-3" />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        When graduation threshold is reached, remaining tokens are burned and a DEX pool is created
                      </p>
                    </div>

                    {/* Trading Tabs */}
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
                            disabled={isLoading || !aptAmount || selectedToken.is_graduated || !account || selectedToken.apt_reserves === 0}
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

                    {selectedToken.apt_reserves === 0 && (
                      <div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                        <div className="flex items-center gap-2 text-yellow-600 mb-2">
                          <Info className="w-5 h-5" />
                          <span className="font-semibold">No Bonding Curve Pool</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This token exists but doesn't have a bonding curve pool yet. 
                          The pool needs to be initialized when the token is created.
                        </p>
                      </div>
                    )}

                    {selectedToken.is_graduated && (
                      <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30">
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
                ) : (
                  <div className="text-center py-12">
                    <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a token to start trading</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
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
