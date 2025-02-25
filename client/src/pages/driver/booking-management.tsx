import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking, BookingStatus } from "@shared/schema";
import { Loader2 } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

type StatusUpdatePayload = {
  bookingId: number;
  status: BookingStatus;
};

export default function DriverBookingManagement() {
  const { toast } = useToast();
  const [justCompleted, setJustCompleted] = useState(false);
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'BOOKING_STATUS_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      }
    };

    return () => ws.close();
  }, []);

  const statusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: StatusUpdatePayload) => {
      try {
        console.log(`Mutation executing for booking ${bookingId} to status ${status}`);

        // Validate input
        if (!bookingId || !status) {
          throw new Error('Invalid booking ID or status');
        }

        const res = await apiRequest(
          "PATCH",
          `/api/bookings/${bookingId}/status`,
          { status }
        );

        if (!res.ok) {
          throw new Error(`Failed to update status: ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Mutation success response:', data);
        return data;
      } catch (error) {
        console.error('Status update error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation success handler:', data);

      if (data.status === BookingStatus.COMPLETED) {
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 3000);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status Updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
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

  // Find the current active booking - exclude COMPLETED and CANCELLED statuses
  const currentBooking = bookings?.find(booking => 
    (booking.status === BookingStatus.IN_TRANSIT ||
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.ACCEPTED) &&
    booking.status !== BookingStatus.COMPLETED &&
    booking.status !== BookingStatus.CANCELLED
  );

  const handleStatusUpdate = (bookingId: number, status: BookingStatus) => {
    if (!bookingId) {
      console.error('No booking ID provided for status update');
      toast({
        title: "Update Failed",
        description: "Could not find booking to update",
        variant: "destructive",
      });
      return;
    }

    // Validate status transitions
    if (status === BookingStatus.COMPLETED && currentBooking?.status !== BookingStatus.IN_TRANSIT) {
      toast({
        title: "Invalid Status Update",
        description: "Booking must be in transit to complete",
        variant: "destructive",
      });
      return;
    }

    console.log(`Handling status update: ${bookingId} -> ${status}`);
    statusMutation.mutate({ bookingId, status });
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
                        onClick={() => handleStatusUpdate(
                          currentBooking.id,
                          BookingStatus.ACCEPTED
                        )}
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Accept Booking
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(
                          currentBooking.id,
                          BookingStatus.CANCELLED
                        )}
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
                      onClick={() => handleStatusUpdate(
                        currentBooking.id,
                        BookingStatus.IN_TRANSIT
                      )}
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
                      onClick={() => handleStatusUpdate(
                        currentBooking.id,
                        BookingStatus.COMPLETED
                      )}
                      disabled={statusMutation.isPending}
                    >
                      {statusMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Complete Delivery
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                {justCompleted ? (
                  <p className="text-green-600 font-medium">
                    Delivery completed successfully! Waiting for new bookings...
                  </p>
                ) : (
                  <p className="text-muted-foreground">No active bookings found</p>
                )}
              </div>
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