"use client";

import { useState, useEffect, useRef } from "react";
import { CarCardFeatured } from "@/components/store/cards/car";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { CarListingWithImages } from "@/queries/cars";
import Link from "next/link";

export default function SponsoredCarsSection() {
  const [listings, setListings] = useState<CarListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSponsored = async () => {
      try {
        const response = await fetch("/api/cars/sponsored");
        const data = await response.json();
        setListings(data.listings || []);

        // Track views for all fetched listings
        data.listings?.forEach((listing: CarListingWithImages) => {
          fetch("/api/cars/sponsored", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId: listing.id, type: "view" }),
          }).catch(() => {});
        });
      } catch (error) {
        console.error("Error fetching sponsored cars:", error);
      }
      setLoading(false);
    };

    fetchSponsored();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (listings.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, listings.length - 1));
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [listings.length]);

  const handlePrev = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => Math.min(listings.length - 2, prev + 1));
  };

  const handleClick = (listingId: string) => {
    fetch("/api/cars/sponsored", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, type: "click" }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-[400px] bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Sponsored Vehicles
              </h2>
              <p className="text-gray-400">Premium listings from verified sellers</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= listings.length - 2}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden" ref={scrollRef}>
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / 2 + 1.5)}%)`,
            }}
          >
            {listings.map((car, index) => (
              <div
                key={car.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)]"
                onClick={() => handleClick(car.id)}
              >
                <CarCardFeatured car={car} priority={index < 2} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-6">
          {listings.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link href="/cars/sell">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Your Car Sponsored
            </Button>
          </Link>
          <p className="text-gray-400 text-sm mt-3">
            Reach thousands of potential buyers with sponsored listings
          </p>
        </div>
      </div>
    </section>
  );
}
