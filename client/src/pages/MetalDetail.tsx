import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useParams } from "wouter";
import { 
  Sparkles, 
  Settings,
  LogOut,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Scale,
  DollarSign,
  PieChart,
  Package,
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

const METAL_COLORS: Record<string, string> = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  platinum: '#E5E4E2',
  palladium: '#CED0DD',
};

const METAL_NAMES: Record<string, string> = {
  gold: 'Gold',
  silver: 'Silver',
  platinum: 'Platinum',
  palladium: 'Palladium',
};

export default function MetalDetail() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ metal: string }>();
  const metalType = params.metal as 'gold' | 'silver' | 'platinum' | 'palladium';
  
  const [timeRange, setTimeRange] = useState<TimeRange>("1mo");

  const { data: detail, isLoading: detailLoading } = trpc.portfolio.metalDetail.useQuery(
    { metalType },
    { enabled: !!metalType }
  );

  const { data: history, isLoading: historyLoading } = trpc.prices.getHistory.useQuery({
    metalType,
    range: timeRange,
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const formatChartData = () => {
    if (!history?.data) return [];
    return history.data.map(point => ({
      date: new Date(point.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        ...(timeRange === '1d' && { hour: '2-digit', minute: '2-digit' }),
      }),
      price: point.pricePerOunce,
    }));
  };

  const color = METAL_COLORS[metalType] || '#FFD700';
  const name = METAL_NAMES[metalType] || 'Metal';

  if (!metalType || !['gold', 'silver', 'platinum', 'palladium'].includes(metalType)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invalid metal type</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          
          <div className="flex items-center gap-2">
            <Link href="/prices">
              <Button variant="ghost" size="sm">Prices</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="ghost" size="sm">Portfolio</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Back Button */}
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div 
              className="h-16 w-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <div 
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-muted-foreground">Your {name.toLowerCase()} holdings and price history</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Scale className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Weight</span>
                </div>
                {detailLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      {detail?.totalWeightGrams.toFixed(2) || '0.00'}g
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {detail?.totalWeightOunces.toFixed(3) || '0.000'} oz
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <DollarSign className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Current Value</span>
                </div>
                {detailLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold">
                    ${detail?.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    (detail?.gainLoss || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {(detail?.gainLoss || 0) >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Gain/Loss</span>
                </div>
                {detailLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : detail?.gainLoss !== null ? (
                  <>
                    <p className={`text-2xl font-bold ${
                      (detail?.gainLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(detail?.gainLoss || 0) >= 0 ? '+' : ''}
                      ${Math.abs(detail?.gainLoss || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${
                      (detail?.gainLossPercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(detail?.gainLossPercent || 0) >= 0 ? '+' : ''}
                      {detail?.gainLossPercent?.toFixed(2) || '0.00'}%
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-muted-foreground">N/A</p>
                )}
              </CardContent>
            </Card>

            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <PieChart className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Portfolio Share</span>
                </div>
                {detailLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold">
                    {detail?.portfolioPercentage.toFixed(1) || '0.0'}%
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Chart */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Price History
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
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: color }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              {/* Current Price Info */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price per Oz</p>
                  <p className="font-semibold">
                    ${detail?.currentPricePerOunce.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per Gram</p>
                  <p className="font-semibold">
                    ${detail?.currentPricePerGram.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className={`font-semibold ${
                    (detail?.priceChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(detail?.priceChangePercent || 0) >= 0 ? '+' : ''}
                    {detail?.priceChangePercent?.toFixed(2) || '0.00'}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Holdings</p>
                  <p className="font-semibold">{detail?.holdings.length || 0} items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holdings List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" style={{ color }} />
                Your {name} Holdings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detailLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : detail?.holdings && detail.holdings.length > 0 ? (
                <div className="space-y-3">
                  {detail.holdings.map((holding) => {
                    const currentValue = parseFloat(holding.weightGrams) * (detail.currentPricePerGram || 0);
                    const costBasis = holding.buyPricePerGram 
                      ? parseFloat(holding.weightGrams) * parseFloat(holding.buyPricePerGram)
                      : null;
                    
                    return (
                      <div 
                        key={holding.id}
                        className="p-4 rounded-lg bg-card border border-border"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {parseFloat(holding.weightGrams).toFixed(2)}g
                              <span className="text-muted-foreground ml-2">
                                ({(parseFloat(holding.weightGrams) / 31.1035).toFixed(3)} oz)
                              </span>
                            </p>
                            {holding.buyDate && (
                              <p className="text-sm text-muted-foreground">
                                Purchased {new Date(holding.buyDate).toLocaleDateString()}
                              </p>
                            )}
                            {holding.notes && (
                              <p className="text-sm text-muted-foreground italic mt-1">
                                "{holding.notes}"
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                            {costBasis && (
                              <p className="text-sm text-muted-foreground">
                                Cost: ${costBasis.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You don't have any {name.toLowerCase()} holdings yet
                  </p>
                  <Link href="/portfolio/add">
                    <Button>Add {name} Holding</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
