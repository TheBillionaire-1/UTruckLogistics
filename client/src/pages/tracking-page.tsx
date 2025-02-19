import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
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

  useEffect(() => {
    // Set up WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const location = JSON.parse(event.data);
        setVehicleLocation(location);
      } catch (error) {
        console.error("Failed to parse vehicle location:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

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