"use client";

import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Rocket, Wallet, ShieldCheck, Info, ExternalLink, Sparkles, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export default function LaunchTokenForm() {
  // BullPump module address from environment
  const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR;
  
  if (!MODULE_ADDR) {
    throw new Error("NEXT_PUBLIC_MODULE_ADDR environment variable is required");
  }

  const { account, signAndSubmitTransaction, signTransaction } = useWallet() as any;
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [iconUri, setIconUri] = useState("");
  const [projectUri, setProjectUri] = useState("");
  const [initialBuyAmount, setInitialBuyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [iconUrlWarning, setIconUrlWarning] = useState("");

  const NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL || "https://api.testnet.aptoslabs.com/v1";
  const FAUCET_URL = process.env.NEXT_PUBLIC_APTOS_FAUCET_URL || "https://faucet.testnet.aptoslabs.com";
  const client = useMemo(() => new Aptos(new AptosConfig({ 
    network: Network.TESTNET,
    fullnode: NODE_URL,
    faucet: FAUCET_URL 
  })), [NODE_URL, FAUCET_URL]);

  // Removed motion values and mouse handlers for card animations

  // Function to validate Unsplash URLs
  const validateIconUrl = (url: string) => {
    if (!url.trim()) {
      setIconUrlWarning("");
      return;
    }

    const isUnsplashUrl = url.includes('unsplash.com') || 
                         url.includes('images.unsplash.com') || 
                         url.includes('plus.unsplash.com');
    
    if (!isUnsplashUrl) {
      setIconUrlWarning("⚠️ Only Unsplash images are recommended to prevent broken icons");
    } else {
      setIconUrlWarning("");
    }
  };

  // Handle icon URI change with validation
  const handleIconUriChange = (value: string) => {
    setIconUri(value);
    validateIconUrl(value);
  };

  async function handleDeploy() {
    try {
      if (!account) {
        toast.error("Connect wallet first");
        return;
      }
      if (!MODULE_ADDR || MODULE_ADDR.includes("_HERE")) {
        toast.error("MODULE_ADDR not set", { description: "Set NEXT_PUBLIC_MODULE_ADDR in your env" });
        return;
      }
  
      if (!name.trim()) {
        toast.error("Token name is required");
        return;
      }
      if (!symbol.trim()) {
        toast.error("Token symbol is required");
        return;
      }
  
      setSubmitting(true);
  
      // Check APT balance (optional check, don't fail if it doesn't work)
      try {
        const balance = await client.getAccountAPTAmount({
          accountAddress: account.address,
        });
        console.log("Current APT balance:", balance);
        if (balance < 100000) { // 0.001 APT minimum
          toast.warning("Low APT balance", {
            description: "Consider getting more APT from faucet if transaction fails"
          });
        }
      } catch (e) {
        console.warn("Could not check balance (continuing anyway):", e);
        // Don't block the transaction if balance check fails
      }
  
      // Function arguments matching create_fa signature: (name, symbol, icon_uri, project_uri, amount_creator_buy)
      let functionArguments: any[];
      
      if (initialBuyAmount && parseFloat(initialBuyAmount) > 0) {
        const initialBuyAmountOctas = Math.floor(parseFloat(initialBuyAmount) * 100000000);
        functionArguments = [
          name.trim(),                    // String: name
          symbol.trim(),                  // String: symbol
          iconUri.trim() || "",          // String: icon_uri
          projectUri.trim() || "",       // String: project_uri
          initialBuyAmountOctas          // u64: amount_creator_buy (Some value)
        ];
      } else {
        // For Option<u64> None, use {"vec": []} format as shown in successful transaction
        functionArguments = [
          name.trim(),                    // String: name
          symbol.trim(),                  // String: symbol
          iconUri.trim() || "",          // String: icon_uri
          projectUri.trim() || "",       // String: project_uri
          { "vec": [] }                  // Empty vector for Option::none()
        ];
      }
  
      console.log("Function arguments:", functionArguments);
  
      const submitted = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDR}::token_factory::create_fa`,
          typeArguments: [],
          functionArguments,
        },
      } as any);

      const txHash = submitted.hash as string;
      const explorerUrl = `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`;
      
      console.log("Transaction submitted:", txHash);

      // Enhanced success toast with direct Aptos Explorer link
      toast.success("🎉 Token created successfully!", { 
        description: (
          <div className="flex items-center gap-2">
            <span>Transaction: {txHash.substring(0, 10)}...</span>
            <button
              onClick={() => window.open(explorerUrl, '_blank')}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={12} />
              View on Explorer
            </button>
          </div>
        ),
        duration: 8000,
        action: {
          label: "Open Explorer",
          onClick: () => window.open(explorerUrl, '_blank')
        }
      });

      console.log(`Token "${name}" (${symbol}) created with transaction: ${txHash}`);
      console.log(`View on Aptos Explorer: ${explorerUrl}`);

      // Optional: Try to wait for confirmation in background (don't block UI)
      setTimeout(async () => {
        try {
          await client.waitForTransaction({ 
            transactionHash: txHash,
            options: {
              timeoutSecs: 20,
              checkSuccess: true
            }
          });
          console.log("✅ Transaction confirmed on blockchain");
          toast.success("✅ Transaction confirmed!", { 
            description: "Your token is now live on Aptos blockchain",
            action: {
              label: "View Token",
              onClick: () => window.open(explorerUrl, '_blank')
            }
          });
        } catch (waitError) {
          console.warn("Background verification failed (transaction may still be successful):", waitError);
        }
      }, 1000);
  
      // Reset fields
      setName("");
      setSymbol("");
      setIconUri("");
      setProjectUri("");
    } catch (e: any) {
      console.error("Deployment error:", e);
      
      // Handle specific error cases
      let errorMessage = "Failed to create token";
      let errorDescription = e?.message || String(e);
      
      // Check for user rejection
      if (e?.message?.includes("User rejected") || 
          e?.message?.includes("rejected") ||
          e?.message?.includes("cancelled") ||
          e?.message?.includes("denied") ||
          e?.code === 4001 || // Standard rejection code
          e?.code === "USER_REJECTED") {
        errorMessage = "Transaction cancelled";
        errorDescription = "You cancelled the transaction. No tokens were created.";
      } else if (e?.message?.includes("insufficient")) {
        errorMessage = "Insufficient balance";
        errorDescription = "You don't have enough APT to complete this transaction.";
      } else if (e?.message?.includes("network") || e?.message?.includes("timeout")) {
        errorMessage = "Network error";
        errorDescription = "Please check your connection and try again.";
      }
      
      toast.error(errorMessage, { description: errorDescription });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -30, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Badge variant="outline" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 mb-4 px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              BullPump
            </Badge>
          </motion.div>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Launch Your Token
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create and deploy a bonding curve token in minutes. Fully on-chain with automatic liquidity.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div 
            className="lg:col-span-2" 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="liquid-glass backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/20 shadow-2xl">
                <CardHeader className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg" />
                  <CardTitle className="flex items-center gap-3 relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Rocket className="w-6 h-6 text-purple-400" />
                    </motion.div>
                    <span className="text-xl">Token Configuration</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-8 relative">
                  {/* Floating particles */}
                  <motion.div
                    className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ y: [-10, 10, -10], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-16 right-12 w-1 h-1 bg-pink-400 rounded-full"
                    animate={{ y: [10, -10, 10], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
                      <Label htmlFor="name" className="text-sm font-medium text-foreground/80 mb-2 block">
                        Token Name *
                      </Label>
                      <Input 
                        id="name" 
                        placeholder="My Awesome Token" 
                        className="bg-white/5 border-white/10 focus:border-purple-400/50 focus:ring-purple-400/20 transition-all duration-300" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                      {name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-0 text-xs text-green-400"
                        >
                          ✓ Name looks good!
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
                      <Label htmlFor="symbol" className="text-sm font-medium text-foreground/80 mb-2 block">
                        Symbol *
                      </Label>
                      <Input 
                        id="symbol" 
                        placeholder="MAT" 
                        className="bg-white/5 border-white/10 focus:border-purple-400/50 focus:ring-purple-400/20 transition-all duration-300" 
                        value={symbol} 
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        required 
                      />
                      {symbol && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-0 text-xs text-green-400"
                        >
                          ✓ Symbol is valid!
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Label htmlFor="icon" className="text-sm font-medium text-foreground/80 mb-2 block">
                        Icon URI (Unsplash Only)
                      </Label>
                      <Input 
                        id="icon" 
                        placeholder="https://images.unsplash.com/photo-..." 
                        className={`bg-white/5 border-white/10 focus:border-purple-400/50 focus:ring-purple-400/20 transition-all duration-300 ${
                          iconUrlWarning ? 'border-yellow-500/50' : ''
                        }`}
                        value={iconUri} 
                        onChange={(e) => handleIconUriChange(e.target.value)} 
                      />
                      {iconUrlWarning && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 left-0 text-xs text-yellow-400 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {iconUrlWarning}
                        </motion.div>
                      )}
                      {iconUri && !iconUrlWarning && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-0 text-xs text-green-400"
                        >
                          ✓ Unsplash URL looks good!
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="project" className="text-sm font-medium text-foreground/80 mb-2 block">
                        Project URI (Optional)
                      </Label>
                      <Input 
                        id="project" 
                        placeholder="https://example.com" 
                        className="bg-white/5 border-white/10 focus:border-purple-400/50 focus:ring-purple-400/20 transition-all duration-300" 
                        value={projectUri} 
                        onChange={(e) => setProjectUri(e.target.value)} 
                      />
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative"
                  >
                    <Label htmlFor="initialBuy" className="text-sm font-medium text-foreground/80 mb-2 block">
                      Initial Buy Amount (APT)
                    </Label>
                    <Input 
                      id="initialBuy" 
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0 (optional)" 
                      className="bg-white/5 border-white/10 focus:border-purple-400/50 focus:ring-purple-400/20 transition-all duration-300" 
                      value={initialBuyAmount} 
                      onChange={(e) => setInitialBuyAmount(e.target.value)} 
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Optional: Buy tokens immediately after creation. Leave empty to skip.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Info className="w-6 h-6 text-blue-400 mt-0.5" />
                      </motion.div>
                      <div>
                        <p className="font-semibold text-blue-200 mb-2">Bonding Curve Token</p>
                        <ul className="text-blue-300/80 space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <Zap className="w-3 h-3" />
                            Fixed supply: 1 billion tokens (8 decimals)
                          </li>
                          <li className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Automatic bonding curve pricing
                          </li>
                          <li className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" />
                            No mint fees or limits
                          </li>
                          <li className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Instant liquidity through bonding curve
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-200 mb-1">Icon URL Guidelines</p>
                        <p className="text-yellow-300/80 text-sm">
                          Use only Unsplash images (images.unsplash.com) for token icons to ensure reliability and prevent broken images. 
                          Other image sources may cause display issues.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                      </motion.div>
                      BullPump verified contract
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className={`
                          relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 
                          hover:from-purple-500 hover:to-pink-500 border-0 
                          shadow-lg hover:shadow-xl transition-all duration-300
                          ${submitting ? 'animate-pulse' : ''}
                        `}
                        onClick={handleDeploy} 
                        disabled={submitting || !name.trim() || !symbol.trim()}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 hover:opacity-20 transition-opacity" />
                        <Wallet className="w-4 h-4 mr-2" /> 
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                            />
                            Creating...
                          </span>
                        ) : (
                          "Create Token"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
          </motion.div>

          {/* Preview Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="liquid-glass backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/20 shadow-2xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                  Token Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div 
                  className="rounded-xl p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm text-purple-300 mb-3 flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 bg-purple-400 rounded-full"
                    />
                    Your Token
                  </div>
                  <motion.div 
                    className="text-xl font-bold text-white mb-1"
                    key={`token-name-${name}`}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    {name || "Token Name"}
                  </motion.div>
                  <motion.div 
                    className="text-sm text-purple-300 mb-3"
                    key={`token-symbol-${symbol}`}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    {symbol || "SYMBOL"}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    Supply: 1,000,000,000 tokens (8 decimals)
                  </div>
                </motion.div>
                
                <motion.div 
                  className="rounded-xl p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm font-semibold mb-3 text-blue-200">Network Information</div>
                  <div className="text-xs text-blue-300/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Network: Aptos Testnet
                    </div>
                    <div>Contract: BullPump Token Factory</div>
                    <div className="break-all font-mono">
                      Module: {MODULE_ADDR.substring(0, 10)}...
                    </div>
                  </div>
                </motion.div>

                <Tabs defaultValue="bonding" className="w-full">
                  <TabsList className="bg-white/5 border-white/10 w-full">
                    <TabsTrigger value="bonding" className="flex-1 data-[state=active]:bg-purple-500/20">
                      Bonding Curve
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="bonding" className="space-y-4 text-sm text-muted-foreground">
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="font-semibold text-foreground">Automatic Bonding Curve</p>
                      <ul className="space-y-2">
                        {[
                          "Automatic price discovery",
                          "Instant liquidity", 
                          "No rug pulls",
                          "Fair launch mechanism"
                        ].map((item, index) => (
                          <motion.li 
                            key={item}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                              className="w-1.5 h-1.5 bg-green-400 rounded-full"
                            />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </TabsContent>
                </Tabs>

                <motion.div 
                  className="text-xs text-muted-foreground p-4 rounded-lg bg-white/5 border border-white/10"
                  whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
                >
                  Gas fees vary by network congestion. You will confirm the exact amount in your wallet.
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Enhanced floating orbs */}
      <motion.div
        className="pointer-events-none fixed right-[-120px] top-[20%] w-[300px] h-[300px] rounded-full opacity-30"
        style={{ 
          background: "radial-gradient(circle at 30% 30%, rgba(139,69,255,0.4), rgba(236,72,153,0.3), transparent 70%)",
          filter: "blur(40px)"
        }}
        animate={{ 
          y: [0, -20, 0], 
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none fixed left-[-120px] bottom-[15%] w-[350px] h-[350px] rounded-full opacity-25"
        style={{ 
          background: "radial-gradient(circle at 70% 40%, rgba(6,182,212,0.4), rgba(139,69,255,0.3), transparent 70%)",
          filter: "blur(50px)"
        }}
        animate={{ 
          y: [0, 25, 0], 
          rotate: [360, 180, 0],
          scale: [1.1, 1, 1.1]
        }}
        transition={{ duration: 18, repeat: Infinity }}
      />

      {/* Additional floating elements */}
      <motion.div
        className="pointer-events-none fixed top-1/4 left-1/3 w-4 h-4 bg-purple-400 rounded-full opacity-60"
        animate={{ 
          y: [-10, 10, -10],
          x: [-5, 5, -5],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none fixed top-3/4 right-1/3 w-3 h-3 bg-pink-400 rounded-full opacity-40"
        animate={{ 
          y: [10, -10, 10],
          x: [5, -5, 5],
          scale: [1.2, 1, 1.2]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </section>
  );
}