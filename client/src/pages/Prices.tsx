import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = "1d" | "1w" | "1mo" | "1y";
type MetalType = "gold" | "silver" | "platinum" | "palladium";

const TROY_OUNCE_TO_GRAMS = 31.1035;

export default function Prices() {
  const { isAuthenticated } = useAuth();
  const [selectedMetal, setSelectedMetal] = useState<MetalType>("gold");
  const [timeRange, setTimeRange] = useState<TimeRange>("1mo");
  
  const { data: prices, isLoading: pricesLoading, refetch } = trpc.prices.getAll.useQuery();
  const { data: history, isLoading: historyLoading } = trpc.prices.getHistory.useQuery({
    metalType: selectedMetal,
    range: timeRange,
  });

  const selectedPrice = prices?.find(p => p.metalType === selectedMetal);

  const formatChartData = () => {
    if (!history?.data) return [];
    return history.data.map(point => ({
      date: new Date(point.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        ...(timeRange === '1d' && { hour: '2-digit', minute: '2-digit' }),
      }),
      price: point.pricePerOunce,
      pricePerGram: point.pricePerGram,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">MetalsTracker</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/prices">
              <Button variant="ghost" size="sm" className="text-primary">Live Prices</Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Get Started</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Live Precious Metals Prices</h1>
              <p className="text-muted-foreground">
                Real-time market prices updated every 5 minutes
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 w-fit"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Prices
            </Button>
          </div>

          {/* Price Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {pricesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="metal-card cursor-pointer">
                  <CardContent className="p-6">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded mb-3" />
                    <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))
            ) : (
              prices?.map((metal) => (
                <Card 
                  key={metal.metalType} 
                  className={`metal-card cursor-pointer transition-all ${
                    selectedMetal === metal.metalType 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                  onClick={() => setSelectedMetal(metal.metalType as MetalType)}
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20"
                      style={{ backgroundColor: metal.color }}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: metal.color }}
                      />
                      <p className="text-sm font-medium text-muted-foreground">{metal.name}</p>
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      ${metal.pricePerOunce.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-1">
                      {(metal.changePercent || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        (metal.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(metal.changePercent || 0) >= 0 ? '+' : ''}
                        {metal.changePercent?.toFixed(2) || '0.00'}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Chart Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                  {history?.name || 'Gold'} Price Chart
                </CardTitle>
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="1d" className="text-xs px-3">1D</TabsTrigger>
                    <TabsTrigger value="1w" className="text-xs px-3">1W</TabsTrigger>
                    <TabsTrigger value="1mo" className="text-xs px-3">1M</TabsTrigger>
                    <TabsTrigger value="1y" className="text-xs px-3">1Y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  {historyLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [
                            `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                            'Price per oz'
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={history?.color || '#FFD700'}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: history?.color || '#FFD700' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedPrice && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div 
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: selectedPrice.color }}
                        />
                        <span className="font-semibold text-lg">{selectedPrice.name}</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Per Troy Ounce</span>
                          <span className="font-semibold">
                            ${selectedPrice.pricePerOunce.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Per Gram</span>
                          <span className="font-semibold">
                            ${selectedPrice.pricePerGram.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Day High</span>
                          <span className="font-semibold">
                            ${selectedPrice.dayHigh?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Day Low</span>
                          <span className="font-semibold">
                            ${selectedPrice.dayLow?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-muted-foreground">Previous Close</span>
                          <span className="font-semibold">
                            ${selectedPrice.previousClose?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-4">
                        Prices are fetched from Yahoo Finance and represent futures contract prices. 
                        Actual physical metal prices may vary.
                      </p>
                      
                      {!isAuthenticated && (
                        <a href={getLoginUrl()}>
                          <Button className="w-full gap-2">
                            Track Your Portfolio
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CTA for non-authenticated users */}
          {!isAuthenticated && (
            <Card className="mt-8 glass-card">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Start Tracking Your Metals</h2>
                <p className="text-muted-foreground mb-6">
                  Create a free account to track your precious metals portfolio with live prices.
                </p>
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
