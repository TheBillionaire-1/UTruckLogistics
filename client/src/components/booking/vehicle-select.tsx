import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck } from "lucide-react";
import { useEffect } from "react";

export const vehicles = [
  { 
    value: "van-3.5", 
    label: "3.5 Ton Van", 
    weightRange: { min: 0, max: 3500 },
    description: "Suitable for small deliveries and parcels"
  },
  { 
    value: "truck-7.5", 
    label: "7.5 Ton Truck", 
    weightRange: { min: 3500, max: 7500 },
    description: "Medium capacity for regional deliveries"
  },
  { 
    value: "truck-18", 
    label: "18 Wheeler Truck", 
    weightRange: { min: 7500, max: 40000 },
    description: "High capacity for long-distance freight"
  },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  cargoWeight?: number;
  onCargoWeightChange?: (weight: number) => void;
};

export default function VehicleSelect({ 
  value, 
  onChange, 
  cargoWeight, 
  onCargoWeightChange 
}: Props) {
  // Update cargo weight when vehicle changes (if weight handler provided)
  useEffect(() => {
    if (value && onCargoWeightChange && cargoWeight !== undefined) {
      const selectedVehicle = vehicles.find(v => v.value === value);
      if (selectedVehicle) {
        const { min, max } = selectedVehicle.weightRange;
        
        // If current weight is outside the vehicle's range, adjust it
        if (cargoWeight < min || cargoWeight > max) {
          // Set to middle of range as default or to min if that's more appropriate
          const newWeight = Math.min(Math.floor((min + max) / 2), max);
          onCargoWeightChange(newWeight);
        }
      }
    }
  }, [value, cargoWeight, onCargoWeightChange]);

  // Handle vehicle selection with respect to cargo weight
  const handleVehicleChange = (newVehicleType: string) => {
    onChange(newVehicleType);
    
    // Optionally update cargo weight to match vehicle capacity
    if (onCargoWeightChange && cargoWeight !== undefined) {
      const selectedVehicle = vehicles.find(v => v.value === newVehicleType);
      if (selectedVehicle) {
        const { min, max } = selectedVehicle.weightRange;
        
        // If current weight is outside the new vehicle's range, adjust it
        if (cargoWeight < min || cargoWeight > max) {
          // Set to middle of range as default or to min if that's more appropriate
          const newWeight = Math.min(Math.floor((min + max) / 2), max);
          onCargoWeightChange(newWeight);
        }
      }
    }
  };

  return (
    <Select value={value} onValueChange={handleVehicleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a vehicle type" />
      </SelectTrigger>
      <SelectContent>
        {vehicles.map((vehicle) => (
          <SelectItem key={vehicle.value} value={vehicle.value} className="flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <Truck className="mr-2 h-4 w-4" />
                <span>{vehicle.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {vehicle.description}
              </p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
