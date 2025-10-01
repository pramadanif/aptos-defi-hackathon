"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  Globe,
  Users,
  Activity,
  DollarSign,
  Clock,
  BarChart3,
  Loader2,
  ArrowLeft,
  Rocket,
  Zap,
  Sparkles,
  Star,
  Wallet,
  ArrowUpDown,
  Info,
  Target
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Utility functions
const formatNumber = (value: string | number, decimals = 2) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  
  // For balance display, use comma separators without suffix
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

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

const formatAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

interface TokenDetail {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  decimals: number;
  max_supply: string | null;
  icon_uri: string | null;
  project_uri: string | null;
  mint_fee_per_unit: string;
  created_at: string;
  pool_stats: {
    apt_reserves: string;
    total_volume: string;
    trade_count: number;
    is_graduated: boolean;
    graduation_threshold: string;
    updated_at: string;
  } | null;
  trades: Array<{
    id: string;
    transaction_hash: string;
    user_address: string;
    apt_amount: string;
    token_amount: string;
    price_per_token: string;
    created_at: string;
  }>;
  volume_24h: string;
  trade_count_24h: number;
}

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
  dex_pool_addr?: string;
}

interface CoinInfo {
  name: string;
  symbol: string;
  decimals: number;
}

// Spectacular Text Animation Component
function SpectacularText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.div className={`relative ${className}`}>
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/30 to-pink-500/20 blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main text */}
      <motion.span
        className="relative z-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-black"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: "200% 200%",
          textShadow: "0 0 30px rgba(139, 69, 199, 0.5)"
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

// Elegant Info Ticker Component
function InfoTicker({ token }: { token: TokenDetail }) {
  const tickerItems = [
    {
      label: "Volume 24h",
      value: `${formatCompactNumber(Number(token.pool_stats?.total_volume || 0) / 1e8, 2)} APT`,
      icon: "📊"
    },
    {
      label: "Total Trades",
      value: formatCompactNumber(token.pool_stats?.trade_count || 0, 0),
      icon: "⚡"
    },
    {
      label: "Progress",
      value: `${((Number(token.pool_stats?.apt_reserves || 0) / Number(token.pool_stats?.graduation_threshold || 1)) * 100).toFixed(1)}%`,
      icon: "🎯"
    },
    {
      label: "Creator",
      value: formatAddress(token.creator),
      icon: "👤"
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900/30 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-white/5 rounded-lg py-2 mb-6">
      {/* Very subtle background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-transparent to-cyan-500/3"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(2)].map((_, setIndex) => (
          <div key={setIndex} className="flex items-center">
            {tickerItems.map((item, index) => (
              <motion.div
                key={`${setIndex}-${index}`}
                className="inline-flex items-center mx-8 group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-white/3 border border-white/5 group-hover:border-white/10 transition-all duration-300">
                  <span className="text-xs opacity-60">{item.icon}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/50 text-xs font-medium">
                      {item.label}:
                    </span>
                    <span className="text-white font-medium text-xs">
                      {item.value}
                    </span>
                  </div>
                </div>

                {/* Minimal separator */}
                <div className="ml-6 w-px h-3 bg-white/10" />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Stats Card Component
function EnhancedStatsCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  delay = 0
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{
        y: -8,
        scale: 1.05,
        rotateY: 5,
        boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.4)"
      }}
      className="relative overflow-hidden"
    >
      <Card className={`${gradient} backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-500 relative`}>
        {/* Animated background particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`
            }}
          />
        ))}

        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium mb-1">{title}</p>
              <motion.p
                className="text-xl font-bold text-white mb-1"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {value}
              </motion.p>
              <p className="text-white/60 text-xs">{subtitle}</p>
            </div>
            <motion.div
              className="bg-white/20 p-2 rounded-lg"
              whileHover={{
                rotate: 360,
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,0.3)"
              }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-5 h-5 text-white">
                {icon}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CoinDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const { account, signAndSubmitTransaction } = useWallet() as any;
  const GRADUATION_THRESHOLD = 21500;
  const VIRTUAL_APT_RESERVES = 28.24;

  const [token, setToken] = useState<any>(null);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("buy");
  const [aptAmount, setAptAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [userTokenBalance, setUserTokenBalance] = useState<number>(0); // Real-time balance in octas
  
  // TEST MODE: Force graduated status for testing DEX interface
  const [testGraduatedMode, setTestGraduatedMode] = useState(false);

  const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR;
  // Optional: dedicated ArgoPump router module address
  const ROUTER_ADDR = process.env.NEXT_PUBLIC_ARGO_ROUTER_ADDR || MODULE_ADDR;

  if (!MODULE_ADDR) {
    throw new Error("NEXT_PUBLIC_MODULE_ADDR environment variable is required");
  }
  if (!ROUTER_ADDR) {
    throw new Error("Router module address is not set (NEXT_PUBLIC_ARGO_ROUTER_ADDR or NEXT_PUBLIC_MODULE_ADDR)");
  }

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

  // --- Helper encoders for ArgoPump::router::swap(args: vector<u8>) ---
  const encodeU64LE = (value: bigint) => {
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    // little-endian
    view.setBigUint64(0, value, true);
    return new Uint8Array(buf);
  };

  const hexToBytes32 = (hex: string) => {
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (clean.length !== 64) throw new Error("pool_addr must be 32 bytes hex string");
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      out[i] = parseInt(clean.substr(i * 2, 2), 16);
    }
    return out;
  };

  const encodeRouterSwapArgs = (
    poolAddr: string,
    assetInIndex: number,
    assetOutIndex: number,
    amountIn: bigint,
    minAmountOut: bigint,
  ): number[] => {
    const parts: number[] = [];
    const poolAddrBytes = hexToBytes32(poolAddr);
    parts.push(...Array.from(poolAddrBytes));
    parts.push(assetInIndex & 0xff);
    parts.push(assetOutIndex & 0xff);
    parts.push(...Array.from(encodeU64LE(amountIn)));
    parts.push(...Array.from(encodeU64LE(minAmountOut)));
    return parts;
  };

  // Function to get balance using direct API endpoint (EXACT COPY from portfolio)
  const getBalanceFromAPI = async (address: string, assetType: string): Promise<string> => {
    console.log(`🔎 getBalanceFromAPI called:`, {
      userAddress: address,
      assetType: assetType,
      apiUrl: `https://api.testnet.aptoslabs.com/v1/accounts/${address.startsWith('0x') ? address.slice(2) : address}/balance/${encodeURIComponent(assetType)}`
    });

    try {
      // Clean address - remove 0x prefix if present for URL
      const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
      
      const apiUrl = `https://api.testnet.aptoslabs.com/v1/accounts/${cleanAddress}/balance/${encodeURIComponent(assetType)}`;
      console.log(`📡 Fetching from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/x-bcs'
        }
      });

      console.log(`📥 API Response:`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ Asset not found (404) - returning 0 balance`);
          return "0"; // Asset not found means 0 balance
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // The API returns a simple number as text (e.g., "96394200")
      const balanceText = await response.text();
      const balance = balanceText.trim().replace(/"/g, ''); // Remove quotes if present
      
      console.log(`✅ Balance retrieved successfully:`, {
        assetType,
        balanceText,
        balanceParsed: balance,
        balanceInTokens: Number(balance) / 100000000
      });
      
      return balance || "0";
    } catch (error) {
      console.error(`❌ Failed to get balance for ${assetType}:`, error);
      return "0";
    }
  };

  // Function to get coin info from coin type or fungible asset (EXACT COPY from portfolio)
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


  const getUserTokenBalance = useCallback(async (tokenAddress: string) => {
    if (!account?.address) {
      console.warn("No account address available for balance check");
      return 0;
    }
    
    try {
      // CRITICAL: Convert account.address to string (it's an object/Uint8Array)
      const userAddress = account.address.toString();
      
      console.log("🔍 Fetching balance:", {
        userAddress: userAddress,
        tokenAddress: tokenAddress,
        accountAddressType: typeof account.address,
        userAddressStringType: typeof userAddress
      });
      
      // Use the same API method as portfolio page
      const balanceRaw = await getBalanceFromAPI(userAddress, tokenAddress);
      const balance = Number(balanceRaw) || 0;
      
      console.log(`✅ Balance result for ${tokenAddress}:`, {
        raw: balanceRaw,
        parsed: balance,
        inTokens: balance / 100000000
      });
      
      return balance;
    } catch (error) {
      console.error("❌ Error getting user token balance:", error);
      return 0;
    }
  }, [account?.address, getBalanceFromAPI]);

  // Function to fetch all bonding curve pools from API
  const fetchBondingCurvePools = async () => {
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
            project_uri: token.project_uri || "",
            dex_pool_addr: token.pool_stats?.dex_pool_addr || null
          } as TokenInfo;

        } catch (error) {
          console.error(`Error processing token ${token.address}:`, error);
          return null;
        }
      });

      const resolvedTokens = (await Promise.all(tokenPromises))
        .filter((token): token is TokenInfo => token !== null)
        .sort((a, b) => b.apt_reserves - a.apt_reserves);

      // Set selected token to current page token (by address)
      const currentToken = resolvedTokens.find(t => t.fa_object_addr === address);
      if (currentToken) {
        setSelectedToken(currentToken);
        console.log(`✅ Selected token matched to page: ${currentToken.symbol}`);
      } else if (resolvedTokens.length > 0) {
        // Fallback to first token if current not found
        setSelectedToken(resolvedTokens[0]);
        console.log(`⚠️  Current token not found, using first: ${resolvedTokens[0].symbol}`);
      }

    } catch (error: any) {
      console.error("Error fetching bonding curve pools:", error);

      // if (error.message?.includes("Resource not found") || error.message?.includes("Function not found")) {
      //   toast.info("Showing demo tokens - Create real tokens in the Launch page.");
      // } else {
      //   toast.info("Showing demo tokens - Network error occurred.");
      // }
    }
  };

  useEffect(() => {
    if (address) {
      fetchTokenDetail();
      fetchBondingCurvePools(); // Fetch pools to sync selectedToken
    }
  }, [address]);

  // Refresh balance when wallet connects/disconnects
  useEffect(() => {
    if (address && account?.address) {
      console.log('💼 Wallet connected, refreshing balances...');
      fetchBondingCurvePools(); // Refresh to get updated user balances
    }
  }, [account?.address]);

  // Update user token balance whenever selectedToken changes or wallet connects
  useEffect(() => {
    const updateUserBalance = async () => {
      console.log('🔄 useEffect triggered - Update balance', {
        hasSelectedToken: !!selectedToken,
        hasAccount: !!account?.address,
        tokenAddress: selectedToken?.fa_object_addr,
        tokenSymbol: selectedToken?.symbol,
        accountAddress: account?.address
      });

      if (selectedToken?.fa_object_addr && account?.address) {
        console.log('🔄 Updating user token balance for:', selectedToken.symbol);
        const balance = await getUserTokenBalance(selectedToken.fa_object_addr);
        setUserTokenBalance(balance);
        console.log('✅ User balance state updated:', {
          balance,
          balanceInTokens: balance / 100000000,
          symbol: selectedToken.symbol
        });
      } else {
        console.log('⚠️ Cannot update balance - missing selectedToken or account');
        setUserTokenBalance(0);
      }
    };

    updateUserBalance();
  }, [selectedToken?.fa_object_addr, account?.address, getUserTokenBalance]);

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

  const fetchTokenDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tokens/${address}`);
      const data = await response.json();

      if (data.success) {
        console.log(`📊 Token Details for ${data.data.symbol}:`, {
          name: data.data.name,
          trades: data.data.trades?.length || 0,
          volume_24h: data.data.volume_24h,
          trade_count_24h: data.data.trade_count_24h,
          pool_stats: data.data.pool_stats
        });
        
        // Debug graduation progress calculation
        if (data.data.pool_stats) {
          const aptReserves = Number(data.data.pool_stats.apt_reserves);
          const threshold = Number(data.data.pool_stats.graduation_threshold);
          const progress = (aptReserves / threshold) * 100;
          
          console.log(`📈 Graduation Progress Calculation:`, {
            apt_reserves_octas: aptReserves,
            apt_reserves_apt: (aptReserves / 1e8).toFixed(2) + ' APT',
            graduation_threshold_octas: threshold,
            graduation_threshold_apt: (threshold / 1e8).toFixed(0) + ' APT',
            progress_percentage: progress.toFixed(2) + '%',
            is_graduated: data.data.pool_stats.is_graduated
          });
        }
        
        setToken(data.data);
      } else {
        setError(data.error || "Failed to fetch token details");
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
              rotate: [0, 180, 360],
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
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)] relative z-10">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <div>
              <SpectacularText text="Loading Token Details" className="text-2xl" />
              <motion.p
                className="text-white/60 text-lg mt-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Please wait while we fetch the latest data...
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)] relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-red-900/20 via-orange-900/20 to-red-900/20 border-red-500/30 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-6"
                >
                  🚫
                </motion.div>
                <SpectacularText text="Token Not Found" className="text-3xl mb-6" />
                <motion.p
                  className="text-white/70 mb-8 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {error}
                </motion.p>
                <Link href="/bonding-curve">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold px-8 py-3 text-lg">
                      <ArrowLeft className="w-5 h-5 mr-3" />
                      Back to Explore
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentPrice = token.pool_stats ?
    Number(token.pool_stats.apt_reserves) / 1e8 / 1000000000 : 0;

  const graduationProgress = token.pool_stats ?
    (Number(token.pool_stats.apt_reserves) / Number(token.pool_stats.graduation_threshold)) * 100 : 0;

  const handleBuyTokens = async () => {
    if (!account || !selectedToken || !aptAmount) {
      toast.error("Please connect wallet and enter APT amount");
      return;
    }

    if (selectedToken.is_graduated) {
      toast.error("Token has graduated to DEX");
      return;
    }

    try {
      const aptInOctas = Math.floor(Number(aptAmount) * 100000000);

      console.log(`💰 Buying ${selectedToken.symbol}:`, {
        aptAmount: `${aptAmount} APT`,
        octas: aptInOctas,
        token: selectedToken.name,
        address: selectedToken.fa_object_addr
      });

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

      // Refresh balance immediately
      if (selectedToken) {
        const newBalance = await getUserTokenBalance(selectedToken.fa_object_addr);
        setUserTokenBalance(newBalance);
        console.log('💰 Balance refreshed after buy:', newBalance / 100000000, selectedToken.symbol);
      }

      setTimeout(() => {
        fetchBondingCurvePools();
      }, 2000);

    } catch (error: any) {
      // Convert error to string for comprehensive checking
      const errorString = String(error);
      const errorMessage = error?.message || errorString;
      
      // Check if user rejected the transaction (not an actual error)
      const isUserRejection = 
        errorMessage.includes("User rejected") || 
        errorMessage.includes("User has rejected") ||
        errorMessage.includes("rejected the request") ||
        errorString.includes("User rejected") ||
        errorString.includes("User has rejected") ||
        errorString.includes("rejected the request") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("denied") ||
        error?.code === 4001 ||
        error?.code === "USER_REJECTED";

      if (isUserRejection) {
        // User cancelled - just log info, not an error
        console.info("Buy transaction cancelled by user");
        toast.info("Transaction cancelled", {
          description: "You cancelled the transaction. No tokens were purchased.",
          duration: 4000
        });
        return; // Exit early, no need to log as error
      }

      // Actual errors - log them
      console.error("Buy error:", error);

      // Handle specific error cases
      if (errorMessage.includes("Insufficient")) {
        toast.error("Insufficient balance", {
          description: "You don't have enough APT for this transaction.",
          duration: 5000
        });
      } else if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
        toast.error("Network error", {
          description: "Please check your internet connection and try again.",
          duration: 5000
        });
      } else {
        toast.error("Purchase failed", {
          description: errorMessage || "Transaction failed. Please try again.",
          duration: 5000
        });
      }
    } finally {
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

    // Validate token amount input
    const tokenAmountNum = Number(tokenAmount);
    if (isNaN(tokenAmountNum) || tokenAmountNum <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid token amount"
      });
      return;
    }

    // Use the real-time balance from state
    const currentBalanceInTokens = userTokenBalance / 100000000;
    
    console.log("📊 Balance check before sell:", {
      tokenAddress: selectedToken.fa_object_addr,
      tokenSymbol: selectedToken.symbol,
      userBalanceOctas: userTokenBalance,
      userBalanceTokens: currentBalanceInTokens,
      tokenAmountRequested: tokenAmountNum,
      hasEnoughBalance: currentBalanceInTokens >= tokenAmountNum
    });
    
    // Check if user has any balance at all
    if (userTokenBalance === 0) {
      toast.error("No token balance", {
        description: `You don't have any ${selectedToken.symbol} tokens to sell. Buy some first!`
      });
      return;
    }

    // Check if user has enough balance
    if (currentBalanceInTokens < tokenAmountNum) {
      toast.error("Insufficient token balance", {
        description: `You have ${currentBalanceInTokens.toFixed(6)} ${selectedToken.symbol}, but trying to sell ${tokenAmountNum.toFixed(6)}`
      });
      return;
    }

    try {
      const tokensInOctas = Math.floor(tokenAmountNum * 100000000);

      console.log(`💰 Selling ${selectedToken.symbol}:`, {
        tokenAmount: `${tokenAmountNum} ${selectedToken.symbol}`,
        octas: tokensInOctas,
        token: selectedToken.name,
        address: selectedToken.fa_object_addr
      });

      const transaction = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDR}::bonding_curve_pool::sell_tokens`,
          typeArguments: [],
          functionArguments: [
            selectedToken.fa_object_addr,
            tokensInOctas.toString()
          ],
        },
      });

      const txHash = transaction.hash;
      console.log("Sell transaction submitted:", txHash);

      toast.success("🎉 Sale successful!", {
        description: `Sold ${tokenAmountNum.toFixed(6)} ${selectedToken.symbol} for ~${estimatedApt.toFixed(6)} APT`,
        duration: 5000
      });

      setTokenAmount("");
      setAptAmount("");

      // Refresh balance immediately
      if (selectedToken) {
        const newBalance = await getUserTokenBalance(selectedToken.fa_object_addr);
        setUserTokenBalance(newBalance);
        console.log('💰 Balance refreshed after sell:', newBalance / 100000000, selectedToken.symbol);
      }

      setTimeout(() => {
        fetchBondingCurvePools();
      }, 2000);

    } catch (error: any) {
      // Convert error to string for comprehensive checking
      const errorString = String(error);
      const errorMessage = error?.message || errorString;
      
      // Check if user rejected the transaction (not an actual error)
      const isUserRejection = 
        errorMessage.includes("User rejected") || 
        errorMessage.includes("User has rejected") ||
        errorMessage.includes("rejected the request") ||
        errorString.includes("User rejected") ||
        errorString.includes("User has rejected") ||
        errorString.includes("rejected the request") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("denied") ||
        error?.code === 4001 ||
        error?.code === "USER_REJECTED";

      if (isUserRejection) {
        // User cancelled - just log info, not an error
        console.info("Sell transaction cancelled by user");
        toast.info("Transaction cancelled", {
          description: "You cancelled the transaction. No tokens were sold.",
          duration: 4000
        });
        return; // Exit early, no need to log as error
      }

      // Actual errors - log them
      console.error("Sell error:", error);

      // Handle specific error cases
      if (errorMessage.includes("Insufficient")) {
        toast.error("Insufficient balance", {
          description: "You don't have enough tokens for this transaction.",
          duration: 5000
        });
      } else if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
        toast.error("Network error", {
          description: "Please check your internet connection and try again.",
          duration: 5000
        });
      } else {
        toast.error("Sale failed", {
          description: errorMessage || "Transaction failed. Please try again.",
          duration: 5000
        });
      }
    }
  };

  // DEX Trading handlers for graduated tokens
  const handleDEXSwapBuy = async () => {
    if (!account || !selectedToken || !aptAmount) {
      toast.error("Please connect wallet and enter APT amount");
      return;
    }

    try {
      const aptInOctas = Math.floor(Number(aptAmount) * 100000000);

      // Validate DEX pool address
      if (!selectedToken.dex_pool_addr) {
        toast.error("DEX pool address not found", {
          description: "This token hasn't been migrated to DEX yet.",
          duration: 5000
        });
        return;
      }

      console.log(`🔄 DEX Swap: ${aptAmount} APT → ${selectedToken.symbol}`, {
        aptAmount: `${aptAmount} APT`,
        octas: aptInOctas,
        token: selectedToken.name,
        poolAddress: selectedToken.dex_pool_addr
      });

      // Execute ArgoPump router swap when graduated or in test mode
      if (testGraduatedMode || selectedToken.is_graduated) {
        const poolAddr = selectedToken.dex_pool_addr;
        const minOut = Math.floor(estimatedTokens * 0.95 * 100000000);
        const encoded = encodeRouterSwapArgs(
          poolAddr,
          0, // APT in
          1, // Token out
          BigInt(aptInOctas),
          BigInt(minOut)
        );

        const transaction = await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: `${ROUTER_ADDR}::router::swap`,
            typeArguments: [],
            functionArguments: [encoded],
          },
        });

        const txHash = transaction.hash;
        toast.success("DEX Buy executed", {
          description: (
            <a 
              href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              View on Explorer: {txHash.substring(0, 12)}...
            </a>
          ),
          duration: 7000
        });

        setAptAmount("");
        setTokenAmount("");
        setTimeout(() => {
          fetchBondingCurvePools();
        }, 1500);
      } else {
        toast.info("🎓 DEX Trading Available", {
          description: `Token has graduated! DEX pools are being set up for ${selectedToken.symbol}`,
          duration: 5000
        });
      }

    } catch (error: any) {
      // Handle different types of errors
      if (error?.message?.includes("User rejected") || 
          error?.message?.includes("rejected") ||
          error?.message?.includes("User has rejected") ||
          error?.message?.includes("cancelled") ||
          error?.message?.includes("denied") ||
          error?.code === 4001 ||
          error?.code === "USER_REJECTED") {
        // Don't log user rejections
        toast.warning("Transaction cancelled", {
          description: "You cancelled the transaction in your wallet.",
          duration: 4000
        });
      } else if (error?.message?.includes("Insufficient")) {
        console.error("DEX Swap Buy error:", error);
        toast.error("Insufficient balance", {
          description: "You don't have enough APT for this transaction.",
          duration: 5000
        });
      } else if (error?.message?.includes("Network")) {
        console.error("DEX Swap Buy error:", error);
        toast.error("Network error", {
          description: "Please check your internet connection and try again.",
          duration: 5000
        });
      } else {
        console.error("DEX Swap Buy error:", error);
        toast.error("DEX Swap failed", {
          description: error?.message || "Transaction failed. Please try again.",
          duration: 5000
        });
      }
    }
  };

  const handleDEXSwapSell = async () => {
    if (!account || !selectedToken || !tokenAmount) {
      toast.error("Please connect wallet and enter token amount");
      return;
    }

    try {
      const tokensInOctas = Math.floor(Number(tokenAmount) * 100000000);

      // Validate DEX pool address
      if (!selectedToken.dex_pool_addr) {
        toast.error("DEX pool address not found", {
          description: "This token hasn't been migrated to DEX yet.",
          duration: 5000
        });
        return;
      }

      console.log(`🔄 DEX Swap: ${tokenAmount} ${selectedToken.symbol} → APT`, {
        tokenAmount: `${tokenAmount} ${selectedToken.symbol}`,
        octas: tokensInOctas,
        poolAddress: selectedToken.dex_pool_addr
      });

      // Execute ArgoPump router swap when graduated or in test mode
      if (testGraduatedMode || selectedToken.is_graduated) {
        const poolAddr = selectedToken.dex_pool_addr;
        const minOut = Math.floor(estimatedApt * 0.95 * 100000000);
        const tokensInOctas = Math.floor(Number(tokenAmount) * 100000000);
        const encoded = encodeRouterSwapArgs(
          poolAddr,
          1, // Token in
          0, // APT out
          BigInt(tokensInOctas),
          BigInt(minOut)
        );

        const transaction = await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: `${ROUTER_ADDR}::router::swap`,
            typeArguments: [],
            functionArguments: [encoded],
          },
        });

        const txHash = transaction.hash;
        toast.success("DEX Sell executed", {
          description: (
            <a 
              href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              View on Explorer: {txHash.substring(0, 12)}...
            </a>
          ),
          duration: 7000
        });

        setTokenAmount("");
        setAptAmount("");
        setTimeout(() => {
          fetchBondingCurvePools();
        }, 1500);
      } else {
        toast.info("🎓 DEX Trading Available", {
          description: `Token has graduated! DEX pools are being set up for ${selectedToken.symbol}`,
          duration: 5000
        });
      }

    } catch (error: any) {
      // Handle different types of errors for sell
      if (error?.message?.includes("User rejected") || 
          error?.message?.includes("rejected") ||
          error?.message?.includes("User has rejected") ||
          error?.message?.includes("cancelled") ||
          error?.message?.includes("denied") ||
          error?.code === 4001 ||
          error?.code === "USER_REJECTED") {
        // Don't log user rejections
        toast.warning("Transaction cancelled", {
          description: "You cancelled the transaction in your wallet.",
          duration: 4000
        });
      } else if (error?.message?.includes("Insufficient")) {
        console.error("DEX Swap Sell error:", error);
        toast.error("Insufficient balance", {
          description: "You don't have enough tokens for this transaction.",
          duration: 5000
        });
      } else if (error?.message?.includes("Network")) {
        console.error("DEX Swap Sell error:", error);
        toast.error("Network error", {
          description: "Please check your internet connection and try again.",
          duration: 5000
        });
      } else {
        console.error("DEX Swap Sell error:", error);
        toast.error("DEX Swap failed", {
          description: error?.message || "Transaction failed. Please try again.",
          duration: 5000
        });
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Animated Background */}
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

        {/* Floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full opacity-40"
            animate={{
              x: [0, 100 - i * 20, 0],
              y: [0, 60 - i * 10, 0],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + i * 8}%`
            }}
          />
        ))}
      </div>

      <Header />

      <div className="container mx-auto max-w-7xl p-4 pt-8 relative z-10">
        {/* Enhanced Token Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Link href="/bonding-curve">
              <motion.div
                whileHover={{ x: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-300 backdrop-blur-xl border border-white/10 hover:border-white/20 px-6 py-3"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Explore
                </Button>
              </motion.div>
            </Link>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Badge
                className={`px-4 py-2 text-xs font-medium backdrop-blur-xl border-0 ${token.pool_stats?.is_graduated
                  ? "bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  : "bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  }`}
              >
                <motion.span
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mr-1 text-sm"
                >
                  {token.pool_stats?.is_graduated ? "🎓" : "🚀"}
                </motion.span>
                {token.pool_stats?.is_graduated ? "Graduated" : "Live"}
              </Badge>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8 mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              {/* Glow effect around avatar */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-50 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <Avatar className="w-20 h-20 ring-2 ring-white/20 relative z-10 backdrop-blur-xl">
                <AvatarImage src={token.icon_uri || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 text-white text-xl font-black">
                  {token.symbol.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <SpectacularText
                  text={token.name}
                  className="text-2xl lg:text-4xl mb-3"
                />
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-4 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="relative"
                >
                  <Badge
                    variant="outline"
                    className="text-cyan-300 border-cyan-300/50 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-xl px-4 py-2 text-lg font-bold"
                  >
                    ${token.symbol}
                  </Badge>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <span className="font-mono text-white/90 text-sm">{formatAddress(token.address)}</span>
                  <motion.button
                    onClick={copyAddress}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                </motion.div>

                <motion.div
                  className="text-white/60 text-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl px-3 py-1 rounded-lg border border-white/10"
                  whileHover={{ scale: 1.05 }}
                >
                  Created by {formatAddress(token.creator)}
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {token.project_uri && (
                <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="bg-white/5 backdrop-blur-xl border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    <a href={token.project_uri} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  </Button>
                </motion.div>
              )}

              <Link href={`/bonding-curve?token=${token.address}`}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300"
                  >
                    <Rocket className="w-4 h-4 mr-1" />
                    Trade
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Info Ticker Section */}
        <InfoTicker token={token} />

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <EnhancedStatsCard
            title="Current Price"
            value={`$${currentPrice.toFixed(8)}`}
            subtitle="per token"
            icon={<DollarSign className="w-5 h-5 text-white" />}
            gradient="bg-gradient-to-br from-green-500/10 via-emerald-500/15 to-green-600/10 border-green-500/30"
            delay={0.1}
          />

          <EnhancedStatsCard
            title="24h Volume"
            value={`${formatCompactNumber(token.volume_24h / 1e8, 2)} APT`}
            subtitle="traded"
            icon={<BarChart3 className="w-5 h-5 text-white" />}
            gradient="bg-gradient-to-br from-blue-500/10 via-cyan-500/15 to-blue-600/10 border-blue-500/30"
            delay={0.2}
          />

          <EnhancedStatsCard
            title="Total Trades"
            value={formatCompactNumber(token.pool_stats?.trade_count || 0, 0)}
            subtitle="transactions"
            icon={<Activity className="w-5 h-5 text-white" />}
            gradient="bg-gradient-to-br from-purple-500/10 via-pink-500/15 to-purple-600/10 border-purple-500/30"
            delay={0.3}
          />

          <EnhancedStatsCard
            title="Graduation"
            value={`${graduationProgress.toFixed(1)}%`}
            subtitle="to graduation"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            gradient="bg-gradient-to-br from-yellow-500/10 via-orange-500/15 to-yellow-600/10 border-yellow-500/30"
            delay={0.4}
          />
        </div>

        {/* Enhanced Main Content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gradient-to-r from-black/40 via-purple-900/30 to-black/40 border border-white/20 backdrop-blur-xl p-1 rounded-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-pink-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white/70 hover:text-white/90 transition-all duration-300 px-4 py-2 rounded-md font-medium text-sm"
              >
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center"
                >
                  📊 Overview
                </motion.span>
              </TabsTrigger>
              <TabsTrigger
                value="trades"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-pink-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white/70 hover:text-white/90 transition-all duration-300 px-4 py-2 rounded-md font-medium text-sm"
              >
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center"
                >
                  📈 Trades
                </motion.span>
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-pink-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white/70 hover:text-white/90 transition-all duration-300 px-4 py-2 rounded-md font-medium text-sm"
              >
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center"
                >
                  ℹ️ Info
                </motion.span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Pool Stats */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-black/40 via-purple-900/20 to-black/40 border border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-500 relative overflow-hidden">
                    {/* Animated background pattern */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/10 to-pink-500/5"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                      }}
                      transition={{ duration: 8, repeat: Infinity }}
                      style={{ backgroundSize: "200% 200%" }}
                    />

                    <CardHeader className="relative z-10">
                      <CardTitle className="text-white flex items-center text-xl font-bold">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="mr-3 text-2xl"
                        >
                          🏊‍♂️
                        </motion.div>
                        Pool Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                      {[
                        {
                          label: "APT Reserves",
                          value: `${formatCompactNumber(Number(token.pool_stats?.apt_reserves || 0) / 1e8, 2)} APT`,
                          icon: "💰"
                        },
                        {
                          label: "Total Volume",
                          value: `${formatCompactNumber(Number(token.pool_stats?.total_volume || 0) / 1e8, 2)} APT`,
                          icon: "📊"
                        },
                        {
                          label: "Graduation Progress",
                          value: `${graduationProgress.toFixed(1)}%`,
                          icon: "🎯"
                        }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          className="flex justify-between items-center p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl backdrop-blur-sm border border-white/10"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <span className="text-white/80 font-medium flex items-center">
                            <span className="mr-3 text-lg">{stat.icon}</span>
                            {stat.label}:
                          </span>
                          <motion.span
                            className="text-white font-bold text-lg"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          >
                            {stat.value}
                          </motion.span>
                        </motion.div>
                      ))}

                      {/* Graduation Progress Bar */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-white/70">
                          <span>Progress to Graduation</span>
                          <span>{graduationProgress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gradient-to-r from-white/10 to-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                          <motion.div
                            className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 h-4 rounded-full relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(graduationProgress, 100)}%` }}
                            transition={{ duration: 2, delay: 1 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                              animate={{ x: [-100, 300] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Trading Interface */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-black/40 via-pink-900/20 to-black/40 border border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-500 relative overflow-hidden">
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/10 to-cyan-500/5"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                      }}
                      transition={{ duration: 6, repeat: Infinity }}
                      style={{ backgroundSize: "300% 300%" }}
                    />

                    <CardHeader className="relative z-10">
                      <CardTitle className="text-white flex items-center text-xl font-bold">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 360]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="mr-3 text-2xl"
                        >
                          🚀
                        </motion.div>
                        Trade {token.symbol}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-6">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                  <span className="text-lg font-bold">{selectedToken?.symbol.charAt(0)}</span>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold">{selectedToken?.name}</h3>
                                  <p className="text-muted-foreground">{selectedToken?.symbol}</p>
                                </div>
                              </div>
                            </div>

                            {/* Token Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div className="text-center p-3 rounded-lg bg-muted/20">
                                <p className="text-2xl font-bold text-primary">{formatCompactNumber(selectedToken?.apt_reserves || 0, 2)}</p>
                                <p className="text-sm text-muted-foreground">APT Reserves</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-muted/20">
                                <p className="text-2xl font-bold text-secondary">{formatCompactNumber(selectedToken?.token_supply || 0, 0)}</p>
                                <p className="text-sm text-muted-foreground">Pool Supply</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-muted/20">
                                <p className="text-2xl font-bold text-accent">{graduationProgress.toFixed(1)}%</p>
                                <p className="text-sm text-muted-foreground">To Graduation</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-muted/20">
                                <p className="text-2xl font-bold text-green-500">
                                  {formatCompactNumber(userTokenBalance / 100000000, 2)}
                                </p>
                                <p className="text-sm text-muted-foreground">Your Balance</p>
                              </div>
                            </div>

                            {/* Graduation Progress */}
                            <div className="mb-6">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Progress to DEX Graduation</span>
                                <span>{formatCompactNumber(GRADUATION_THRESHOLD, 1)} APT Target</span>
                              </div>
                              <Progress value={graduationProgress} className="h-3" />
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                <Info className="w-3 h-3" />
                                When graduation threshold is reached, remaining tokens are burned and a DEX pool is created
                              </p>
                            </div>

                            {/* 🧪 TEST MODE: Toggle Graduated Status */}
                            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                              <div className="flex items-center justify-between">
                                <span className="text-yellow-400 text-sm font-medium">
                                  🧪 Test Mode: Graduated Token
                                </span>
                                <Button
                                  onClick={() => setTestGraduatedMode(!testGraduatedMode)}
                                  size="sm"
                                  variant={testGraduatedMode ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {testGraduatedMode ? "Disable Test" : "Enable Test"}
                                </Button>
                              </div>
                              {testGraduatedMode && (
                                <p className="text-yellow-300/80 text-xs mt-2">
                                  Token is now treated as graduated for testing DEX interface
                                </p>
                              )}
                            </div>

                            {/* Trading Interface - Hide when graduated */}
                            {!selectedToken?.is_graduated && !testGraduatedMode && (
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
                                      disabled={selectedToken?.is_graduated}
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
                                      {selectedToken?.symbol} tokens
                                    </p>
                                  </div>

                                  <Button
                                    onClick={handleBuyTokens}
                                    disabled={!aptAmount || selectedToken?.is_graduated || !account}
                                    className="w-full bg-gradient-primary border-0 neon-glow-pink"
                                  >
                                    {`Buy ${selectedToken?.symbol}`}
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
                                      disabled={selectedToken?.is_graduated}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {selectedToken?.symbol} tokens to sell
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
                                    disabled={!tokenAmount || selectedToken?.is_graduated || !account}
                                    className="w-full bg-gradient-secondary border-0 neon-glow-cyan"
                                  >
                                    {`Sell ${selectedToken?.symbol}`}
                                  </Button>
                                </div>
                              </TabsContent>
                            </Tabs>
                            )}

                            {(selectedToken?.is_graduated || testGraduatedMode) && (
                              <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2 text-green-400">
                                    <Target className="w-5 h-5" />
                                    <span className="font-semibold">🎓 Graduated Token - DEX Trading</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Powered by</span>
                                    <motion.a
                                      href="https://tapp.exchange"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <img 
                                        src="https://tapp.exchange/main-icon.png" 
                                        alt="Tapp Exchange" 
                                        className="h-5 w-5 object-contain"
                                      />
                                      <img 
                                        src="https://tapp.exchange/main-word.png" 
                                        alt="Tapp Exchange" 
                                        className="h-4 object-contain"
                                      />
                                    </motion.a>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {testGraduatedMode ? (
                                    <>🧪 <strong>Test Mode:</strong> Simulating graduated token DEX interface. This token hasn't actually graduated yet.</>
                                  ) : (
                                    "This token has graduated to a DEX pool. Trade using advanced liquidity pools."
                                  )}
                                </p>
                                
                                {/* DEX Trading Interface */}
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                  <TabsList className="grid w-full grid-cols-2 bg-muted/20">
                                    <TabsTrigger value="buy" className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      Swap to {selectedToken?.symbol}
                                    </TabsTrigger>
                                    <TabsTrigger value="sell" className="flex items-center gap-2">
                                      <TrendingDown className="w-4 h-4" />
                                      Swap from {selectedToken?.symbol}
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="buy" className="space-y-4 mt-6">
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="apt-amount-dex">APT Amount</Label>
                                        <Input
                                          id="apt-amount-dex"
                                          type="number"
                                          placeholder="0.0"
                                          value={aptAmount}
                                          onChange={(e) => setAptAmount(e.target.value)}
                                          className="bg-muted/20"
                                        />
                                      </div>

                                      <div className="flex items-center justify-center">
                                        <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
                                      </div>

                                      <div>
                                        <Label htmlFor="token-estimate-dex">You'll receive (estimated)</Label>
                                        <Input
                                          id="token-estimate-dex"
                                          value={estimatedTokens.toFixed(6)}
                                          readOnly
                                          className="bg-muted/10"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {selectedToken?.symbol} tokens (via DEX)
                                        </p>
                                      </div>

                                      <Button
                                        onClick={handleDEXSwapBuy}
                                        disabled={!aptAmount || !account}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 border-0"
                                      >
                                        {`Swap APT → ${selectedToken?.symbol}`}
                                      </Button>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="sell" className="space-y-4 mt-6">
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="token-amount-dex">Token Amount</Label>
                                        <Input
                                          id="token-amount-dex"
                                          type="number"
                                          placeholder="0.0"
                                          value={tokenAmount}
                                          onChange={(e) => setTokenAmount(e.target.value)}
                                          className="bg-muted/20"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {selectedToken?.symbol} tokens to swap
                                        </p>
                                      </div>

                                      <div className="flex items-center justify-center">
                                        <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
                                      </div>

                                      <div>
                                        <Label htmlFor="apt-estimate-dex">You'll receive (estimated)</Label>
                                        <Input
                                          id="apt-estimate-dex"
                                          value={estimatedApt.toFixed(6)}
                                          readOnly
                                          className="bg-muted/10"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">APT (via DEX)</p>
                                      </div>

                                      <Button
                                        onClick={handleDEXSwapSell}
                                        disabled={!tokenAmount || !account}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 border-0"
                                      >
                                        {`Swap ${selectedToken?.symbol} → APT`}
                                      </Button>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </div>
                            )}
                          </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="trades">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-black/40 via-blue-900/20 to-black/40 border border-white/20 backdrop-blur-xl relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/10 to-cyan-500/5"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    style={{ backgroundSize: "200% 200%" }}
                  />

                  <CardHeader className="relative z-10">
                    <CardTitle className="text-white flex items-center text-xl font-bold">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mr-3 text-2xl"
                      >
                        📈
                      </motion.div>
                      Recent Trades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      {token.trades.length > 0 ? (
                        token.trades.map((trade: any, index: number) => (
                          <motion.div
                            key={trade.id}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{
                              scale: 1.02,
                              backgroundColor: "rgba(255,255,255,0.15)",
                              boxShadow: "0 10px 30px -10px rgba(168,85,247,0.3)"
                            }}
                            className="flex items-center justify-between p-6 bg-gradient-to-r from-white/5 to-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative"
                              >
                                <Badge
                                  variant="outline"
                                  className="text-green-400 border-green-400/50 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm font-bold px-3 py-1"
                                >
                                  BUY
                                </Badge>
                                <motion.div
                                  className="absolute -inset-1 bg-green-400/20 rounded-lg blur-sm"
                                  animate={{ opacity: [0, 0.5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              </motion.div>
                              <div>
                                <p className="text-white font-bold text-lg">
                                  {formatCompactNumber(Number(trade.token_amount) / 1e8, 2)} {token.symbol}
                                </p>
                                <motion.p
                                  className="text-white/60 text-sm font-mono"
                                  whileHover={{ color: "rgba(255,255,255,0.9)" }}
                                >
                                  {formatAddress(trade.user_address)}
                                </motion.p>
                              </div>
                            </div>
                            <div className="text-right">
                              <motion.p
                                className="text-white font-bold text-lg"
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                              >
                                {formatCompactNumber(Number(trade.apt_amount) / 1e8, 2)} APT
                              </motion.p>
                              <p className="text-white/60 text-sm">
                                {new Date(trade.created_at).toLocaleString()}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          className="text-center py-16"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-6xl mb-6"
                          >
                            📊
                          </motion.div>
                          <p className="text-white/60 text-xl">No trades yet</p>
                          <p className="text-white/40 text-sm mt-2">Be the first to trade this token!</p>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="info">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-black/40 via-indigo-900/20 to-black/40 border border-white/20 backdrop-blur-xl relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/10 to-blue-500/5"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                    }}
                    transition={{ duration: 12, repeat: Infinity }}
                    style={{ backgroundSize: "200% 200%" }}
                  />

                  <CardHeader className="relative z-10">
                    <CardTitle className="text-white flex items-center text-xl font-bold">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="mr-3 text-2xl"
                      >
                        ℹ️
                      </motion.div>
                      Token Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Creator", value: formatAddress(token.creator), icon: "👤" },
                        { label: "Decimals", value: token.decimals.toString(), icon: "🔢" },
                        { label: "Created", value: new Date(token.created_at).toLocaleDateString(), icon: "📅" },
                        { label: "Max Supply", value: token.max_supply ? formatCompactNumber(Number(token.max_supply) / 1e8, 0) : "1B", icon: "💰" }
                      ].map((info, index) => (
                        <motion.div
                          key={info.label}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "rgba(255,255,255,0.15)",
                            y: -2
                          }}
                          className="bg-gradient-to-r from-white/5 to-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="flex items-center mb-3">
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                              className="text-2xl mr-3"
                            >
                              {info.icon}
                            </motion.span>
                            <label className="text-white/70 text-sm font-medium uppercase tracking-wider">
                              {info.label}
                            </label>
                          </div>
                          <motion.p
                            className="text-white font-bold text-lg"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                          >
                            {info.value}
                          </motion.p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Additional Token Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-xl border border-white/10"
                    >
                      <h4 className="text-white font-bold text-lg mb-4 flex items-center">
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="mr-3 text-xl"
                        >
                          ⭐
                        </motion.span>
                        Quick Stats
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                          { label: "24h Trades", value: formatCompactNumber(token.trade_count_24h, 0) },
                          { label: "Status", value: token.pool_stats?.is_graduated ? "Graduated" : "Bonding" },
                          { label: "Total Volume", value: `${formatCompactNumber(Number(token.pool_stats?.total_volume || 0) / 1e8, 2)} APT` },
                          { label: "Mint Fee", value: `${token.mint_fee_per_unit} APT` }
                        ].map((stat, index) => (
                          <motion.div
                            key={stat.label}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="text-center"
                          >
                            <motion.p
                              className="text-white font-bold text-lg"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                            >
                              {stat.value}
                            </motion.p>
                            <p className="text-white/60 text-sm">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Custom CSS for elegant marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}


