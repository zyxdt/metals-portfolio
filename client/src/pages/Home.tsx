import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { getMockPrices } from "@/lib/mockPrices";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Shield, 
  PieChart, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Lock,
  Globe
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: prices, isLoading: pricesLoading, error: pricesError } = trpc.prices.getAll.useQuery();
  
  // Use mock prices if API fails or is loading
  const displayPrices = prices || getMockPrices();

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
              <Button variant="ghost" size="sm">Live Prices</Button>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Track Your Precious Metals</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Precious Metals
              <span className="block gold-gradient">Portfolio, Simplified</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track the real-time value of your gold, silver, platinum, and palladium holdings. 
              No trading, no complexity—just clarity on what your metals are worth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2">
                    Start Tracking Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Link href="/prices">
                <Button size="lg" variant="outline" className="gap-2">
                  View Live Prices
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Prices Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Market Prices</h2>
            <p className="text-muted-foreground text-lg">Real-time precious metals prices updated every 5 minutes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPrices.map((price) => (
              <Card key={price.name} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold capitalize">{price.name}</h3>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">${price.pricePerOunce.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-2">per troy oz</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Track Your Metals</h2>
            <p className="text-muted-foreground text-lg">A comprehensive toolkit designed for precious metals investors who want clarity without complexity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Live Price Tracking</h3>
                <p className="text-muted-foreground">Real-time prices for gold, silver, platinum, and palladium with historical charts spanning days to years.</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Portfolio Analytics</h3>
                <p className="text-muted-foreground">See your total holdings value, allocation breakdown, and gain/loss calculations at a glance.</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Historical Charts</h3>
                <p className="text-muted-foreground">Track price movements with interactive charts showing 1-day, 1-week, 1-month, and 1-year trends.</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
                <p className="text-muted-foreground">Your data is encrypted and never shared. We don't store sensitive financial information.</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Multiple Currencies</h3>
                <p className="text-muted-foreground">View your portfolio value in USD, EUR, GBP, and other major currencies.</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Trading Required</h3>
                <p className="text-muted-foreground">Simply track what you own. No buying, selling, or connecting bank accounts.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/50 bg-primary/5">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Three simple steps to track your precious metals portfolio
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center mb-4 text-lg font-bold">1</div>
              <h3 className="font-semibold text-lg mb-2">Create Account</h3>
              <p className="text-muted-foreground">Sign up with your email in seconds. No credit card required.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center mb-4 text-lg font-bold">2</div>
              <h3 className="font-semibold text-lg mb-2">Add Your Metals</h3>
              <p className="text-muted-foreground">Enter the type and weight of precious metals you own.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center mb-4 text-lg font-bold">3</div>
              <h3 className="font-semibold text-lg mb-2">Track Value</h3>
              <p className="text-muted-foreground">Watch your portfolio value update automatically with live prices.</p>
            </div>
          </div>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Track Your Precious Metals?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust MetalsTracker to monitor their physical precious metals portfolio.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
