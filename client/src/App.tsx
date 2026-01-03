import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseProvider, useSupabase } from "./contexts/SupabaseContext";
import Home from "./pages/Home";
import Prices from "./pages/Prices";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import AddHolding from "./pages/AddHolding";
import EditHolding from "./pages/EditHolding";
import Settings from "./pages/Settings";
import MetalDetail from "./pages/MetalDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Protected route wrapper using Supabase
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useSupabase();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/prices" component={Prices} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/portfolio">
        <ProtectedRoute component={Portfolio} />
      </Route>
      <Route path="/portfolio/add">
        <ProtectedRoute component={AddHolding} />
      </Route>
      <Route path="/portfolio/edit/:id">
        <ProtectedRoute component={EditHolding} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/metal/:metal">
        <ProtectedRoute component={MetalDetail} />
      </Route>
      
      {/* Fallback routes */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SupabaseProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseProvider>
    </ErrorBoundary>
  );
}

export default App;
