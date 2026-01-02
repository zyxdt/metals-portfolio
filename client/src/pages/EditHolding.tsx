import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useParams } from "wouter";
import { 
  Sparkles, 
  Settings,
  LogOut,
  ArrowLeft,
  Save
} from "lucide-react";
import { toast } from "sonner";

const METAL_OPTIONS = [
  { value: 'gold', label: 'Gold', color: '#FFD700' },
  { value: 'silver', label: 'Silver', color: '#C0C0C0' },
  { value: 'platinum', label: 'Platinum', color: '#E5E4E2' },
  { value: 'palladium', label: 'Palladium', color: '#CED0DD' },
];

export default function EditHolding() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const holdingId = parseInt(params.id || '0');
  const utils = trpc.useUtils();
  
  const { data: holding, isLoading } = trpc.holdings.get.useQuery(
    { id: holdingId },
    { enabled: holdingId > 0 }
  );

  const [metalType, setMetalType] = useState<string>('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'grams' | 'kg' | 'oz'>('grams');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyPriceUnit, setBuyPriceUnit] = useState<'gram' | 'oz'>('gram');
  const [buyDate, setBuyDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (holding) {
      setMetalType(holding.metalType);
      setWeight(holding.weightGrams);
      setWeightUnit('grams');
      if (holding.buyPricePerGram) {
        setBuyPrice(holding.buyPricePerGram);
        setBuyPriceUnit('gram');
      }
      if (holding.buyDate) {
        setBuyDate(new Date(holding.buyDate).toISOString().split('T')[0]);
      }
      setNotes(holding.notes || '');
    }
  }, [holding]);

  const updateMutation = trpc.holdings.update.useMutation({
    onSuccess: () => {
      utils.holdings.list.invalidate();
      utils.holdings.get.invalidate({ id: holdingId });
      utils.portfolio.summary.invalidate();
      toast.success('Holding updated successfully');
      setLocation('/portfolio');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update holding');
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const convertToGrams = (value: number, unit: string): number => {
    switch (unit) {
      case 'kg':
        return value * 1000;
      case 'oz':
        return value * 31.1035;
      default:
        return value;
    }
  };

  const convertPriceToPerGram = (price: number, unit: string): number => {
    if (unit === 'oz') {
      return price / 31.1035;
    }
    return price;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metalType || !weight) {
      toast.error('Please fill in all required fields');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    const weightGrams = convertToGrams(weightValue, weightUnit);
    
    let buyPricePerGram: number | null = null;
    if (buyPrice) {
      const priceValue = parseFloat(buyPrice);
      if (!isNaN(priceValue) && priceValue > 0) {
        buyPricePerGram = convertPriceToPerGram(priceValue, buyPriceUnit);
      }
    }

    updateMutation.mutate({
      id: holdingId,
      metalType: metalType as 'gold' | 'silver' | 'platinum' | 'palladium',
      weightGrams,
      buyPricePerGram,
      buyDate: buyDate ? new Date(buyDate) : null,
      notes: notes || null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Holding not found</p>
          <Link href="/portfolio">
            <Button>Back to Portfolio</Button>
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
        <div className="container max-w-2xl">
          {/* Back Button */}
          <Link href="/portfolio">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-primary" />
                Edit Holding
              </CardTitle>
              <CardDescription>
                Update the details of your precious metal holding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Metal Type */}
                <div className="space-y-2">
                  <Label htmlFor="metalType">Metal Type *</Label>
                  <Select value={metalType} onValueChange={setMetalType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a metal" />
                    </SelectTrigger>
                    <SelectContent>
                      {METAL_OPTIONS.map((metal) => (
                        <SelectItem key={metal.value} value={metal.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: metal.color }}
                            />
                            {metal.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="Enter weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as any)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="oz">Troy Oz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Buy Price */}
                <div className="space-y-2">
                  <Label htmlFor="buyPrice">Purchase Price (Optional)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="buyPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price paid"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                    <Select value={buyPriceUnit} onValueChange={(v) => setBuyPriceUnit(v as any)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gram">Per Gram</SelectItem>
                        <SelectItem value="oz">Per Oz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Buy Date */}
                <div className="space-y-2">
                  <Label htmlFor="buyDate">Purchase Date (Optional)</Label>
                  <Input
                    id="buyDate"
                    type="date"
                    value={buyDate}
                    onChange={(e) => setBuyDate(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this holding..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Link href="/portfolio" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="flex-1 gap-2"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
