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
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
      return res.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/bookings"] });

      // Snapshot the previous value
      const previousBookings = queryClient.getQueryData<Booking[]>(["/api/bookings"]);

      // Optimistically update to the new value
      if (previousBookings) {
        queryClient.setQueryData(["/api/bookings"], previousBookings.map(booking =>
          booking.id === variables.bookingId
            ? { ...booking, status: variables.status }
            : booking
        ));
      }

      return { previousBookings };
    },
    onError: (error: Error, _, context) => {
      // Revert back to the previous state if there was an error
      if (context?.previousBookings) {
        queryClient.setQueryData(["/api/bookings"], context.previousBookings);
      }
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status Updated",
        description: `Booking status updated to ${variables.status.toLowerCase().replace('_', ' ')}`,
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

  // Get the current active booking
  const currentBooking = bookings?.find(booking => {
    // First, check if there's an in-transit booking
    if (booking.status === BookingStatus.IN_TRANSIT) {
      return true;
    }
    // If no in-transit booking, look for pending or accepted bookings
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      return false;
    }
    return booking.status === BookingStatus.PENDING || booking.status === BookingStatus.ACCEPTED;
  });

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!currentBooking) return;
    await statusMutation.mutateAsync({
      bookingId: currentBooking.id,
      status: status
    });
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