import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BookingPage from "@/pages/booking-page";
import BookingDetailsPage from "@/pages/booking-details";
import TrackingPage from "@/pages/tracking-page";
import DriverBookingManagement from "@/pages/driver/booking-management";
import DriverDashboard from "@/pages/driver/dashboard";
import DriverHistory from "@/pages/driver/history";
import CustomerDashboard from "@/pages/customer/dashboard";
import RoleSelectionPage from "@/pages/role-selection-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      
      {/* Customer Routes */}
      <ProtectedRoute path="/customer/dashboard" component={() => <CustomerDashboard />} />
      <ProtectedRoute path="/booking" component={() => <BookingPage />} />
      <ProtectedRoute path="/booking/details" component={() => <BookingDetailsPage />} />
      
      {/* Driver Routes */}
      <ProtectedRoute path="/driver/dashboard" component={() => <DriverDashboard />} />
      <ProtectedRoute path="/driver/bookings" component={() => <DriverBookingManagement />} />
      <ProtectedRoute path="/driver/history" component={() => <DriverHistory />} />
      
      {/* Common Routes */}
      <ProtectedRoute path="/tracking" component={() => <TrackingPage />} />
      <ProtectedRoute path="/role-selection" component={() => <RoleSelectionPage />} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;