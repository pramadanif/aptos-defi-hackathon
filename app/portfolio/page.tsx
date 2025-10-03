"use client";

import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader as UITableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, ExternalLink, Globe, Image as ImageIcon, Sparkles, Zap, Activity } from "lucide-react";
import { toast } from "sonner";

interface Asset {
  name: string;
  symbol: string;
  logo: string;
  fallback: string;
  amount: number;
  decimals: number;
  valueUSD: number;
  coinType: string;
  category: string;
  iconUri?: string;
  projectUri?: string;
  currentPrice?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
}

interface CoinInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export default function PortfolioPage() {
  useEffect(() => {
    document.title = "Portfolio | ArgoPump";
  }, []);

  const { account, connected } = useWallet();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);

  // Initialize Aptos client - sesuaikan dengan provider (TESTNET)
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Function to get balance using direct API endpoint
  const getBalanceFromAPI = async (address: string, assetType: string): Promise<string> => {
    try {
      // Clean address - remove 0x prefix if present for URL
      const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
      
      const response = await fetch(
        `https://api.testnet.aptoslabs.com/v1/accounts/${cleanAddress}/balance/${encodeURIComponent(assetType)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json, application/x-bcs'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return "0"; // Asset not found means 0 balance
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // The API returns a simple number as text (e.g., "96394200")
      const balanceText = await response.text();
      const balance = balanceText.trim().replace(/"/g, ''); // Remove quotes if present
      
      console.log(`Balance for ${assetType}: ${balance}`);
      return balance || "0";
    } catch (error) {
      console.warn(`Failed to get balance for ${assetType}:`, error);
      return "0";
    }
  };

  // Function to get coin info from coin type or fungible asset
  const getCoinInfo = async (assetType: string): Promise<CoinInfo> => {
    try {
      // For APT coin
      if (assetType === "0x1::aptos_coin::AptosCoin") {
        return {
          name: "Aptos",
          symbol: "APT",
          decimals: 8
        };
      }

      // Check if it's a fungible asset (FA) object address
      if (assetType.startsWith("0x") && assetType.length === 66 && !assetType.includes("::")) {
        try {
          // Try to get FA metadata using view function
          const metadataResponse = await aptos.view({
            payload: {
              function: "0x1::fungible_asset::name",
              typeArguments: [],
              functionArguments: [assetType]
            }
          });
          
          const symbolResponse = await aptos.view({
            payload: {
              function: "0x1::fungible_asset::symbol", 
              typeArguments: [],
              functionArguments: [assetType]
            }
          });

          const decimalsResponse = await aptos.view({
            payload: {
              function: "0x1::fungible_asset::decimals",
              typeArguments: [],
              functionArguments: [assetType]
            }
          });
          
          return {
            name: metadataResponse[0] as string,
            symbol: symbolResponse[0] as string,
            decimals: decimalsResponse[0] as number
          };
        } catch (faError) {
          console.log(`Could not get FA metadata for ${assetType}:`, faError);
        }
      }

      // Try to get coin info from blockchain (for legacy coins)
      const moduleAddress = assetType.split("::")[0];
      const resource = await aptos.getAccountResource({
        accountAddress: moduleAddress,
        resourceType: `0x1::coin::CoinInfo<${assetType}>`
      });

      const coinData = resource.data as any;
      return {
        name: coinData.name,
        symbol: coinData.symbol,
        decimals: coinData.decimals
      };
    } catch (error) {
      console.log(`Could not get asset info for ${assetType}:`, error);
      // Fallback for unknown assets
      const parts = assetType.split("::");
      const symbol = parts[parts.length - 1] || assetType.substring(0, 8);
      return {
        name: symbol,
        symbol: symbol.toUpperCase(),
        decimals: 8
      };
    }
  };

  // Function to get USD price dengan price change
  const getUSDPrice = async (coinType: string): Promise<{ price: number; change24h: number }> => {
    // For APT
    if (coinType === "0x1::aptos_coin::AptosCoin") {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        return {
          price: data.aptos?.usd || 8.5,
          change24h: data.aptos?.usd_24h_change || 0
        };
      } catch {
        return { price: 8.5, change24h: 0 };
      }
    }
    // For other coins
    return { price: 0.001, change24h: 0 };
  };

  // Function to determine asset category
  const getAssetCategory = (coinType: string, symbol: string, name: string): string => {
    if (coinType === "0x1::aptos_coin::AptosCoin" || symbol.includes("APT")) {
      return "aptos";
    }
    
    const lowerSymbol = symbol.toLowerCase();
    const lowerName = name.toLowerCase();
    
    if (lowerSymbol.includes("dog") || 
        lowerSymbol.includes("pepe") ||
        lowerSymbol.includes("meme") ||
        lowerName.includes("dog") ||
        lowerName.includes("pepe") ||
        lowerName.includes("meme")) {
      return "meme";
    }
    
    return "other";
  };

  // Function to get asset logo
  const getAssetLogo = (category: string, symbol: string): string => {
    if (category === "aptos") {
      return "/tokens/apt.svg";
    } else if (category === "meme") {
      return `/tokens/${symbol.toLowerCase()}.svg`;
    }
    return "/tokens/default.svg";
  };

  // Function to fetch wallet assets using direct balance API
  const fetchAssets = async () => {
    if (!account?.address) {
      toast.error("No wallet address found");
      return;
    }

    setLoading(true);
    try {
      const address = account.address.toString();
      console.log("Fetching assets for:", address);
      console.log("API will use address format:", address.startsWith('0x') ? address.slice(2) : address);

      // List of known asset types to check
      const knownAssets = [
        "0x1::aptos_coin::AptosCoin", // APT
      ];

      // Get ArgoPump tokens from Prisma database
      try {
        console.log("Fetching ArgoPump tokens from database...");
        
        const tokensResponse = await fetch('/api/tokens');
        const tokensData = await tokensResponse.json();
        
        if (tokensData.success && Array.isArray(tokensData.data)) {
          const bullPumpTokens = tokensData.data.map((token: any) => token.address);
          knownAssets.push(...bullPumpTokens);
          console.log("Added ArgoPump tokens from database:", bullPumpTokens);
        }
      } catch (dbError) {
        console.warn("Could not fetch ArgoPump tokens from database:", dbError);
      }

      // Also check account resources for other coins
      try {
        const resources = await aptos.getAccountResources({
          accountAddress: address,
        });

        const coinStores = resources.filter((resource: any) => {
          const type = typeof resource.type === "string" ? resource.type : resource.type?.name;
          return type?.startsWith("0x1::coin::CoinStore");
        });

        coinStores.forEach((coinStore: any) => {
          const type = typeof coinStore.type === "string" ? coinStore.type : coinStore.type?.name;
          const coinTypeMatch = type.match(/0x1::coin::CoinStore<(.+)>/);
          const coinType = coinTypeMatch ? coinTypeMatch[1] : undefined;
          
          if (coinType && !knownAssets.includes(coinType)) {
            knownAssets.push(coinType);
          }
        });
      } catch (resourceError) {
        console.warn("Could not fetch account resources:", resourceError);
      }

      console.log("Checking balances for assets:", knownAssets);

      // Fetch balances for all known assets
      const assetPromises = knownAssets.map(async (assetType) => {
        try {
          console.log(`Checking balance for: ${assetType}`);
          const balanceRaw = await getBalanceFromAPI(address, assetType);
          
          if (balanceRaw === "0") {
            console.log(`No balance for ${assetType}`);
            return null;
          }

          console.log(`✅ Asset ${assetType} balance: ${balanceRaw}`);

          const coinInfo = await getCoinInfo(assetType);
          const priceData = await getUSDPrice(assetType);

          const amount = Number(balanceRaw) / Math.pow(10, coinInfo.decimals);
          const valueUSD = amount * priceData.price;

          // Get additional metadata for ArgoPump tokens from database
          let iconUri = "";
          let projectUri = "";
          let currentPrice = priceData.price;
          
          // Ensure assetType is a string
          const assetTypeStr = typeof assetType === 'string' ? assetType : String(assetType);
          
          if (assetTypeStr.startsWith("0x") && assetTypeStr.length === 66 && !assetTypeStr.includes("::")) {
            try {
              console.log(`Fetching metadata for token: ${assetTypeStr}`);
              
              // Try to get metadata from database first
              const tokenResponse = await fetch(`/api/tokens/${assetTypeStr}`);
              console.log(`Database response status: ${tokenResponse.status}`);
              
              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                console.log(`Database token data:`, tokenData);
                
                if (tokenData.success && tokenData.data) {
                  // Update coin info with database data
                  coinInfo.name = tokenData.data.name || coinInfo.name;
                  coinInfo.symbol = tokenData.data.symbol || coinInfo.symbol;
                  coinInfo.decimals = tokenData.data.decimals || coinInfo.decimals;
                  
                  iconUri = tokenData.data.icon_uri || "";
                  projectUri = tokenData.data.project_uri || "";
                  
                  // Calculate price from pool stats
                  if (tokenData.data.pool_stats?.apt_reserves) {
                    const aptReserves = Number(tokenData.data.pool_stats.apt_reserves) / 1e8;
                    const virtualTokenReserves = 1000000000; // 1B tokens
                    currentPrice = (aptReserves / virtualTokenReserves) * priceData.price;
                    console.log(`Calculated price from pool: ${currentPrice}`);
                  }
                  
                  console.log(`✅ Metadata loaded from database for ${coinInfo.symbol}`);
                }
              } else {
                console.log(`Database lookup failed, trying blockchain...`);
                // Fallback to blockchain metadata if not in database
                const [iconResponse, projectResponse] = await Promise.all([
                  aptos.view({
                    payload: {
                      function: "0x1::fungible_asset::icon_uri",
                      typeArguments: [],
                      functionArguments: [assetTypeStr]
                    }
                  }).catch(() => [""]),
                  aptos.view({
                    payload: {
                      function: "0x1::fungible_asset::project_uri",
                      typeArguments: [],
                      functionArguments: [assetTypeStr]
                    }
                  }).catch(() => [""]),
                ]);
                
                iconUri = iconResponse[0] as string || "";
                projectUri = projectResponse[0] as string || "";
                console.log(`✅ Metadata loaded from blockchain for ${assetTypeStr}`);
              }
            } catch (metaError) {
              console.warn(`Could not get metadata for ${assetTypeStr}:`, metaError);
            }
          }

          return {
            name: coinInfo.name,
            symbol: coinInfo.symbol,
            logo: iconUri || `/tokens/${coinInfo.symbol.toLowerCase()}.svg`,
            fallback: coinInfo.symbol.charAt(0).toUpperCase(),
            amount,
            decimals: coinInfo.decimals,
            valueUSD: amount * currentPrice,
            coinType: assetType,
            category: getAssetCategory(assetType, coinInfo.symbol, coinInfo.name),
            iconUri,
            projectUri,
            currentPrice,
            priceChange24h: priceData.change24h,
          } as Asset;
        } catch (error) {
          console.error(`Error processing asset ${assetType}:`, error);
          return null;
        }
      });

      const resolvedAssets = (await Promise.all(assetPromises))
        .filter((asset): asset is Asset => asset !== null)
        .sort((a, b) => b.valueUSD - a.valueUSD);

      console.log("Processed assets:", resolvedAssets);

      setAssets(resolvedAssets);
      const totalVal = resolvedAssets.reduce((sum, asset) => sum + asset.valueUSD, 0);
      setTotalValue(totalVal);

      toast.success(`Found ${resolvedAssets.length} assets in wallet`);
    } catch (error) {
      console.error("Portfolio fetch error:", error);
      toast.error("Failed to load portfolio: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on wallet connection
  useEffect(() => {
    if (connected && account?.address) {
      fetchAssets();
    } else {
      setAssets([]);
      setTotalValue(0);
      setPriceChange24h(0);
    }
  }, [connected, account?.address]);

  const aptosAssets = assets.filter(asset => asset.category === "aptos");
  const memeCoins = assets.filter(asset => asset.category === "meme");
  const otherAssets = assets.filter(asset => asset.category === "other");

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative z-10 py-10">
        <div className="container mx-auto px-4 space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gradient-primary">Your Portfolio</h2>
                {connected && account?.address && (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-muted-foreground font-mono">
                      {String(account.address).slice(0, 6)}...{String(account.address).slice(-6)}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold">
                        Total Value: <span className="text-green-600">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </p>
                      {priceChange24h !== 0 && (
                        <div className={`flex items-center gap-1 text-sm ${priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {priceChange24h >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                          {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gradient-primary/20 border-primary/30 text-primary">
                  Aptos Testnet
                </Badge>
                {connected && account?.address && (
                  <Button
                    onClick={fetchAssets}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    {!loading && "Refresh"}
                  </Button>
                )}
              </div>
            </div>
            
            {!connected ? (
              <p className="text-muted-foreground mt-2">Connect your wallet using the button in the header to view your portfolio.</p>
            ) : !account?.address ? (
              <p className="text-muted-foreground mt-2">Please ensure your wallet is properly connected.</p>
            ) : null}
          </motion.div>

          {/* Portfolio Content */}
          {!connected || !account?.address ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card className="liquid-glass">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="size-16 rounded-full bg-gradient-primary/20 flex items-center justify-center mb-4">
                    <TrendingUp className="size-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Portfolio Dashboard</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Connect your Aptos wallet to view your real-time portfolio, including APT tokens, staked assets, and other coins.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : loading ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card className="liquid-glass">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="size-12 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Loading Portfolio</h3>
                  <p className="text-muted-foreground">Fetching your assets from the Aptos blockchain...</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : assets.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card className="liquid-glass">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <TrendingDown className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
                  <p className="text-muted-foreground text-center">
                    Your wallet doesn't contain any assets, or they're not yet supported.
                  </p>
                  <Button onClick={fetchAssets} variant="outline" className="mt-4">
                    <RefreshCw className="size-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Portfolio Overview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card className="liquid-glass bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-300 mb-1">Total Assets</p>
                        <p className="text-2xl font-bold text-white">{assets.length}</p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-500/20">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="liquid-glass bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-300 mb-1">Portfolio Value</p>
                        <p className="text-2xl font-bold text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="p-3 rounded-full bg-green-500/20">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="liquid-glass bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-300 mb-1">ArgoPump Tokens</p>
                        <p className="text-2xl font-bold text-white">{otherAssets.length}</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-500/20">
                        <Zap className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Assets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aptos Assets */}
              {aptosAssets.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                  <Card className="liquid-glass bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border-orange-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                          <Activity className="w-5 h-5 text-orange-400" />
                        </div>
                        Aptos Assets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {aptosAssets.map((asset) => (
                          <motion.div 
                            key={asset.coinType}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="size-12">
                                  <AvatarImage src={asset.logo} alt={asset.symbol} />
                                  <AvatarFallback className="bg-orange-500/20 text-orange-300">{asset.fallback}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-lg">{asset.symbol}</p>
                                  <p className="text-sm text-muted-foreground">{asset.name}</p>
                                  {asset.currentPrice && (
                                    <p className="text-xs text-green-400">
                                      ${asset.currentPrice.toFixed(6)} per token
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold">
                                  {asset.amount.toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: asset.amount < 1 ? 6 : 2 
                                  })}
                                </p>
                                <p className="text-sm text-green-400">
                                  ${asset.valueUSD.toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                  })}
                                </p>
                                {asset.priceChange24h !== undefined && asset.priceChange24h !== 0 && (
                                  <div className={`flex items-center justify-end gap-1 text-xs ${
                                    asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {asset.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}


              {/* ArgoPump Tokens */}
              {otherAssets.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                  <Card className="liquid-glass bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Zap className="w-5 h-5 text-purple-400" />
                        </div>
                        ArgoPump Tokens
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {otherAssets.map((asset) => (
                          <motion.div 
                            key={asset.coinType}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <Avatar className="size-12">
                                  <AvatarImage src={asset.iconUri || asset.logo} alt={asset.symbol} />
                                  <AvatarFallback className="bg-purple-500/20 text-purple-300">{asset.fallback}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-lg">{asset.symbol}</p>
                                  <p className="text-sm text-muted-foreground">{asset.name}</p>
                                  {asset.currentPrice && (
                                    <p className="text-xs text-green-400">
                                      ${asset.currentPrice.toFixed(8)} per token
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold">
                                  {asset.amount.toLocaleString(undefined, { 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 0 
                                  })}
                                </p>
                                <p className="text-sm text-green-400">
                                  ${asset.valueUSD.toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            {/* Token Metadata */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                              {asset.iconUri && (
                                <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300">
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  Icon
                                </Badge>
                              )}
                              {asset.projectUri && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-green-500/10 border-green-500/30 text-green-300 cursor-pointer hover:bg-green-500/20 transition-colors"
                                  onClick={() => window.open(asset.projectUri, '_blank')}
                                >
                                  <Globe className="w-3 h-3 mr-1" />
                                  Website
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300">
                                {asset.decimals} decimals
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}