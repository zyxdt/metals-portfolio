import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  Plus,
  Settings,
  LogOut,
  Trash2,
  Edit,
  Package,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

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

export default function Portfolio() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: holdings, isLoading } = trpc.holdings.list.useQuery();
  const { data: prices } = trpc.prices.getAll.useQuery();
  
  const deleteMutation = trpc.holdings.delete.useMutation({
    onSuccess: () => {
      utils.holdings.list.invalidate();
      utils.portfolio.summary.invalidate();
      toast.success('Holding deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete holding');
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const getPricePerGram = (metalType: string) => {
    const price = prices?.find(p => p.metalType === metalType);
    return price?.pricePerGram || 0;
  };

  const calculateValue = (metalType: string, weightGrams: string) => {
    return parseFloat(weightGrams) * getPricePerGram(metalType);
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
          
          <div className="flex items-center gap-2">
            <Link href="/prices">
              <Button variant="ghost" size="sm">Prices</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="ghost" size="sm" className="text-primary">Portfolio</Button>
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
              <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
              <p className="text-muted-foreground">
                Manage your precious metals holdings
              </p>
            </div>
            <Link href="/portfolio/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Holding
              </Button>
            </Link>
          </div>

          {/* Holdings List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Holdings ({holdings?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : holdings && holdings.length > 0 ? (
                <div className="space-y-4">
                  {holdings.map((holding) => {
                    const currentValue = calculateValue(holding.metalType, holding.weightGrams);
                    const costBasis = holding.buyPricePerGram 
                      ? parseFloat(holding.weightGrams) * parseFloat(holding.buyPricePerGram)
                      : null;
                    const gainLoss = costBasis ? currentValue - costBasis : null;
                    
                    return (
                      <div 
                        key={holding.id}
                        className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div 
                              className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${METAL_COLORS[holding.metalType]}20` }}
                            >
                              <div 
                                className="h-5 w-5 rounded-full"
                                style={{ backgroundColor: METAL_COLORS[holding.metalType] }}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">
                                {METAL_NAMES[holding.metalType]}
                              </p>
                              <p className="text-muted-foreground">
                                {parseFloat(holding.weightGrams).toFixed(2)}g 
                                ({(parseFloat(holding.weightGrams) / 31.1035).toFixed(3)} oz)
                              </p>
                              {holding.buyDate && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  Purchased {new Date(holding.buyDate).toLocaleDateString()}
                                </p>
                              )}
                              {holding.notes && (
                                <p className="text-sm text-muted-foreground mt-1 italic">
                                  "{holding.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                            {costBasis && (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  Cost: ${costBasis.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                                <p className={`text-sm font-medium ${
                                  (gainLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {(gainLoss || 0) >= 0 ? '+' : ''}
                                  ${Math.abs(gainLoss || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                              </>
                            )}
                            
                            <div className="flex items-center gap-2 mt-3 justify-end">
                              <Link href={`/portfolio/edit/${holding.id}`}>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Holding</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this {METAL_NAMES[holding.metalType]} holding? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate({ id: holding.id })}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Holdings Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start tracking your precious metals by adding your first holding. 
                    Enter the metal type, weight, and optional purchase details.
                  </p>
                  <Link href="/portfolio/add">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Holding
                    </Button>
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
