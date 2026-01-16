"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import {
  CAR_MAKES,
  CAR_BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  CAR_CONDITIONS,
  SA_PROVINCES,
} from "@/constants/car-subscription-plans";

interface CarFiltersProps {
  onClose: () => void;
  onApply: () => void;
}

export default function CarFilters({ onClose, onApply }: CarFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    yearMin: searchParams.get("yearMin") || "",
    yearMax: searchParams.get("yearMax") || "",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    mileageMax: searchParams.get("mileageMax") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    condition: searchParams.get("condition") || "",
    province: searchParams.get("province") || "",
    bodyType: searchParams.get("bodyType") || "",
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    params.set("page", "1");
    router.push(`/cars?${params.toString()}`);
    onApply();
  };

  const clearFilters = () => {
    setFilters({
      make: "",
      model: "",
      yearMin: "",
      yearMax: "",
      priceMin: "",
      priceMax: "",
      mileageMax: "",
      fuelType: "",
      transmission: "",
      condition: "",
      province: "",
      bodyType: "",
    });
    router.push("/cars");
    onApply();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filter Cars</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Make */}
        <div className="space-y-2">
          <Label>Make</Label>
          <Select value={filters.make} onValueChange={(v) => handleChange("make", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Makes</SelectItem>
              {CAR_MAKES.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            placeholder="Any model"
            value={filters.model}
            onChange={(e) => handleChange("model", e.target.value)}
          />
        </div>

        {/* Year Range */}
        <div className="space-y-2">
          <Label>Year From</Label>
          <Select value={filters.yearMin} onValueChange={(v) => handleChange("yearMin", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Min Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Year To</Label>
          <Select value={filters.yearMax} onValueChange={(v) => handleChange("yearMax", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Max Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Min Price (R)</Label>
          <Input
            type="number"
            placeholder="0"
            value={filters.priceMin}
            onChange={(e) => handleChange("priceMin", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Price (R)</Label>
          <Input
            type="number"
            placeholder="Any"
            value={filters.priceMax}
            onChange={(e) => handleChange("priceMax", e.target.value)}
          />
        </div>

        {/* Mileage */}
        <div className="space-y-2">
          <Label>Max Mileage (km)</Label>
          <Input
            type="number"
            placeholder="Any"
            value={filters.mileageMax}
            onChange={(e) => handleChange("mileageMax", e.target.value)}
          />
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <Label>Fuel Type</Label>
          <Select value={filters.fuelType} onValueChange={(v) => handleChange("fuelType", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {FUEL_TYPES.map((fuel) => (
                <SelectItem key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <Label>Transmission</Label>
          <Select value={filters.transmission} onValueChange={(v) => handleChange("transmission", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {TRANSMISSION_TYPES.map((trans) => (
                <SelectItem key={trans.value} value={trans.value}>
                  {trans.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label>Condition</Label>
          <Select value={filters.condition} onValueChange={(v) => handleChange("condition", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {CAR_CONDITIONS.map((cond) => (
                <SelectItem key={cond.value} value={cond.value}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type */}
        <div className="space-y-2">
          <Label>Body Type</Label>
          <Select value={filters.bodyType} onValueChange={(v) => handleChange("bodyType", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {CAR_BODY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Province */}
        <div className="space-y-2">
          <Label>Province</Label>
          <Select value={filters.province} onValueChange={(v) => handleChange("province", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              {SA_PROVINCES.map((prov) => (
                <SelectItem key={prov} value={prov}>
                  {prov}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={clearFilters}>
          Clear All
        </Button>
        <Button
          onClick={applyFilters}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
