import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, PackageOpen, Clock, History, Car, MapIcon, Package, Activity, TrendingUp, XCircle, X } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("pending")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-500">Pending</p>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("active")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-500">Active Transports</p>
                <p className="text-2xl font-bold">{activeBookings.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("completed")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedBookings.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setActiveTab("rejected")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-red-500">Rejected</p>
                <p className="text-2xl font-bold">{rejectedBookings.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
        </div>
        
        {/* Current Transport Card */}
        {latestActiveBooking && (latestActiveBooking.status === "accepted" || latestActiveBooking.status === "in_transit") ? (
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Current Transport</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{latestActiveBooking.vehicleType}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      latestActiveBooking.status === "in_transit" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                    } uppercase`}>
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
        
        {/* Bookings Tabs - Responsive Design */}
        <Tabs defaultValue="all" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full flex flex-nowrap mb-4 md:grid md:grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-1 md:flex-1">
                <Package className="h-4 w-4 md:mr-1" /> 
                <span className="hidden md:inline">All</span>
                <span className="md:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1 md:flex-1">
                <Clock className="h-4 w-4 text-yellow-500 md:mr-1" /> 
                <span className="text-yellow-500 hidden md:inline">Pending</span>
                <span className="text-yellow-500 md:hidden">Pending</span>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-1 md:flex-1">
                <Car className="h-4 w-4 text-blue-500 md:mr-1" /> 
                <span className="text-blue-500 hidden md:inline">Active</span>
                <span className="text-blue-500 md:hidden">Active</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-1 md:flex-1">
                <History className="h-4 w-4 text-green-500 md:mr-1" /> 
                <span className="text-green-500 hidden md:inline">Completed</span>
                <span className="text-green-500 md:hidden">Done</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-1 md:flex-1">
                <MapPin className="h-4 w-4 text-red-500 md:mr-1" /> 
                <span className="text-red-500 hidden md:inline">Rejected</span>
                <span className="text-red-500 md:hidden">Reject</span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-1 md:flex-1">
                <Clock className="h-4 w-4 text-gray-500 md:mr-1" /> 
                <span className="text-gray-500 hidden md:inline">Cancelled</span>
                <span className="text-gray-500 md:hidden">Cancel</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
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
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <div className="flex items-center flex-wrap gap-2 mt-1">
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
                              className="mt-1 sm:mt-0"
                              onClick={() => setLocation("/booking/details")}
                            >
                              Details
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate max-w-full">
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
          
          <TabsContent value="pending" className="mt-0">
            <Card>
              <CardHeader>
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
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <p className="text-sm text-yellow-500">
                                Pending Approval
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="mt-1 sm:mt-0"
                              onClick={() => setLocation("/booking/details")}
                            >
                              Details
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate max-w-full">
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

          <TabsContent value="active" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Active Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {activeBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No active bookings</p>
                ) : (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden border">
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <p className="text-sm text-blue-500">
                                Status: <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                              </p>
                            </div>
                            <Button 
                              size="sm"
                              className="mt-1 sm:mt-0"
                              onClick={() => setLocation(booking.status === "in_transit" ? "/tracking" : "/booking/details")}
                            >
                              {booking.status === "in_transit" ? "Track" : "Details"}
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate max-w-full">
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
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <p className="text-sm text-green-500">
                                Completed: {new Date(booking.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="mt-1 sm:mt-0"
                              onClick={() => setLocation("/booking/details")}
                            >
                              Details
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate max-w-full">
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
          
          <TabsContent value="rejected" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No rejected bookings</p>
                ) : (
                  <div className="space-y-4">
                    {rejectedBookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden border">
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-red-500 font-medium">Rejected:</span>
                                <span className="text-muted-foreground">
                                  {new Date(booking.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="mt-1 sm:mt-0"
                              onClick={() => setLocation("/booking/details")}
                            >
                              Details
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate max-w-full">
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
                <CardTitle>Cancelled Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {cancelledBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No cancelled bookings</p>
                ) : (
                  <div className="space-y-4">
                    {cancelledBookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden border">
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 font-medium">Cancelled:</span>
                                <span className="text-muted-foreground">
                                  {new Date(booking.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="mt-1 sm:mt-0"
                              onClick={() => setLocation("/booking/details")}
                            >
                              Details
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate max-w-full">
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