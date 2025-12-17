import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuthContext } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { useEffect } from "react";

import LandingPage from "@/pages/landing";
import CustomerDashboard from "@/pages/customer/dashboard";
import CylindersPage from "@/pages/customer/cylinders";
import BookingsPage from "@/pages/customer/bookings";
import PaymentsPage from "@/pages/customer/payments";
import AgencyDashboard from "@/pages/agency/dashboard";
import AgencyBookingsPage from "@/pages/agency/bookings";
import InventoryPage from "@/pages/agency/inventory";
import SuppliesPage from "@/pages/agency/supplies";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: "customer" | "agency" }) {
  const { isAuthenticated, userRole } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (userRole !== allowedRole) {
      setLocation(userRole === "customer" ? "/dashboard" : "/agency/dashboard");
    }
  }, [isAuthenticated, userRole, allowedRole, setLocation]);

  if (!isAuthenticated || userRole !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}

function HomePage() {
  const { isAuthenticated, userRole } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "customer") {
        setLocation("/dashboard");
      } else if (userRole === "agency") {
        setLocation("/agency/dashboard");
      }
    }
  }, [isAuthenticated, userRole, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />

      <Route path="/dashboard">
        <ProtectedRoute allowedRole="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/cylinders">
        <ProtectedRoute allowedRole="customer">
          <CylindersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/bookings">
        <ProtectedRoute allowedRole="customer">
          <BookingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/payments">
        <ProtectedRoute allowedRole="customer">
          <PaymentsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/agency/dashboard">
        <ProtectedRoute allowedRole="agency">
          <AgencyDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/agency/bookings">
        <ProtectedRoute allowedRole="agency">
          <AgencyBookingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/agency/inventory">
        <ProtectedRoute allowedRole="agency">
          <InventoryPage />
        </ProtectedRoute>
      </Route>
      <Route path="/agency/supplies">
        <ProtectedRoute allowedRole="agency">
          <SuppliesPage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
