import { Card } from "@/components/ui/card";
import { LocationData } from "@/pages/booking-page";

type Props = {
  locationData: LocationData | null;
};

export default function MapView({ locationData }: Props) {
  return (
    <Card className="w-full h-full flex items-center justify-center text-muted-foreground">
      Map View
      {/* Google Maps integration would go here */}
    </Card>
  );
}
