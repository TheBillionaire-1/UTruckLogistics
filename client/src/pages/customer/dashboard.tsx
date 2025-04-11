import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Package, Clock, TrendingUp, Activity, Car, History, X, XCircle } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("");
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Redirect to role selection if user doesn't have a role
  useEffect(() => {
    if (user && !user.role) {
      setLocation("/role-selection");
    } else if (user && user.role !== "customer") {
      // If user has a different role, redirect to the appropriate dashboard
      setLocation("/");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter bookings by status for different tabs
  const pendingBookings = bookings?.filter(
    booking => booking.status === "pending"
  ) || [];
  
  const activeBookings = bookings?.filter(
    booking => booking.status === "accepted" || booking.status === "in_transit"
  ) || [];
  
  const completedBookings = bookings?.filter(
    booking => booking.status === "completed"
  ) || [];

  const rejectedBookings = bookings?.filter(
    booking => booking.status === "rejected"
  ) || [];

  const cancelledBookings = bookings?.filter(
    booking => booking.status === "cancelled"
  ) || [];
  
  // Double-check to make sure the bookings are correctly filtered
  console.log("[FILTERED] Pending bookings:", pendingBookings.map(b => ({ id: b.id, status: b.status })));
  console.log("[FILTERED] Active bookings:", activeBookings.map(b => ({ id: b.id, status: b.status })));
  console.log("[FILTERED] Completed bookings:", completedBookings.map(b => ({ id: b.id, status: b.status })));
  console.log("[FILTERED] Rejected bookings:", rejectedBookings.map(b => ({ id: b.id, status: b.status })));
  console.log("[FILTERED] Cancelled bookings:", cancelledBookings.map(b => ({ id: b.id, status: b.status })));
  
  // Log each category for debugging
  console.log("[" + new Date().toISOString() + "] Pending bookings:", pendingBookings);
  console.log("[" + new Date().toISOString() + "] Active bookings:", activeBookings);
  console.log("[" + new Date().toISOString() + "] Completed bookings:", completedBookings);
  console.log("[" + new Date().toISOString() + "] Rejected bookings:", rejectedBookings);
  console.log("[" + new Date().toISOString() + "] Cancelled bookings:", cancelledBookings);

  // Get the most recent active booking (sorting by update date)
  const latestActiveBooking = activeBookings.length > 0 
    ? [...activeBookings].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0] 
    : null;

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="customer" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Customer Dashboard</h1>
          <Button 
            onClick={() => setLocation("/booking")} 
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Package className="mr-2 h-5 w-5" />
            Book New Transport
          </Button>
        </div>

        {/* Stats Cards - Clickable with State-Based Tab Control */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("pending")}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-500">Pending</p>
                <p className="text-xl font-bold">{pendingBookings.length}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("active")}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500">Active</p>
                <p className="text-xl font-bold">{activeBookings.length}</p>
              </div>
              <Activity className="h-6 w-6 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("completed")}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-500">Completed</p>
                <p className="text-xl font-bold">{completedBookings.length}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("rejected")}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-red-500">Rejected</p>
                <p className="text-xl font-bold">{rejectedBookings.length}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("cancelled")}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="text-xl font-bold">{cancelledBookings.length}</p>
              </div>
              <X className="h-6 w-6 text-gray-500" />
            </CardContent>
          </Card>
        </div>
        
        {/* Content Section - Based on activeTab state */}
        {(activeTab === "" || activeTab === "pending") && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Pending Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending bookings</p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden border">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{booking.vehicleType}</h3>
                            <p className="text-sm text-yellow-500">Pending Approval</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => setLocation("/booking/details")}
                          >
                            Details
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Pickup</p>
                              <p className="text-sm text-muted-foreground truncate">{booking.pickupLocation}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Dropoff</p>
                              <p className="text-sm text-muted-foreground truncate">{booking.dropoffLocation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === "active" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Active Transports</CardTitle>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setActiveTab("")}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>
            </CardHeader>
            <CardContent>
              {activeBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active transports</p>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden border">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{booking.vehicleType}</h3>
                            <p className="text-sm text-muted-foreground">Status: <span className="capitalize">{booking.status.replace('_', ' ')}</span></p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => setLocation(booking.status === "in_transit" ? "/tracking" : "/booking/details")}
                          >
                            {booking.status === "in_transit" ? "Track" : "Details"}
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Pickup</p>
                              <p className="text-sm text-muted-foreground truncate">{booking.pickupLocation}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Dropoff</p>
                              <p className="text-sm text-muted-foreground truncate">{booking.dropoffLocation}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Cargo</p>
                              <p className="text-sm text-muted-foreground">{booking.cargoType.replace('_', ' ')} ({booking.cargoWeight} kg)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === "rejected" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Rejected Bookings</CardTitle>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setActiveTab("")}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>
            </CardHeader>
            <CardContent>
              {rejectedBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No rejected bookings</p>
              ) : (
                <div className="space-y-4">
                  {rejectedBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden border">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{booking.vehicleType}</h3>
                            <p className="text-sm flex items-center">
                              <span className="text-red-500 font-medium">Rejected:</span>
                              <span className="text-muted-foreground ml-1">{new Date(booking.updatedAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setLocation("/booking/details")}
                          >
                            Details
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Route</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {booking.pickupLocation.split(",")[0]} → {booking.dropoffLocation.split(",")[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === "completed" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Completed Transports</CardTitle>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setActiveTab("")}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>
            </CardHeader>
            <CardContent>
              {completedBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No completed transports</p>
              ) : (
                <div className="space-y-4">
                  {completedBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden border">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{booking.vehicleType}</h3>
                            <p className="text-sm text-muted-foreground">
                              Completed: {new Date(booking.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setLocation("/booking/details")}
                          >
                            Details
                          </Button>
                        </div>
                        
                        <div className="flex items-start gap-2 mt-4">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Route</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {booking.pickupLocation.split(",")[0]} → {booking.dropoffLocation.split(",")[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === "cancelled" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Cancelled Bookings</CardTitle>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setActiveTab("")}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>
            </CardHeader>
            <CardContent>
              {cancelledBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No cancelled bookings</p>
              ) : (
                <div className="space-y-4">
                  {cancelledBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden border">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{booking.vehicleType}</h3>
                            <p className="text-sm flex items-center">
                              <span className="text-gray-500 font-medium">Cancelled:</span>
                              <span className="text-muted-foreground ml-1">{new Date(booking.updatedAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setLocation("/booking/details")}
                          >
                            Details
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Route</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {booking.pickupLocation.split(",")[0]} → {booking.dropoffLocation.split(",")[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// Helper function to get status badge color
function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in_transit":
      return "bg-blue-100 text-blue-800";
    case "accepted":
      return "bg-purple-100 text-purple-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}