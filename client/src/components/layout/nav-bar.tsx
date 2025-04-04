import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Truck, Home, Package } from "lucide-react";
import { Link, useLocation } from "wouter";

type NavBarProps = {
  currentPage?: "customer" | "driver";
};

export default function NavBar({ currentPage = "customer" }: NavBarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isDriverPage = currentPage === "driver" || location.startsWith("/driver");
  const isDashboardVisible = user && user.role;
  const homePath = user && user.role === "customer" ? "/customer/dashboard" : user && user.role === "driver" ? "/driver/dashboard" : "/";

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Link href={homePath}>
            <Button variant="ghost" className="p-0">
              <Truck className="h-6 w-6" />
              <span className="ml-2">UTruck</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              {/* Dashboard Link */}
              {isDashboardVisible && (
                <Link href={user.role === "customer" ? "/customer/dashboard" : "/driver/dashboard"}>
                  <Button variant="ghost" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              )}
              
              {/* Role Switching Link */}
              {isDashboardVisible && (
                <Link href={isDriverPage ? "/customer/dashboard" : "/driver/dashboard"}>
                  <Button variant="ghost">
                    Switch to {isDriverPage ? "Customer" : "Driver"} View
                  </Button>
                </Link>
              )}
              
              {/* Book Transport - only visible for customers */}
              {user.role === "customer" && (
                <Link href="/booking">
                  <Button variant="ghost" className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>Book Transport</span>
                  </Button>
                </Link>
              )}
              
              {/* Driver-specific Navigation - only visible for drivers */}
              {user.role === "driver" && (
                <Link href="/driver/bookings">
                  <Button variant="ghost">
                    Manage Bookings
                  </Button>
                </Link>
              )}
              
              {/* Logout Button */}
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}