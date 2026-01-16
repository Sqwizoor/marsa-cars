"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  Sparkles,
  Building2,
  User,
} from "lucide-react";
import type { CarListingWithImages } from "@/queries/cars";

interface CarCardProps {
  car: CarListingWithImages;
  className?: string;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatMileage = (mileage: number): string => {
  return new Intl.NumberFormat("en-ZA").format(mileage) + " km";
};

export default function CarCard({ car, className }: CarCardProps) {
  const primaryImage = car.images.find((img) => img.isPrimary) || car.images[0];
  const isDealer = car.carSubscription?.sellerType === "DEALER";
  const dealerName = car.carSubscription?.dealerName;

  return (
    <Link href={`/cars/${car.slug}`} className="block group">
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 border-gray-200 bg-white h-full",
          className
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={car.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {car.isSponsored && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Sponsored
              </Badge>
            )}
            {car.condition === "NEW" && (
              <Badge className="bg-green-500 text-white border-0">New</Badge>
            )}
            {car.condition === "CERTIFIED_PRE_OWNED" && (
              <Badge className="bg-blue-500 text-white border-0">
                Certified
              </Badge>
            )}
          </div>

          {/* Seller Badge */}
          <div className="absolute top-3 right-3">
            {isDealer ? (
              <Badge
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm text-gray-700 shadow"
              >
                <Building2 className="w-3 h-3 mr-1" />
                Dealer
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm text-gray-700 shadow"
              >
                <User className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-lg">
              {formatPrice(car.price)}
              {car.priceNegotiable && (
                <span className="text-xs font-normal ml-1 opacity-80">NEG</span>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
            {car.year} {car.make} {car.model}
          </h3>
          {car.variant && (
            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
              {car.variant}
            </p>
          )}

          {/* Quick Specs */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm text-gray-600">
              <Gauge className="w-4 h-4 mr-1.5 text-gray-400" />
              <span className="truncate">{formatMileage(car.mileage)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Fuel className="w-4 h-4 mr-1.5 text-gray-400" />
              <span className="truncate capitalize">
                {car.fuelType.toLowerCase().replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-4 h-4 mr-1.5 text-gray-400 font-semibold text-xs">
                {car.transmission === "AUTOMATIC"
                  ? "A"
                  : car.transmission === "MANUAL"
                  ? "M"
                  : "CVT"}
              </span>
              <span className="truncate capitalize">
                {car.transmission.toLowerCase().replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
              <span className="truncate">
                {car.city}, {car.province}
              </span>
            </div>
            {isDealer && dealerName && (
              <span className="text-xs text-blue-600 font-medium truncate max-w-[100px]">
                {dealerName}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
