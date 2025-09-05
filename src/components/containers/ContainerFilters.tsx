// components/containers/ContainerFilters.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterProps {
  onFilter: (filters: { size: string; maxPrice: string; availability: string }) => void;
}

export default function ContainerFilters({ onFilter }: FilterProps) {
  const [size, setSize] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("");

  const handleApply = () => {
    onFilter({ size, maxPrice, availability });
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
      {/* Size Filter */}
      <Select onValueChange={setSize}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10yd">10 Yards</SelectItem>
          <SelectItem value="20yd">20 Yards</SelectItem>
          <SelectItem value="30yd">30 Yards</SelectItem>
          <SelectItem value="40yd">40 Yards</SelectItem>
        </SelectContent>
      </Select>

      {/* Max Price Filter */}
      <Input
        type="number"
        placeholder="Max Price ($)"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="w-[180px]"
      />

      {/* Availability Filter */}
      <Select onValueChange={setAvailability}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="available">Available Now</SelectItem>
          <SelectItem value="week">Next 7 Days</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>

      {/* Apply Button */}
      <Button onClick={handleApply} className="w-[120px]">
        Apply
      </Button>
    </div>
  );
}
