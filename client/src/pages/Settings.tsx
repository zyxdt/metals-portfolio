import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  Settings as SettingsIcon,
  LogOut,
  User,
  Globe,
  Scale,
  Save
} from "lucide-react";
import { toast } from "sonner";

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
];

const WEIGHT_UNITS = [
  { value: 'grams', label: 'Grams (g)' },
  { value: 'ounces', label: 'Troy Ounces (oz)' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  
  const [currency, setCurrency] = useState('USD');
  const [weightUnit, setWeightUnit] = useState<'grams' | 'ounces'>('grams');

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency);
      setWeightUnit(settings.weightUnit);
    }
  }, [settings]);

  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success('Settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const handleSave = () => {
    updateMutation.mutate({
      currency,
      weightUnit,
    });
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
              <Button variant="ghost" size="sm">Portfolio</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-primary">
                <SettingsIcon className="h-4 w-4" />
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences
            </p>
          </div>

          {/* Account Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{user?.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize how you view your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <>
                  {/* Currency */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      Display Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr.value} value={curr.value}>
                            {curr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Note: All prices are fetched in USD. Currency conversion is for display purposes only.
                    </p>
                  </div>

                  {/* Weight Unit */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      Weight Unit
                    </Label>
                    <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEIGHT_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose how weights are displayed throughout the app
                    </p>
                  </div>

                  {/* Save Button */}
                  <Button 
                    onClick={handleSave} 
                    className="w-full gap-2"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="mt-6 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
