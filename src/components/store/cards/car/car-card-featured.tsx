"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  Sparkles,
  Building2,
  User,
  ArrowRight,
  Eye,
} from "lucide-react";
import type { CarListingWithImages } from "@/queries/cars";

interface CarCardFeaturedProps {
  car: CarListingWithImages;
  className?: string;
  priority?: boolean;
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

export default function CarCardFeatured({
  car,
  className,
  priority = false,
}: CarCardFeaturedProps) {
  const primaryImage = car.images.find((img) => img.isPrimary) || car.images[0];
  const isDealer = car.carSubscription?.sellerType === "DEALER";
  const dealerName = car.carSubscription?.dealerName;

  return (
    <Link href={`/cars/${car.slug}`} className="block group h-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 h-full min-h-[400px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]",
          className
        )}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={car.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Top Badges */}
        <div className="relative z-10 p-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {car.isSponsored && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                Sponsored
              </Badge>
            )}
            {car.condition === "NEW" && (
              <Badge className="bg-emerald-500 text-white border-0 shadow">
                Brand New
              </Badge>
            )}
            {car.condition === "CERTIFIED_PRE_OWNED" && (
              <Badge className="bg-blue-500 text-white border-0 shadow">
                Certified Pre-Owned
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDealer ? (
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 shadow">
                <Building2 className="w-3 h-3 mr-1" />
                Dealer
              </Badge>
            ) : (
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 shadow">
                <User className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-auto p-6 flex flex-col">
          {/* Price */}
          <div className="mb-4">
            <span className="text-4xl font-bold text-white drop-shadow-lg">
              {formatPrice(car.price)}
            </span>
            {car.priceNegotiable && (
              <Badge
                variant="outline"
                className="ml-2 border-white/50 text-white/80"
              >
                Negotiable
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
            {car.year} {car.make} {car.model}
          </h3>
          {car.variant && (
            <p className="text-white/70 text-sm mb-4">{car.variant}</p>
          )}

          {/* Specs Grid */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white">
              <Gauge className="w-4 h-4 mr-1.5" />
              {formatMileage(car.mileage)}
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white capitalize">
              <Fuel className="w-4 h-4 mr-1.5" />
              {car.fuelType.toLowerCase().replace("_", " ")}
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white capitalize">
              {car.transmission.toLowerCase().replace("_", " ")}
            </div>
          </div>

          {/* Location and Views */}
          <div className="flex items-center justify-between text-white/60 text-sm mb-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {car.city}, {car.province}
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {car.views} views
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-xl py-6 group/btn transition-all duration-300"
            size="lg"
          >
            View Details
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>

          {/* Dealer Name */}
          {isDealer && dealerName && (
            <p className="text-center text-white/50 text-xs mt-3">
              Listed by {dealerName}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
