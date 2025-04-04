import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Truck, Package, MapPin, Clock, Loader2 } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { useAuth } from "@/hooks/use-auth";

// This is our main HomePage component that handles routing logic
export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If user has a role, redirect to the appropriate dashboard
  useEffect(() => {
    if (user && user.role === "customer") {
      // Don't redirect if we're already on the dashboard
      if (window.location.pathname === "/") {
        setLocation("/customer/dashboard");
      }
    } else if (user && user.role === "driver") {
      // Don't redirect if we're already on the dashboard
      if (window.location.pathname === "/") {
        setLocation("/driver/dashboard");
      }
    } else if (user && !user.role) {
      // If user doesn't have a role yet, redirect to role selection
      setLocation("/role-selection");
    }
    // We don't redirect for non-logged-in users - they see the landing page
  }, [user, setLocation]);

  // If still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If user is not logged in, show the landing page
  if (!user) {
    return <LandingPage />;
  }

  // If we're still on this page after logging in but before redirection, show loading
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// This is the landing page - the original home page design for users who are not logged in
function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-6">
            Professional Cargo Transport Solutions
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            From small deliveries to large freight, we connect you with reliable
            transport services tailored to your needs.
          </p>
          <Link href="/auth">
            <Button size="lg" className="font-semibold">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <FeatureCard
            icon={Truck}
            title="Various Vehicles"
            description="Choose from our fleet of 3.5-ton vans to 18-wheeler trucks"
          />
          <FeatureCard
            icon={Package}
            title="All Cargo Types"
            description="Transport any type of cargo safely and securely"
          />
          <FeatureCard
            icon={MapPin}
            title="Real-time Tracking"
            description="Track your shipment's location in real-time"
          />
          <FeatureCard
            icon={Clock}
            title="24/7 Service"
            description="Book your transport any time, day or night"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <Icon className="h-12 w-12 mb-4 text-primary" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
