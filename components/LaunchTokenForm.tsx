"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Rocket, Wallet, ShieldCheck } from "lucide-react";

export default function LaunchTokenForm() {
  const [network, setNetwork] = useState("solana");

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
                    <Label htmlFor="name">Token Name</Label>
                    <Input id="name" placeholder="Dugems Token" className="bg-muted/20" />
                  </div>
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input id="symbol" placeholder="DGM" className="bg-muted/20" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supply">Total Supply</Label>
                    <Input id="supply" placeholder="1000000000" type="number" className="bg-muted/20" />
                  </div>
                  <div>
                    <Label htmlFor="decimals">Decimals</Label>
                    <Input id="decimals" placeholder="9" type="number" className="bg-muted/20" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Network</Label>
                    <Select value={network} onValueChange={setNetwork}>
                      <SelectTrigger className="bg-muted/20">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solana">Solana</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="bsc">BNB Chain</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="owner">Owner wallet</Label>
                    <Input id="owner" placeholder="Your wallet address" className="bg-muted/20" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Verified template, upgradeable disabled by default
                  </div>
                  <Button className="bg-gradient-primary border-0 neon-glow-pink">
                    <Wallet className="w-4 h-4 mr-2" /> Deploy token
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
                  <div className="text-2xl font-semibold">~ 0.0021 {network === "solana" ? "SOL" : network === "ethereum" ? "ETH" : network === "bsc" ? "BNB" : "MATIC"}</div>
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
