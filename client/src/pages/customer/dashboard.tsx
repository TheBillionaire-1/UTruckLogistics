import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, PackageOpen, Clock, History, Car, MapIcon, Package } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { useAuth } from "@/hooks/use-auth";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
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

  // Filter bookings by status
  const activeBookings = bookings?.filter(
    booking => booking.status === "pending" || booking.status === "accepted" || booking.status === "in_transit"
  ) || [];
  
  const completedBookings = bookings?.filter(
    booking => booking.status === "completed"
  ) || [];

  const cancellationRejections = bookings?.filter(
    booking => booking.status === "cancelled" || booking.status === "rejected"
  ) || [];

  // Get the most recent active booking
  const latestActiveBooking = activeBookings.length > 0 ? activeBookings[0] : null;

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

        {/* Current Transport Card */}
        {/* Quick Booking Card - Always visible */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Quick Book</h2>
                </div>
                <p className="text-muted-foreground">Create a new booking for cargo transport services</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    onClick={() => setLocation("/booking")}
                    variant="default"
                    className="bg-primary/90 hover:bg-primary"
                  >
                    New Booking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-4">Your Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Bookings</span>
                  <span className="font-medium">{bookings?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <span className="font-medium">{completedBookings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active</span>
                  <span className="font-medium">{activeBookings.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Current Transport Card */}
        {latestActiveBooking ? (
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Current Transport</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{latestActiveBooking.vehicleType}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted uppercase">
                      {latestActiveBooking.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">{latestActiveBooking.pickupLocation}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Dropoff</p>
                        <p className="text-sm text-muted-foreground">{latestActiveBooking.dropoffLocation}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <PackageOpen className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Cargo</p>
                        <p className="text-sm text-muted-foreground">
                          {latestActiveBooking.cargoType.replace("_", " ")} - {latestActiveBooking.cargoWeight} kg
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 justify-center">
                  <Button 
                    onClick={() => setLocation("/booking/details")}
                    variant="outline" 
                    className="w-full md:w-auto"
                  >
                    View Details
                  </Button>
                  
                  {latestActiveBooking.status === "in_transit" && (
                    <Button 
                      onClick={() => setLocation("/tracking")}
                      className="w-full md:w-auto"
                    >
                      <MapIcon className="h-4 w-4 mr-2" />
                      Track Transport
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">No Active Transports</h2>
                <p className="text-muted-foreground">You don't have any active bookings</p>
              </div>
              <Button 
                onClick={() => setLocation("/booking")}
                className="mt-4 md:mt-0"
              >
                Book Transport
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* History Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full max-w-md justify-start mb-4">
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {bookings?.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden border">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(booking.status)} uppercase`}>
                                  {booking.status.replace("_", " ")}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setLocation("/booking/details")}
                            >
                              Details
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate">
                              {booking.pickupLocation.split(",")[0]} → {booking.dropoffLocation.split(",")[0]}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Completed Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {completedBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No completed bookings</p>
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
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate">
                              {booking.pickupLocation.split(",")[0]} → {booking.dropoffLocation.split(",")[0]}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled & Rejected Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {cancellationRejections.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No cancelled or rejected bookings</p>
                ) : (
                  <div className="space-y-4">
                    {cancellationRejections.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden border">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(booking.status)} uppercase`}>
                                  {booking.status.replace("_", " ")}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(booking.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate">
                              {booking.pickupLocation.split(",")[0]} → {booking.dropoffLocation.split(",")[0]}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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