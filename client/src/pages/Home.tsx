import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
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
  const { data: prices, isLoading: pricesLoading } = trpc.prices.getAll.useQuery();

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
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Prices Preview */}
      <section className="py-16 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold mb-2">Live Market Prices</h2>
            <p className="text-muted-foreground">Real-time precious metals prices updated every 5 minutes</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pricesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="metal-card">
                  <CardContent className="p-6">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-8 w-32 bg-muted animate-pulse rounded mb-1" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))
            ) : (
              prices?.map((metal) => (
                <Card key={metal.metalType} className="metal-card overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div 
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
                      style={{ backgroundColor: metal.color }}
                    />
                    <p className="text-sm text-muted-foreground mb-1">{metal.name}</p>
                    <p className="text-2xl font-bold mb-1">
                      ${metal.pricePerOunce.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm font-medium ${
                      (metal.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(metal.changePercent || 0) >= 0 ? '+' : ''}
                      {metal.changePercent?.toFixed(2) || '0.00'}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">per troy oz</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/prices">
              <Button variant="outline" className="gap-2">
                View Detailed Charts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Track Your Metals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit designed for precious metals investors who want clarity without complexity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Live Price Tracking"
              description="Real-time prices for gold, silver, platinum, and palladium with historical charts spanning days to years."
            />
            <FeatureCard
              icon={<PieChart className="h-6 w-6" />}
              title="Portfolio Analytics"
              description="See your total holdings value, allocation breakdown, and gain/loss calculations at a glance."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Historical Charts"
              description="Track price movements with interactive charts showing 1-day, 1-week, 1-month, and 1-year trends."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure & Private"
              description="Your data is encrypted and never shared. We don't store sensitive financial information."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Multiple Currencies"
              description="View your portfolio value in USD, EUR, GBP, and other major currencies."
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="No Trading Required"
              description="Simply track what you own. No buying, selling, or connecting bank accounts."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-muted-foreground">Three simple steps to track your precious metals portfolio</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Create Account"
              description="Sign up with your email in seconds. No credit card required."
            />
            <StepCard
              number="2"
              title="Add Your Metals"
              description="Enter the type and weight of precious metals you own."
            />
            <StepCard
              number="3"
              title="Track Value"
              description="Watch your portfolio value update automatically with live prices."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="glass-card gold-glow overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
              <div className="relative">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Track Your Precious Metals?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">MetalsTracker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MetalsTracker. Track your precious metals with confidence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="metal-card">
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
