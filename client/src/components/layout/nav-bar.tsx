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

  // Determine if we're currently on a driver page by checking both the prop and the URL path
  const isDriverPage = currentPage === "driver" || location.startsWith("/driver");
  console.log(`NavBar render - currentPage: ${currentPage}, location: ${location}, isDriverPage: ${isDriverPage}`);
  const isDashboardVisible = user && user.role;
  const homePath = user && user.role === "customer" ? "/customer/dashboard" : user && user.role === "driver" ? "/driver/dashboard" : "/";

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <a href="/" className="no-underline">
            <Button variant="ghost" className="p-0">
              <Truck className="h-6 w-6" />
              <span className="ml-2">UTruck</span>
            </Button>
          </a>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              {/* Dashboard Link */}
              {isDashboardVisible && (
                <a 
                  href={user.role === "customer" ? "/customer/dashboard" : "/driver/dashboard"} 
                  className="no-underline"
                >
                  <Button variant="ghost" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </a>
              )}
              
              {/* Role Switching Link - temporary for dev purposes */}
              {isDashboardVisible && (
                <Button 
                  variant="ghost"
                  onClick={async () => {
                    try {
                      // Get the current user role first to determine the target role
                      const targetRole = user.role === "driver" ? "customer" : "driver";
                      console.log(`Current user role: ${user.role}, switching to: ${targetRole}`);
                      
                      // First update the user role in the database via API call
                      const updateRoleResponse = await fetch('/api/user/role', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ role: targetRole })
                      });
                      
                      if (!updateRoleResponse.ok) {
                        throw new Error(`Failed to update role: ${updateRoleResponse.statusText}`);
                      }
                      
                      // After role update, redirect to the appropriate dashboard
                      const targetPath = targetRole === "driver" ? "/driver/dashboard" : "/customer/dashboard";
                      console.log(`Role updated successfully. Redirecting to: ${targetPath}`);
                      
                      // Use window.location.replace for a cleaner navigation
                      window.location.replace(targetPath);
                    } catch (error) {
                      console.error("Error during role switching:", error);
                      alert("Failed to switch roles. Please try again.");
                    }
                  }}
                >
                  Switch to {isDriverPage ? "Customer" : "Driver"} View
                </Button>
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