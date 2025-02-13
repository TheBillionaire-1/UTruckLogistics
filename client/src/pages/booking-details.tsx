import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking } from "@shared/schema";
import { Loader2 } from "lucide-react";
import NavBar from "@/components/layout/nav-bar";

export default function BookingDetailsPage() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const latestBooking = bookings?.[bookings.length - 1];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!latestBooking) {
    return <div>No booking found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Confirmation</CardTitle>
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
              <p className="text-muted-foreground capitalize">{latestBooking.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
