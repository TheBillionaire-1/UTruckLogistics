import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { LocationData } from "@/pages/booking-page";
import VehicleSelect from "./vehicle-select";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

type Props = {
  onLocationSelect: (data: LocationData) => void;
  locationData: LocationData | null;
};

export default function BookingForm({ onLocationSelect, locationData }: Props) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      vehicleType: "",
      pickupLocation: "",
      dropoffLocation: "",
      pickupCoords: "",
      dropoffCoords: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed",
        description: "Your transport has been successfully booked.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setLocation("/bookings");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (!locationData) {
      toast({
        title: "Location Required",
        description: "Please select pickup and dropoff locations",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      ...data,
      pickupCoords: JSON.stringify(locationData.pickup.coords),
      dropoffCoords: JSON.stringify(locationData.dropoff.coords),
      pickupLocation: locationData.pickup.address,
      dropoffLocation: locationData.dropoff.address,
    };

    bookingMutation.mutate(bookingData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vehicleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Type</FormLabel>
              <FormControl>
                <VehicleSelect
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pickupLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pickup Location</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter pickup address"
                  value={locationData?.pickup.address || ""}
                  onChange={(e) => {
                    field.onChange(e);
                    // Here you would typically integrate with a geocoding service
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dropoffLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dropoff Location</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter dropoff address"
                  value={locationData?.dropoff.address || ""}
                  onChange={(e) => {
                    field.onChange(e);
                    // Here you would typically integrate with a geocoding service
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={bookingMutation.isPending}
        >
          {bookingMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Confirm Booking
        </Button>
      </form>
    </Form>
  );
}
