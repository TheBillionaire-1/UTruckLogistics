import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking, BookingStatus } from "@shared/schema";
import { Loader2, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { useState } from "react";
import { X } from "lucide-react";

export default function DriverDashboard() {
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });
  
  // State to track which sections are visible
  const [visibleSections, setVisibleSections] = useState({
    available: true,
    active: true,
    completed: true,
    rejected: true,
  });

  // Hide a section
  const hideSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: false
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter bookings by status
  const availableBookings = bookings?.filter(booking => booking.status === BookingStatus.PENDING) || [];
  const activeBookings = bookings?.filter(
    booking => booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.IN_TRANSIT
  ) || [];
  const completedBookings = bookings?.filter(booking => booking.status === BookingStatus.COMPLETED) || [];
  const rejectedBookings = bookings?.filter(booking => booking.status === BookingStatus.CANCELLED) || [];

  // Function to navigate to booking management
  const goToBookingManagement = () => {
    setLocation("/driver/bookings");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="driver" />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Available Jobs" 
            value={availableBookings.length} 
            icon={Package} 
            color="bg-green-100 text-green-700"
            onClick={goToBookingManagement}
          />
          <StatCard 
            title="Active Deliveries" 
            value={activeBookings.length} 
            icon={Truck} 
            color="bg-blue-100 text-blue-700"
            onClick={goToBookingManagement}
          />
          <StatCard 
            title="Completed Jobs" 
            value={completedBookings.length} 
            icon={CheckCircle} 
            color="bg-emerald-100 text-emerald-700"
            onClick={goToBookingManagement}
          />
          <StatCard 
            title="Rejected Jobs" 
            value={rejectedBookings.length} 
            icon={XCircle} 
            color="bg-red-100 text-red-700"
            onClick={goToBookingManagement}
          />
        </div>
        
        {/* Available Jobs Section */}
        {visibleSections.available && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Available Jobs</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => hideSection('available')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </CardHeader>
            <CardContent>
              {availableBookings.length > 0 ? (
                <div className="space-y-4">
                  {availableBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      onClick={goToBookingManagement}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No available jobs found</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Active Deliveries Section */}
        {visibleSections.active && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Active Deliveries</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => hideSection('active')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </CardHeader>
            <CardContent>
              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      onClick={goToBookingManagement}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No active deliveries found</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Completed Jobs Section */}
        {visibleSections.completed && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Completed Jobs</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => hideSection('completed')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </CardHeader>
            <CardContent>
              {completedBookings.length > 0 ? (
                <div className="space-y-4">
                  {completedBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      onClick={goToBookingManagement}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No completed jobs found</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Rejected Jobs Section */}
        {visibleSections.rejected && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Rejected Jobs</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => hideSection('rejected')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </CardHeader>
            <CardContent>
              {rejectedBookings.length > 0 ? (
                <div className="space-y-4">
                  {rejectedBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      onClick={goToBookingManagement}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No rejected jobs found</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Statistic Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  onClick
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string;
  onClick: () => void;
}) {
  return (
    <Card 
      className={`hover:shadow-md transition-all cursor-pointer ${color} border-none`} 
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="h-8 w-8" />
      </CardContent>
    </Card>
  );
}

// Booking Card Component
function BookingCard({ 
  booking, 
  onClick 
}: { 
  booking: Booking; 
  onClick: () => void;
}) {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  };

  const getVehicleIcon = (vehicleType: string) => {
    if (vehicleType.includes('3.5')) return 'Small Van';
    if (vehicleType.includes('7.5')) return 'Medium Truck';
    if (vehicleType.includes('18')) return 'Large Truck';
    return vehicleType;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case BookingStatus.ACCEPTED:
        return "text-blue-600 bg-blue-50 border-blue-200";
      case BookingStatus.IN_TRANSIT:
        return "text-purple-600 bg-purple-50 border-purple-200";
      case BookingStatus.COMPLETED:
        return "text-green-600 bg-green-50 border-green-200";
      case BookingStatus.CANCELLED:
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card 
      className="border hover:shadow-md transition-all cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="border p-2 rounded-full">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-medium">{getVehicleIcon(booking.vehicleType)}</div>
            <div className="text-sm text-muted-foreground">
              {formatDate(booking.createdAt)} • Order #{booking.id}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}
          >
            {booking.status.replace('_', ' ')}
          </span>
          <Button size="sm" variant="outline">Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}