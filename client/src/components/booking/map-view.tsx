import { Card } from "@/components/ui/card";
import { LocationData } from "@/pages/booking-page";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

type Props = {
  locationData: LocationData | null;
};

function MapCenter({ locationData }: Props) {
  const map = useMap();

  useEffect(() => {
    if (locationData?.pickup && locationData?.dropoff) {
      const bounds = new L.LatLngBounds([
        [locationData.pickup.coords.lat, locationData.pickup.coords.lng],
        [locationData.dropoff.coords.lat, locationData.dropoff.coords.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locationData, map]);

  return null;
}

function MapMarkers({ locationData }: Props) {
  const pickupMarker = useMemo(
    () =>
      locationData?.pickup ? (
        <Marker
          position={[locationData.pickup.coords.lat, locationData.pickup.coords.lng]}
          title="Pickup Location"
        />
      ) : null,
    [locationData?.pickup]
  );

  const dropoffMarker = useMemo(
    () =>
      locationData?.dropoff ? (
        <Marker
          position={[locationData.dropoff.coords.lat, locationData.dropoff.coords.lng]}
          title="Dropoff Location"
        />
      ) : null,
    [locationData?.dropoff]
  );

  return (
    <>
      {pickupMarker}
      {dropoffMarker}
    </>
  );
}

export default function MapView({ locationData }: Props) {
  // Default center (world view)
  const defaultCenter = { lat: 20, lng: 0 };
  const defaultZoom = 2;

  return (
    <Card className="w-full h-full overflow-hidden">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapMarkers locationData={locationData} />
        <MapCenter locationData={locationData} />
      </MapContainer>
    </Card>
  );
}