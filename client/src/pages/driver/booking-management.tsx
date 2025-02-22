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
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: BookingStatus }) => {
      console.log('Starting mutation with status:', status);
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
      const data = await res.json();
      console.log('Mutation response:', data);
      return data;
    },
    onMutate: async (variables) => {
      console.log('Optimistic update starting with:', variables);
      await queryClient.cancelQueries({ queryKey: ["/api/bookings"] });

      const previousBookings = queryClient.getQueryData<Booking[]>(["/api/bookings"]);

      if (previousBookings) {
        const updatedBookings = previousBookings.map(booking =>
          booking.id === variables.bookingId
            ? { ...booking, status: variables.status }
            : booking
        );
        queryClient.setQueryData(["/api/bookings"], updatedBookings);
      }

      return { previousBookings };
    },
    onSuccess: (data, variables) => {
      console.log('Mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status Updated",
        description: `Booking status updated to ${variables.status.toLowerCase().replace('_', ' ')}`,
      });
    },
    onError: (error: Error, variables, context) => {
      console.error('Mutation error:', error);
      if (context?.previousBookings) {
        queryClient.setQueryData(["/api/bookings"], context.previousBookings);
      }
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

  // Get the current active booking (not completed or cancelled)
  const currentBooking = bookings?.find(booking => {
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      return false;
    }
    // For IN_TRANSIT bookings, show them until they're marked as completed
    if (booking.status === BookingStatus.IN_TRANSIT) {
      return true;
    }
    // For other statuses (PENDING, ACCEPTED), show if they're the most recent
    return booking.status === BookingStatus.PENDING || booking.status === BookingStatus.ACCEPTED;
  });

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!currentBooking) return;

    console.log('handleStatusUpdate called with:', status);
    try {
      await statusMutation.mutateAsync({
        bookingId: currentBooking.id,
        status: status
      });
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
          <CardContent>
            {currentBooking ? (
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

                {/* Show action buttons based on current status */}
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
            ) : (
              <p className="text-center text-muted-foreground">No bookings found</p>
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