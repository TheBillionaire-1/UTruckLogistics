import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Booking, BookingStatus } from "@shared/schema";
import "leaflet/dist/leaflet.css";

type VehicleLocation = {
  lat: number;
  lng: number;
};

export default function TrackingPage() {
  const [, setLocation] = useLocation();
  const [vehicleLocation, setVehicleLocation] = useState<VehicleLocation>({
    lat: 0,
    lng: 0,
  });

  // Get current booking to check status
  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const currentBooking = bookings?.find(booking => 
    booking.status === BookingStatus.ACCEPTED || 
    booking.status === BookingStatus.IN_TRANSIT
  );

  useEffect(() => {
    // Only connect to WebSocket if there's an active booking
    if (!currentBooking) {
      return;
    }

    // Set up WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    // If we're the driver, start sending location
    const isDriver = window.location.pathname.startsWith('/driver');
    if (isDriver) {
      // Request permission and start sending location
      if ("geolocation" in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            socket.send(JSON.stringify(location));
            setVehicleLocation(location);
          },
          (error) => console.error("Error getting location:", error),
          { enableHighAccuracy: true }
        );

        return () => {
          navigator.geolocation.clearWatch(watchId);
        };
      }
    } else {
      // Customer: just receive location updates
      socket.onmessage = (event) => {
        try {
          const location = JSON.parse(event.data);
          setVehicleLocation(location);
        } catch (error) {
          console.error("Failed to parse vehicle location:", error);
        }
      };
    }

    return () => {
      socket.close();
    };
  }, [currentBooking]);

  if (!currentBooking) {
    setLocation("/booking/details");
    return null;
  }

  return (
    <div className="relative h-screen w-screen">
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-[9999] bg-white shadow-md hover:bg-gray-100"
        onClick={() => setLocation("/booking/details")}
      >
        <X className="h-4 w-4" />
      </Button>

      <Card className="w-full h-full">
        <MapContainer
          center={[vehicleLocation.lat || 0, vehicleLocation.lng || 0]}
          zoom={15}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vehicleLocation.lat !== 0 && vehicleLocation.lng !== 0 && (
            <Marker position={[vehicleLocation.lat, vehicleLocation.lng]} />
          )}
        </MapContainer>
      </Card>
    </div>
  );
}