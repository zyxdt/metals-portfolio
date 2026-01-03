import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { HorizontalAd } from "@/components/AdSense";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Settings,
  LogOut,
  BarChart3,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: summary, isLoading: summaryLoading } = trpc.portfolio.summary.useQuery();
  const { data: prices } = trpc.prices.getAll.useQuery();

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const pieData = summary?.byMetal.map(metal => ({
    name: metal.name,
    value: metal.value,
    color: metal.color,
    percentage: metal.percentage,
  })) || [];

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
              <Button variant="ghost" size="sm" className="text-primary">Dashboard</Button>
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your precious metals portfolio
              </p>
            </div>
            <Link href="/portfolio/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Holding
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Value</span>
                </div>
                {summaryLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-3xl font-bold">
                    ${summary?.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                </div>
                {summaryLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-3xl font-bold">
                    ${summary?.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    (summary?.gainLoss || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {(summary?.gainLoss || 0) >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Gain/Loss</span>
                </div>
                {summaryLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <p className={`text-3xl font-bold ${
                    (summary?.gainLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(summary?.gainLoss || 0) >= 0 ? '+' : ''}
                    ${Math.abs(summary?.gainLoss || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="metal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    (summary?.gainLossPercent || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {(summary?.gainLossPercent || 0) >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Return</span>
                </div>
                {summaryLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <p className={`text-3xl font-bold ${
                    (summary?.gainLossPercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(summary?.gainLossPercent || 0) >= 0 ? '+' : ''}
                    {summary?.gainLossPercent?.toFixed(2) || '0.00'}%
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Allocation Chart */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
                  </div>
                ) : pieData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [
                            `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                            'Value'
                          ]}
                        />
                        <Legend 
                          verticalAlign="bottom"
                          formatter={(value, entry: any) => (
                            <span className="text-sm text-foreground">
                              {value} ({entry.payload.percentage.toFixed(1)}%)
                            </span>
                          )}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No holdings yet</p>
                    <Link href="/portfolio/add">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Holding
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metal Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Holdings by Metal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : summary?.byMetal && summary.byMetal.length > 0 ? (
                  <div className="space-y-4">
                    {summary.byMetal.map((metal) => {
                      const price = prices?.find(p => p.metalType === metal.metalType);
                      return (
                        <Link key={metal.metalType} href={`/metal/${metal.metalType}`}>
                          <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${metal.color}20` }}
                                >
                                  <div 
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: metal.color }}
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold">{metal.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {metal.weight.toFixed(2)}g ({(metal.weight / 31.1035).toFixed(3)} oz)
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  ${metal.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {metal.percentage.toFixed(1)}% of portfolio
                                </p>
                              </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${metal.percentage}%`,
                                  backgroundColor: metal.color 
                                }}
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Start building your portfolio by adding your first holding
                    </p>
                    <Link href="/portfolio/add">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Holding
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Prices */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Current Market Prices
                </span>
                <Link href="/prices">
                  <Button variant="ghost" size="sm">View Charts</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prices?.map((metal) => (
                  <div 
                    key={metal.metalType}
                    className="p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: metal.color }}
                      />
                      <span className="text-sm text-muted-foreground">{metal.name}</span>
                    </div>
                    <p className="text-xl font-bold">
                      ${metal.pricePerOunce.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${
                      (metal.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(metal.changePercent || 0) >= 0 ? '+' : ''}
                      {metal.changePercent?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ad Space - Bottom */}
        <div className="mt-6 mb-6">
          <HorizontalAd />
        </div>
      </main>
    </div>
  );
}
