"use client";

import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Toaster } from "../../components/ui/sonner";
import { BackgroundParticles } from "../../components/BackgroundParticles";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader as UITableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { motion } from "framer-motion";

export default function PortfolioPage() {
  // Mock data; replace with real wallet data later
  const aptosAssets = [
    { name: "APT", logo: "/tokens/apt.svg", fallback: "A", amount: 123.45, valueUSD: 987.65 },
    { name: "tAPT (Staked)", logo: "/tokens/apt.svg", fallback: "tA", amount: 50.0, valueUSD: 399.5 },
  ];

  const memeCoins = [
    { name: "DOGEAPT", logo: "/tokens/dogeapt.svg", fallback: "D", amount: 120000, valueUSD: 120.23 },
    { name: "PEPEAPT", logo: "/tokens/pepeapt.svg", fallback: "P", amount: 450000, valueUSD: 86.12 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BackgroundParticles />
      <Header />

      <main className="relative z-10 py-10">
        <div className="container mx-auto px-4 space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gradient-primary">Your Portfolio</h2>
              <Badge variant="outline" className="bg-gradient-primary/20 border-primary/30 text-primary">Aptos Mainnet</Badge>
            </div>
            <p className="text-muted-foreground mt-1">Overview of your Aptos assets and Meme coins.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aptos Assets */}
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
                      {aptosAssets.map((a) => (
                        <TableRow key={a.name}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage src={a.logo} alt={a.name} />
                                <AvatarFallback>{a.fallback}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{a.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{a.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${a.valueUSD.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Meme Coins */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
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
                      {memeCoins.map((m) => (
                        <TableRow key={m.name}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage src={m.logo} alt={m.name} />
                                <AvatarFallback>{m.fallback}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{m.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{m.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${m.valueUSD.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  );
}
