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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status Updated",
        description: `Booking status updated to ${variables.status.toLowerCase().replace('_', ' ')}`,
      });
    },
    onError: (error: Error, _, context) => {
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

  const currentBooking = bookings?.find(booking => {
    if (booking.status === BookingStatus.IN_TRANSIT) {
      return true;
    }
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      return false;
    }
    return booking.status === BookingStatus.PENDING || booking.status === BookingStatus.ACCEPTED;
  });

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!currentBooking) return;

    try {
      await statusMutation.mutateAsync({
        bookingId: currentBooking.id,
        status
      });

      if (status === BookingStatus.COMPLETED) {
        // Remove the completed booking from the UI immediately
        queryClient.setQueryData<Booking[]>(["/api/bookings"], (old) => 
          old?.filter(booking => booking.id !== currentBooking.id) ?? []
        );
      }
    } catch (error) {
      console.error('Status update failed:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the booking status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
              <div className="grid gap-6">
                <div className="space-y-2">
                  <p className="font-semibold">Vehicle Type</p>
                  <p className="text-muted-foreground">{currentBooking.vehicleType}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Pickup Location</p>
                  <p className="text-muted-foreground break-words">
                    {currentBooking.pickupLocation || "Not specified"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Dropoff Location</p>
                  <p className="text-muted-foreground break-words">
                    {currentBooking.dropoffLocation || "Not specified"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Status</p>
                  <p className={`font-medium capitalize ${getStatusColor(currentBooking.status)}`}>
                    {currentBooking.status.replace('_', ' ')}
                  </p>
                </div>

                <div className="flex gap-4">
                  {currentBooking.status === BookingStatus.PENDING && (
                    <>
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
                    </>
                  )}

                  {currentBooking.status === BookingStatus.ACCEPTED && (
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
                  )}

                  {currentBooking.status === BookingStatus.IN_TRANSIT && (
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
                  )}
                </div>
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