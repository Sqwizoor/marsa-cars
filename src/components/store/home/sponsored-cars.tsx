"use client";

import { CarListing, CarImage } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type SponsoredCarParams = CarListing & {
    images: CarImage[];
}

export default function SponsoredCars({ cars }: { cars: SponsoredCarParams[] }) {
  if (!cars || cars.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4; // Number of items visible at once
  const maxIndex = Math.max(0, cars.length - itemsPerView);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [maxIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  return (
    <div className="w-full mt-6">
       <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-white" /> Featured Ads
            </span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Sponsored</span>
        </div>
        {/* Navigation arrows */}
        <div className="flex items-center gap-2">
          <button 
            onClick={goPrev}
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={goNext}
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
       </div>

      <div className="w-full overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 py-4 relative">
        <div 
          className="flex gap-4 px-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 288}px)` }} // 288px = 272px card width + 16px gap
        >
          {cars.map((car, index) => (
              <Link 
                  href={`/cars/${car.slug}`} 
                  key={`${car.id}-${index}`}
                  className="w-[272px] h-20 bg-white rounded-lg shadow-sm border border-gray-200 flex-shrink-0 flex overflow-hidden hover:shadow-md transition-all hover:scale-[1.02] relative"
              >
                  <div className="w-24 relative h-full bg-gray-50 flex-shrink-0">
                  {car.images[0] ? (
                      <Image 
                      src={car.images[0].url} 
                      alt={car.title} 
                      fill 
                      className="object-cover"
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                  )}
                  </div>
                  <div className="p-2.5 flex flex-col justify-center flex-1 min-w-0 bg-white">
                  <div className="flex justify-between items-start gap-1">
                          <h3 className="font-bold text-sm truncate text-gray-800 leading-tight">{car.make} {car.model}</h3>
                          <span className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded flex-shrink-0">Ad</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{car.year} • {car.transmission} • {car.fuelType}</p>
                  <p className="text-gray-800 font-bold text-sm mt-1 leading-none">
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(car.price)}
                  </p>
                  </div>
              </Link>
          ))}
        </div>
      </div>
      
      {/* Pagination dots */}
      {cars.length > itemsPerView && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? "bg-gray-700" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
