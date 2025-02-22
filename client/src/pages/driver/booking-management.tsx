import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking, BookingStatus } from "@shared/schema";
import { Loader2 } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DriverBookingManagement() {
  const { toast } = useToast();
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status Updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Get the first pending, accepted, or in_transit booking
  const currentBooking = bookings?.find(booking => 
    [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_TRANSIT].includes(booking.status as BookingStatus)
  );

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!currentBooking) return;

    try {
      await statusMutation.mutateAsync({
        bookingId: currentBooking.id,
        status: status
      });

      // Force immediate UI update
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="driver" />
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentBooking ? (
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">Vehicle Type</p>
                    <p className="text-muted-foreground">{currentBooking.vehicleType}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Pickup Location</p>
                    <p className="text-muted-foreground">
                      {currentBooking.pickupLocation || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Dropoff Location</p>
                    <p className="text-muted-foreground">
                      {currentBooking.dropoffLocation || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Status</p>
                    <p className={`font-medium capitalize ${getStatusColor(currentBooking.status)}`}>
                      {currentBooking.status.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Only show action buttons if status is not CANCELLED */}
                  {currentBooking.status === BookingStatus.PENDING && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="default"
                        onClick={() => handleStatusUpdate(BookingStatus.ACCEPTED)}
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Accept Booking
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(BookingStatus.CANCELLED)}
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Reject Booking
                      </Button>
                    </div>
                  )}

                  {currentBooking.status === BookingStatus.ACCEPTED && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="default"
                        onClick={() => handleStatusUpdate(BookingStatus.IN_TRANSIT)}
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Start Transit
                      </Button>
                    </div>
                  )}

                  {currentBooking.status === BookingStatus.IN_TRANSIT && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="default"
                        onClick={() => handleStatusUpdate(BookingStatus.COMPLETED)}
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Mark as Delivered
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <p className="text-center text-muted-foreground">No pending bookings found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case BookingStatus.PENDING:
      return "text-yellow-600";
    case BookingStatus.ACCEPTED:
      return "text-blue-600";
    case BookingStatus.IN_TRANSIT:
      return "text-purple-600";
    case BookingStatus.COMPLETED:
      return "text-green-600";
    case BookingStatus.CANCELLED:
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};