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
import { Loader2, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
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
}

interface CoinInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export default function PortfolioPage() {
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

      // Get BullPump tokens from registry
      const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR || "0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257";
      
      try {
        const registry = await aptos.view({
          payload: {
            function: `${MODULE_ADDR}::token_factory::get_registry`,
            typeArguments: [],
            functionArguments: []
          }
        });
        
        // Add BullPump tokens to known assets
        if (Array.isArray(registry[0])) {
          const bullPumpTokens = registry[0] as string[];
          knownAssets.push(...bullPumpTokens);
          console.log("Found BullPump tokens:", bullPumpTokens);
        }
      } catch (registryError) {
        console.warn("Could not fetch BullPump registry:", registryError);
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

          return {
            name: coinInfo.name,
            symbol: coinInfo.symbol,
            logo: `/tokens/${coinInfo.symbol.toLowerCase()}.svg`,
            fallback: coinInfo.symbol.charAt(0).toUpperCase(),
            amount,
            decimals: coinInfo.decimals,
            valueUSD,
            coinType: assetType,
            category: getAssetCategory(assetType, coinInfo.symbol, coinInfo.name),
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Aptos Assets */}
              {aptosAssets.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                  <Card className="liquid-glass">
                    <CardHeader>
                      <CardTitle>Aptos Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <UITableHeader>
                          <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Value (USD)</TableHead>
                          </TableRow>
                        </UITableHeader>
                        <TableBody>
                          {aptosAssets.map((asset) => (
                            <TableRow key={asset.coinType}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8">
                                    <AvatarImage src={asset.logo} alt={asset.symbol} />
                                    <AvatarFallback>{asset.fallback}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{asset.symbol}</p>
                                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {asset.amount.toLocaleString(undefined, { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: asset.amount < 1 ? 6 : 2 
                                })}
                              </TableCell>
                              <TableCell className="text-right">
                                ${asset.valueUSD.toLocaleString(undefined, { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Meme Coins */}
              {memeCoins.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                  <Card className="liquid-glass">
                    <CardHeader>
                      <CardTitle>Meme Coins</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <UITableHeader>
                          <TableRow>
                            <TableHead>Token</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Value (USD)</TableHead>
                          </TableRow>
                        </UITableHeader>
                        <TableBody>
                          {memeCoins.map((asset) => (
                            <TableRow key={asset.coinType}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8">
                                    <AvatarImage src={asset.logo} alt={asset.symbol} />
                                    <AvatarFallback>{asset.fallback}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{asset.symbol}</p>
                                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {asset.amount.toLocaleString(undefined, { 
                                  minimumFractionDigits: 0, 
                                  maximumFractionDigits: 0 
                                })}
                              </TableCell>
                              <TableCell className="text-right">
                                ${asset.valueUSD.toLocaleString(undefined, { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Other Assets */}
              {otherAssets.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                  <Card className="liquid-glass">
                    <CardHeader>
                      <CardTitle>Other Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <UITableHeader>
                          <TableRow>
                            <TableHead>Token</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Value (USD)</TableHead>
                          </TableRow>
                        </UITableHeader>
                        <TableBody>
                          {otherAssets.map((asset) => (
                            <TableRow key={asset.coinType}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8">
                                    <AvatarImage src={asset.logo} alt={asset.symbol} />
                                    <AvatarFallback>{asset.fallback}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{asset.symbol}</p>
                                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {asset.amount.toLocaleString(undefined, { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: asset.amount < 1 ? 6 : 2 
                                })}
                              </TableCell>
                              <TableCell className="text-right">
                                ${asset.valueUSD.toLocaleString(undefined, { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}