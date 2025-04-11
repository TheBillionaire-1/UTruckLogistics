import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Refrigerator, Truck } from "lucide-react";
import { CargoType } from "@shared/schema";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CargoTypeSelect({ value, onChange }: Props) {
  const [selectedValue, setSelectedValue] = useState(value || CargoType.DRY_GOODS);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  return (
    <Select value={selectedValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select cargo type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CargoType.DRY_GOODS} className="flex items-center">
          <div className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            <span>Dry Goods</span>
          </div>
        </SelectItem>
        <SelectItem value={CargoType.FOOD} className="flex items-center">
          <div className="flex items-center">
            <Refrigerator className="mr-2 h-4 w-4" />
            <span>Food</span>
          </div>
        </SelectItem>
        <SelectItem value={CargoType.MOVING_SERVICES} className="flex items-center">
          <div className="flex items-center">
            <Truck className="mr-2 h-4 w-4" />
            <span>Moving Services</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}