import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

// Weight ranges for different vehicle types
const weightRanges = {
  "van-3.5": { min: 0, max: 3500 },
  "truck-7.5": { min: 3500, max: 7500 },
  "truck-18": { min: 7500, max: 40000 },
};

type WeightOption = {
  value: number;
  label: string;
  vehicleTypes: string[];
};

// Weight options with appropriate vehicle mappings
const weightOptions: WeightOption[] = [
  { value: 1000, label: "Up to 1 ton (1,000 kg)", vehicleTypes: ["van-3.5"] },
  { value: 2000, label: "Up to 2 tons (2,000 kg)", vehicleTypes: ["van-3.5"] },
  { value: 3500, label: "Up to 3.5 tons (3,500 kg)", vehicleTypes: ["van-3.5"] },
  { value: 5000, label: "Up to 5 tons (5,000 kg)", vehicleTypes: ["truck-7.5"] },
  { value: 7500, label: "Up to 7.5 tons (7,500 kg)", vehicleTypes: ["truck-7.5"] },
  { value: 10000, label: "Up to 10 tons (10,000 kg)", vehicleTypes: ["truck-18"] },
  { value: 20000, label: "Up to 20 tons (20,000 kg)", vehicleTypes: ["truck-18"] },
  { value: 30000, label: "Up to 30 tons (30,000 kg)", vehicleTypes: ["truck-18"] },
  { value: 40000, label: "Up to 40 tons (40,000 kg)", vehicleTypes: ["truck-18"] },
];

type Props = {
  value: number;
  onChange: (value: number) => void;
  vehicleType: string;
  onVehicleTypeChange?: (value: string) => void;
};

export default function CargoWeightSelect({ 
  value, 
  onChange, 
  vehicleType,
  onVehicleTypeChange
}: Props) {
  const [availableWeights, setAvailableWeights] = useState<WeightOption[]>([]);
  
  // Update available weight options based on vehicle type
  useEffect(() => {
    if (vehicleType) {
      const filteredOptions = weightOptions.filter(option => 
        option.vehicleTypes.includes(vehicleType)
      );
      setAvailableWeights(filteredOptions);
      
      // If current weight is not valid for the vehicle type, select the first valid option
      const isCurrentWeightValid = filteredOptions.some(option => option.value === value);
      if (!isCurrentWeightValid && filteredOptions.length > 0) {
        onChange(filteredOptions[0].value);
      }
    } else {
      setAvailableWeights(weightOptions);
    }
  }, [vehicleType, value, onChange]);

  // Handle weight selection and update vehicle type if needed
  const handleWeightChange = (weightValue: string) => {
    const numericWeight = parseInt(weightValue, 10);
    onChange(numericWeight);

    // If weight selection should change vehicle type
    if (onVehicleTypeChange) {
      const selectedOption = weightOptions.find(opt => opt.value === numericWeight);
      if (selectedOption && !selectedOption.vehicleTypes.includes(vehicleType)) {
        // Select the appropriate vehicle type based on weight
        onVehicleTypeChange(selectedOption.vehicleTypes[0]);
      }
    }
  };

  return (
    <Select value={value.toString()} onValueChange={handleWeightChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select cargo weight" />
      </SelectTrigger>
      <SelectContent>
        {availableWeights.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()} className="flex items-center">
            <div className="flex items-center">
              <Scale className="mr-2 h-4 w-4" />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}