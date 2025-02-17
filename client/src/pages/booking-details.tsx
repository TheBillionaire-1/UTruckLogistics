import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking, BookingStatus } from "@shared/schema";
import { Loader2 } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function BookingDetailsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const latestBooking = bookings ? bookings[0] : null; // The first booking will be the latest due to DESC order

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!latestBooking) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No bookings found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  const nextStatus = getNextStatus(latestBooking.status);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Vehicle Type</p>
              <p className="text-muted-foreground">{latestBooking.vehicleType}</p>
            </div>
            <div>
              <p className="font-semibold">Pickup Location</p>
              <p className="text-muted-foreground">{latestBooking.pickupLocation}</p>
            </div>
            <div>
              <p className="font-semibold">Dropoff Location</p>
              <p className="text-muted-foreground">{latestBooking.dropoffLocation}</p>
            </div>
            <div>
              <p className="font-semibold">Status</p>
              <p className={`font-medium capitalize ${getStatusColor(latestBooking.status)}`}>
                {latestBooking.status.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="font-semibold">Last Updated</p>
              <p className="text-muted-foreground">
                {new Date(latestBooking.updatedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              {nextStatus && (
                <Button
                  onClick={() =>
                    statusMutation.mutate({
                      bookingId: latestBooking.id,
                      status: nextStatus,
                    })
                  }
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Mark as {nextStatus.replace('_', ' ')}
                </Button>
              )}
              {latestBooking.status !== BookingStatus.CANCELLED && latestBooking.status !== BookingStatus.COMPLETED && (
                <Button
                  variant="destructive"
                  onClick={() =>
                    statusMutation.mutate({
                      bookingId: latestBooking.id,
                      status: BookingStatus.CANCELLED,
                    })
                  }
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cancel Booking
                </Button>
              )}
              {latestBooking.status === BookingStatus.IN_TRANSIT && (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/tracking")}
                >
                  Track Vehicle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}