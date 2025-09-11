"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Rocket, Wallet, ShieldCheck } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export default function LaunchTokenForm() {
  // IMPORTANT: Ganti alamat berikut dengan address paket Move Anda yang telah dipublish
  // Misal: "0x1234abcd..." (tanpa ::token_factory)
  const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR || "0xBULLPUMP_ADDRESS_HERE";

  const { account, signAndSubmitTransaction, signTransaction } = useWallet() as any;
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState<string>("");
  const [decimals, setDecimals] = useState<string>("8");
  const [iconUri, setIconUri] = useState("");
  const [projectUri, setProjectUri] = useState("");
  const [mintFee, setMintFee] = useState<string>("");
  const [preMint, setPreMint] = useState<string>("");
  const [mintLimit, setMintLimit] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL || "https://api.testnet.aptoslabs.com";
  const FAUCET_URL = process.env.NEXT_PUBLIC_APTOS_FAUCET_URL || "https://faucet.testnet.aptoslabs.com";
  const READINESS_URL = process.env.NEXT_PUBLIC_APTOS_READINESS_URL || "http://127.0.0.1:8070/";
  const client = useMemo(() => new Aptos(new AptosConfig({ network: Network.CUSTOM, fullnode: NODE_URL, faucet: FAUCET_URL })), [NODE_URL, FAUCET_URL]);

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
  
      // Cek saldo APT
      try {
        const balance = await client.getAccountAPTAmount({
          accountAddress: account.address,
        });
        if (balance < 1000000) {
          toast.error("Insufficient APT balance", {
            description: "Get APT from faucet: https://faucet.testnet.aptoslabs.com"
          });
          return;
        }
      } catch (e) {
        console.warn("Could not check balance:", e);
      }
  
      // ✅ Argumen harus flat, bukan array nested
      const functionArguments: any[] = [
        supply && Number(supply) > 0 ? supply.trim() : null,   // Option<u128>
        name.trim(),                                           // string
        symbol.trim(),                                         // string
        Number(decimals || 8),                                 // u8
        iconUri.trim() || "",                                  // string
        projectUri.trim() || "",                               // string
        mintFee && Number(mintFee) > 0 ? mintFee.trim() : null, // Option<u64>
        preMint && Number(preMint) > 0 ? preMint.trim() : null, // Option<u64>
        mintLimit && Number(mintLimit) > 0 ? mintLimit.trim() : null, // Option<u64>
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
  
      toast.info("Submitting transaction...", { description: txHash });
      await client.waitForTransaction({ transactionHash: txHash! });
      toast.success("Token created", { description: `Tx: ${txHash}` });
  
      // Reset field
      setName("");
      setSymbol("");
      setSupply("");
      setPreMint("");
      setMintFee("");
      setMintLimit("");
    } catch (e: any) {
      console.error("Deployment error:", e);
      toast.error("Failed to deploy", { description: e?.message || String(e) });
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
          <Badge variant="outline" className="bg-gradient-primary/20 border-primary/30 text-primary">Beta</Badge>
          <h2 className="mt-3 text-3xl font-bold text-gradient-primary">Launch your token</h2>
          <p className="mt-2 text-muted-foreground">Create and deploy a token in minutes. Fully on-chain and fee-transparent.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="liquid-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" /> Token configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Token Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Dugems Token" 
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
                      placeholder="DGM" 
                      className="bg-muted/20" 
                      value={symbol} 
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supply">Total Supply</Label>
                    <Input 
                      id="supply" 
                      placeholder="1000000000 (leave empty = uncapped)" 
                      type="number" 
                      className="bg-muted/20" 
                      value={supply} 
                      onChange={(e) => setSupply(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="decimals">Decimals</Label>
                    <Input 
                      id="decimals" 
                      placeholder="8" 
                      type="number" 
                      min="0" 
                      max="18" 
                      className="bg-muted/20" 
                      value={decimals} 
                      onChange={(e) => setDecimals(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon URI</Label>
                    <Input 
                      id="icon" 
                      placeholder="https://..." 
                      className="bg-muted/20" 
                      value={iconUri} 
                      onChange={(e) => setIconUri(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="project">Project URI</Label>
                    <Input 
                      id="project" 
                      placeholder="https://..." 
                      className="bg-muted/20" 
                      value={projectUri} 
                      onChange={(e) => setProjectUri(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mintfee">Mint Fee (octas per token)</Label>
                    <Input 
                      id="mintfee" 
                      placeholder="0" 
                      type="number" 
                      min="0"
                      className="bg-muted/20" 
                      value={mintFee} 
                      onChange={(e) => setMintFee(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="premint">Pre-mint Amount</Label>
                    <Input 
                      id="premint" 
                      placeholder="0" 
                      type="number" 
                      min="0"
                      className="bg-muted/20" 
                      value={preMint} 
                      onChange={(e) => setPreMint(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="mintlimit">Mint Limit per Address</Label>
                    <Input 
                      id="mintlimit" 
                      placeholder="(optional)" 
                      type="number" 
                      min="0"
                      className="bg-muted/20" 
                      value={mintLimit} 
                      onChange={(e) => setMintLimit(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Verified template, upgradeable disabled by default
                  </div>
                  <Button 
                    className="bg-gradient-primary border-0 neon-glow-pink" 
                    onClick={handleDeploy} 
                    disabled={submitting || !name.trim() || !symbol.trim()}
                  >
                    <Wallet className="w-4 h-4 mr-2" /> 
                    {submitting ? "Deploying..." : "Deploy token"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="liquid-glass">
              <CardHeader>
                <CardTitle>Preview & Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl p-4 bg-muted/20">
                  <div className="text-sm text-muted-foreground">Estimated deployment fee</div>
                  <div className="text-2xl font-semibold">Network: Aptos (TESTNET)</div>
                  <div className="text-xs text-muted-foreground break-all">Node: {NODE_URL}</div>
                  <div className="text-xs text-muted-foreground break-all">Readiness: {READINESS_URL}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Fees vary by network and congestion. You will confirm the transaction in your wallet.
                </div>
                <Tabs defaultValue="standard">
                  <TabsList className="bg-muted/20">
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="fair" disabled>Fair Launch</TabsTrigger>
                    <TabsTrigger value="bonding" disabled>Bonding Curve</TabsTrigger>
                  </TabsList>
                  <TabsContent value="standard" className="space-y-3 text-sm text-muted-foreground">
                    <p>Standard mint without additional tokenomics. Ideal for simple launches.</p>
                  </TabsContent>
                </Tabs>
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