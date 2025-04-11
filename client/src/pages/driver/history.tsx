import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Booking, BookingStatus } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, Package } from "lucide-react";
import { Loader2 } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";

export default function DriverHistory() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter bookings based on the selected status
  const filteredBookings = bookings?.filter(booking => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.IN_TRANSIT;
    if (statusFilter === "completed") return booking.status === BookingStatus.COMPLETED;
    if (statusFilter === "rejected") return booking.status === BookingStatus.REJECTED;
    if (statusFilter === "pending") return booking.status === BookingStatus.PENDING;
    return true;
  }) || [];

  // Calculate counts for the summary section
  const totalBookings = bookings?.length || 0;
  const completedCount = bookings?.filter(b => b.status === BookingStatus.COMPLETED).length || 0;
  const rejectedCount = bookings?.filter(b => b.status === BookingStatus.REJECTED).length || 0;
  const activeCount = bookings?.filter(b => 
    b.status === BookingStatus.ACCEPTED || b.status === BookingStatus.IN_TRANSIT
  ).length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      case BookingStatus.ACCEPTED:
        return "text-blue-500 bg-blue-50 border-blue-200";
      case BookingStatus.IN_TRANSIT:
        return "text-purple-500 bg-purple-50 border-purple-200";
      case BookingStatus.COMPLETED:
        return "text-green-500 bg-green-50 border-green-200";
      case BookingStatus.REJECTED:
        return "text-red-500 bg-red-50 border-red-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="driver" />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Booking History</h1>
          <Button 
            variant="outline" 
            onClick={() => setLocation("/driver/dashboard")}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-500">Active</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-500">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-red-500">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-medium mb-1">Filter by Status</h3>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bookings</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredBookings.length} of {totalBookings} bookings
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No bookings found matching your filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-semibold">{booking.vehicleType}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleDateString()} • ID: {booking.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize border ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setLocation(`/driver/bookings?id=${booking.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}