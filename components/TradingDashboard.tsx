"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// Mock chart data
const chartData = [
  { time: "00:00", price: 0.000042, volume: 120 },
  { time: "04:00", price: 0.000045, volume: 150 },
  { time: "08:00", price: 0.000038, volume: 180 },
  { time: "12:00", price: 0.000052, volume: 220 },
  { time: "16:00", price: 0.000048, volume: 190 },
  { time: "20:00", price: 0.000055, volume: 250 },
  { time: "24:00", price: 0.000061, volume: 280 },
];

const orderBookData = {
  bids: [
    { price: 0.000058, amount: 1250000, total: 72.5 },
    { price: 0.000057, amount: 2100000, total: 119.7 },
    { price: 0.000056, amount: 1800000, total: 100.8 },
    { price: 0.000055, amount: 3200000, total: 176.0 },
    { price: 0.000054, amount: 2500000, total: 135.0 },
  ],
  asks: [
    { price: 0.000062, amount: 1100000, total: 68.2 },
    { price: 0.000063, amount: 1900000, total: 119.7 },
    { price: 0.000064, amount: 1600000, total: 102.4 },
    { price: 0.000065, amount: 2800000, total: 182.0 },
    { price: 0.000066, amount: 2200000, total: 145.2 },
  ]
};

export function TradingDashboard() {
  // Avoid SSR/CSR mismatch from chart measurements
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-morphism border border-primary/30 mb-4">
            <BarChart3 className="w-4 h-4 text-accent mr-2" />
            <span className="text-sm">Live Trading</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            Advanced <span className="text-gradient-primary">Trading</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional trading interface with real-time charts, order books, and advanced analytics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Chart Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="xl:col-span-3 space-y-6"
          >
            {/* Token Info */}
            <Card className="glass-morphism border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center neon-glow-pink">
                      <span className="font-bold text-white">MD</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">MoonDoge / USDT</h3>
                      <p className="text-muted-foreground">MDOGE</p>
                    </div>
                  </div>
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    🔥 HOT
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatItem 
                    label="Price" 
                    value="$0.000061" 
                    change="+45.2%" 
                    positive={true}
                  />
                  <StatItem 
                    label="24h Volume" 
                    value="$1.2M" 
                    change="+23%" 
                    positive={true}
                  />
                  <StatItem 
                    label="Market Cap" 
                    value="$8.4M" 
                    change="+18%" 
                    positive={true}
                  />
                  <StatItem 
                    label="Holders" 
                    value="2,847" 
                    change="+156" 
                    positive={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="glass-morphism border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Price Chart</span>
                  <Tabs defaultValue="1h" className="w-auto">
                    <TabsList className="bg-muted/20">
                      <TabsTrigger value="1h">1H</TabsTrigger>
                      <TabsTrigger value="1d">1D</TabsTrigger>
                      <TabsTrigger value="1w">1W</TabsTrigger>
                      <TabsTrigger value="1m">1M</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mounted ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--neon-green)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--neon-green)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toFixed(6)}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="var(--neon-green)"
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80" />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trading Panel */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Trading Form */}
            <Card className="glass-morphism border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Quick Trade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="buy" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buy" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Amount (USDT)</label>
                      <Input placeholder="0.00" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Price</label>
                      <Input placeholder="Market Price" className="mt-1" />
                    </div>
                    <Button className="w-full bg-gradient-secondary neon-glow-green hover:neon-glow-cyan transition-all duration-300">
                      <Zap className="w-4 h-4 mr-2" />
                      Buy MDOGE
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="sell" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Amount (MDOGE)</label>
                      <Input placeholder="0.00" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Price</label>
                      <Input placeholder="Market Price" className="mt-1" />
                    </div>
                    <Button className="w-full bg-destructive neon-glow-pink hover:neon-glow-cyan transition-all duration-300">
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Sell MDOGE
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card className="glass-morphism border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Order Book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground grid grid-cols-3 gap-2 mb-2">
                    <span>Price</span>
                    <span>Amount</span>
                    <span>Total</span>
                  </div>
                  
                  {/* Asks */}
                  <div className="space-y-1">
                    {[...orderBookData.asks].reverse().map((ask, index) => (
                      <div key={index} className="text-xs grid grid-cols-3 gap-2 text-destructive">
                        <span>{ask.price.toFixed(6)}</span>
                        <span>{(ask.amount / 1000000).toFixed(1)}M</span>
                        <span>${ask.total.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Spread */}
                  <div className="py-2 text-center border-y border-border">
                    <span className="text-xs text-muted-foreground">Spread: 0.000004</span>
                  </div>
                  
                  {/* Bids */}
                  <div className="space-y-1">
                    {orderBookData.bids.map((bid, index) => (
                      <div key={index} className="text-xs grid grid-cols-3 gap-2 text-accent">
                        <span>{bid.price.toFixed(6)}</span>
                        <span>{(bid.amount / 1000000).toFixed(1)}M</span>
                        <span>${bid.total.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ label, value, change, positive }: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      <p className={`text-sm flex items-center ${positive ? "text-accent" : "text-destructive"}`}>
        {positive ? (
          <TrendingUp className="w-3 h-3 mr-1" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-1" />
        )}
        {change}
      </p>
    </div>
  );
}