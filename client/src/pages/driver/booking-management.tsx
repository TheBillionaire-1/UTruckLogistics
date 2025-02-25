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

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let isConnecting = false;
    let isCleanup = false;

    const connect = () => {
      if (isConnecting || isCleanup) return;
      isConnecting = true;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

        ws.onopen = () => {
          console.log('WebSocket connected');
          isConnecting = false;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'BOOKING_STATUS_UPDATED') {
              console.log("WebSocket status update received:", data);
              queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            }
          } catch (error) {
            console.error('WebSocket message parsing error:', error);
          }
        };

        ws.onclose = (event) => {
          if (!event.wasClean && !isCleanup) {
            console.log('WebSocket connection lost, attempting reconnect...');
            isConnecting = false;
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          isConnecting = false;
          if (ws?.readyState !== WebSocket.CLOSED && !isCleanup) {
            ws?.close();
          }
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        isConnecting = false;
        if (!isCleanup) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isCleanup = true;
      isConnecting = false;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  const statusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: StatusUpdatePayload) => {
      try {
        console.log(`Mutation executing for booking ${bookingId} to status ${status}`);
        console.log("Current booking state before update:", currentBooking);
        const payload = { status };

        // Validate input and transition
        if (!bookingId || !status) {
          throw new Error('Invalid booking ID or status');
        }

        // Validate status transitions within mutation
        let isValidTransition = true;
        switch (status) {
          case BookingStatus.COMPLETED:
            isValidTransition = currentBooking?.status === BookingStatus.IN_TRANSIT;
            break;
          case BookingStatus.CANCELLED:
            isValidTransition = currentBooking?.status === BookingStatus.PENDING;
            break;
          case BookingStatus.ACCEPTED:
            isValidTransition = currentBooking?.status === BookingStatus.PENDING;
            break;
          case BookingStatus.IN_TRANSIT:
            isValidTransition = currentBooking?.status === BookingStatus.ACCEPTED;
            break;
          default:
            isValidTransition = false;
        }

        if (!isValidTransition) {
          throw new Error(`Invalid status transition from ${currentBooking?.status} to ${status}`);
        }

        const res = await apiRequest(
          "PATCH",
          `/api/bookings/${bookingId}/status`,
          payload
        );

        if (!res.ok) {
          throw new Error(`Failed to update status: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("API Response Validation:", {
          status: data.status,
          expectedStatus: status,
          match: data.status === status ? "Success" : "Failure"
        });
        return data;
      } catch (error) {
        console.error('Status update error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation success - Updated booking data:", data);
      console.log("Data transformation:", { 
        bookingId: data.id,
        oldStatus: currentBooking?.status,
        newStatus: data.status,
        timestamp: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      console.log("Cache invalidation complete");

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

  // Find the current active booking - strictly filter out completed and cancelled
  const currentBooking = bookings?.find(booking => {
    const status = booking.status;
    console.log(`Filtering booking ${booking.id} with status ${status}`);

    // Explicitly return false for completed and cancelled
    if (status === BookingStatus.COMPLETED || status === BookingStatus.CANCELLED) {
      console.log(`Booking ${booking.id} filtered out - ${status}`);
      return false;
    }

    // Only return true for active states
    const isActive = [
      BookingStatus.PENDING,
      BookingStatus.ACCEPTED,
      BookingStatus.IN_TRANSIT
    ].includes(status);

    console.log(`Booking ${booking.id} active status: ${isActive}`);
    return isActive;
  });

  console.log("Current active booking after filtering:", currentBooking);

  const handleStatusUpdate = (bookingId: number, status: BookingStatus) => {
    const beforeState = {...currentBooking};
    console.log("Status update initiated:", {
      bookingId,
      currentStatus: beforeState?.status,
      targetStatus: status,
      timestamp: new Date().toISOString()
    });

    // For Complete/Cancel/Reject, validate the transition is allowed
    let isValidTransition = true;

    switch (status) {
      case BookingStatus.COMPLETED:
        isValidTransition = beforeState?.status === BookingStatus.IN_TRANSIT;
        break;
      case BookingStatus.CANCELLED:
        isValidTransition = beforeState?.status === BookingStatus.PENDING;
        break;
      case BookingStatus.ACCEPTED:
        // Accept is working correctly, use it as a reference
        isValidTransition = beforeState?.status === BookingStatus.PENDING;
        break;
      case BookingStatus.IN_TRANSIT:
        isValidTransition = beforeState?.status === BookingStatus.ACCEPTED;
        break;
      default:
        isValidTransition = false;
    }

    if (!isValidTransition) {
      console.error(`Invalid status transition from ${beforeState?.status} to ${status}`);
      toast({
        title: "Invalid Status Update",
        description: `Cannot update booking from ${beforeState?.status} to ${status}`,
        variant: "destructive",
      });
      return;
    }

    console.log("Status transition validation passed:", {
      from: beforeState?.status,
      to: status,
      timestamp: new Date().toISOString()
    });

    statusMutation.mutate({ bookingId, status });
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