import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, PackageOpen, Clock, TrendingUp, Activity, RotateCw, XCircle } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Redirect to role selection if user doesn't have a role
  useEffect(() => {
    if (user && !user.role) {
      setLocation("/role-selection");
    } else if (user && user.role !== "driver") {
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
  const pendingBookings = bookings?.filter(booking => booking.status === "pending") || [];
  const activeBookings = bookings?.filter(booking => booking.status === "accepted" || booking.status === "in_transit") || [];
  const completedBookings = bookings?.filter(booking => booking.status === "completed") || [];
  const rejectedBookings = bookings?.filter(booking => booking.status === "rejected") || [];

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="driver" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <Button onClick={() => setLocation("/driver/bookings")} variant="outline">Manage Bookings</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-500">Available Jobs</p>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
              </div>
              <PackageOpen className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-500">Active Deliveries</p>
                <p className="text-2xl font-bold">{activeBookings.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedBookings.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-red-500">Rejected</p>
                <p className="text-2xl font-bold">{rejectedBookings.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content with Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="available" className="flex items-center gap-1">
              <PackageOpen className="h-4 w-4 text-green-500" /> <span className="text-green-500">Available</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-blue-500" /> <span className="text-blue-500">Active</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" /> <span className="text-red-500">Rejected</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1">
              <RotateCw className="h-4 w-4" /> History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Available Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No available jobs</p>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden border">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">{booking.vehicleType}</h3>
                              <p className="text-sm text-muted-foreground">Cargo: {booking.cargoType.replace('_', ' ')} ({booking.cargoWeight} kg)</p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => setLocation(`/driver/bookings?id=${booking.id}`)}
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
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {activeBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No active deliveries</p>
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
                              onClick={() => setLocation(`/driver/bookings?id=${booking.id}`)}
                            >
                              Manage
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">Dropoff Location</p>
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
                              onClick={() => setLocation(`/driver/bookings?id=${booking.id}`)}
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
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Delivery History</CardTitle>
              </CardHeader>
              <CardContent>
                {completedBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No completed deliveries</p>
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
                              onClick={() => setLocation(`/driver/bookings?id=${booking.id}`)}
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}