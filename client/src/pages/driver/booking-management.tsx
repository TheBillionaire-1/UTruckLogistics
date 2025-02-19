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

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case BookingStatus.PENDING:
        return BookingStatus.ACCEPTED;
      case BookingStatus.ACCEPTED:
        return BookingStatus.IN_TRANSIT;
      case BookingStatus.IN_TRANSIT:
        return BookingStatus.COMPLETED;
      default:
        return null;
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
      <NavBar />
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <Card key={booking.id} className="p-4">
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Vehicle Type</p>
                      <p className="text-muted-foreground">{booking.vehicleType}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Pickup Location</p>
                      <p className="text-muted-foreground">{booking.pickupLocation}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Dropoff Location</p>
                      <p className="text-muted-foreground">{booking.dropoffLocation}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status</p>
                      <p className={`font-medium capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Last Updated</p>
                      <p className="text-muted-foreground">
                        {new Date(booking.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      {getNextStatus(booking.status) && (
                        <Button
                          onClick={() =>
                            statusMutation.mutate({
                              bookingId: booking.id,
                              status: getNextStatus(booking.status)!,
                            })
                          }
                          disabled={statusMutation.isPending}
                        >
                          {statusMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Mark as {getNextStatus(booking.status)!.replace('_', ' ')}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
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
