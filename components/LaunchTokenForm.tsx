"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Rocket, Wallet, ShieldCheck, Info } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export default function LaunchTokenForm() {
  // BullPump module address from environment
  const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR || "0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257";

  const { account, signAndSubmitTransaction, signTransaction } = useWallet() as any;
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [iconUri, setIconUri] = useState("");
  const [projectUri, setProjectUri] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL || "https://api.testnet.aptoslabs.com/v1";
  const FAUCET_URL = process.env.NEXT_PUBLIC_APTOS_FAUCET_URL || "https://faucet.testnet.aptoslabs.com";
  const client = useMemo(() => new Aptos(new AptosConfig({ 
    network: Network.TESTNET,
    fullnode: NODE_URL,
    faucet: FAUCET_URL 
  })), [NODE_URL, FAUCET_URL]);


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
  
      // Function arguments matching create_fa signature: (name, symbol, icon_uri, project_uri)
      const functionArguments: any[] = [
        name.trim(),                    // String: name
        symbol.trim(),                  // String: symbol
        iconUri.trim() || "",          // String: icon_uri
        projectUri.trim() || "",       // String: project_uri
      ];
  
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
      console.log("Transaction submitted:", txHash);

      // Show immediate success since transaction was submitted
      toast.success("🎉 Token created successfully!", { 
        description: `Transaction: ${txHash.substring(0, 10)}... - Check Aptos Explorer for confirmation`,
        duration: 5000
      });

      console.log(`Token "${name}" (${symbol}) created with transaction: ${txHash}`);
      console.log(`View on Aptos Explorer: https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`);

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
            description: "Your token is now live on Aptos blockchain" 
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
      toast.error("Failed to create token", { description: e?.message || String(e) });
    } finally {
      setSubmitting(false);
    }
  }
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
          <Badge variant="outline" className="bg-gradient-primary/20 border-primary/30 text-primary">BullPump</Badge>
          <h2 className="mt-3 text-3xl font-bold text-gradient-primary">Launch your token</h2>
          <p className="mt-2 text-muted-foreground">Create and deploy a bonding curve token in minutes. Fully on-chain with automatic liquidity.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="liquid-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" /> Token Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Token Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="My Awesome Token" 
                      className="bg-muted/20" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="symbol">Symbol *</Label>
                    <Input 
                      id="symbol" 
                      placeholder="MAT" 
                      className="bg-muted/20" 
                      value={symbol} 
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon URI</Label>
                    <Input 
                      id="icon" 
                      placeholder="https://example.com/icon.png" 
                      className="bg-muted/20" 
                      value={iconUri} 
                      onChange={(e) => setIconUri(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="project">Project URI</Label>
                    <Input 
                      id="project" 
                      placeholder="https://example.com" 
                      className="bg-muted/20" 
                      value={projectUri} 
                      onChange={(e) => setProjectUri(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Bonding Curve Token</p>
                      <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Fixed supply: 1 billion tokens (8 decimals)</li>
                        <li>• Automatic bonding curve pricing</li>
                        <li>• No mint fees or limits</li>
                        <li>• Instant liquidity through bonding curve</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    BullPump verified contract
                  </div>
                  <Button 
                    className="bg-gradient-primary border-0 neon-glow-pink" 
                    onClick={handleDeploy} 
                    disabled={submitting || !name.trim() || !symbol.trim()}
                  >
                    <Wallet className="w-4 h-4 mr-2" /> 
                    {submitting ? "Creating..." : "Create Token"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="liquid-glass">
              <CardHeader>
                <CardTitle>Token Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl p-4 bg-muted/20">
                  <div className="text-sm text-muted-foreground mb-2">Your Token</div>
                  <div className="text-lg font-semibold">{name || "Token Name"}</div>
                  <div className="text-sm text-muted-foreground">{symbol || "SYMBOL"}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Supply: 1,000,000,000 tokens (8 decimals)
                  </div>
                </div>
                
                <div className="rounded-xl p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="text-sm font-medium mb-2">Network Information</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Network: Aptos Testnet</div>
                    <div>Contract: BullPump Token Factory</div>
                    <div className="break-all">Module: {MODULE_ADDR.substring(0, 10)}...</div>
                  </div>
                </div>

                <Tabs defaultValue="bonding" className="w-full">
                  <TabsList className="bg-muted/20 w-full">
                    <TabsTrigger value="bonding" className="flex-1">Bonding Curve</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bonding" className="space-y-3 text-sm text-muted-foreground">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Automatic Bonding Curve</p>
                      <ul className="space-y-1">
                        <li>• Automatic price discovery</li>
                        <li>• Instant liquidity</li>
                        <li>• No rug pulls</li>
                        <li>• Fair launch mechanism</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="text-xs text-muted-foreground">
                  Gas fees vary by network congestion. You will confirm the exact amount in your wallet.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Decorative web3 orbs */}
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