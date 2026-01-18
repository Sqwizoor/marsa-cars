"use client";

import { CarListing, CarImage } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

type SponsoredCarParams = CarListing & {
    images: CarImage[];
}

export default function SponsoredCars({ cars }: { cars: SponsoredCarParams[] }) {
  if (!cars || cars.length === 0) return null;

  // Use the original list, we will duplicate the container for the loop
  // If list is very short, ensuring it has at least a few items helps appearance
  const displayCars = cars.length < 5 ? [...cars, ...cars, ...cars, ...cars] : cars;

  return (
    <div className="w-full mt-6">
       <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-white" /> Featured Ads
            </span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Sponsored</span>
        </div>
       </div>

      <div className="w-full overflow-hidden bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100/50 shadow-sm py-3 group relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
        
        <div className="flex animate-marquee hover:pause w-max">
          <div className="flex gap-4 pr-4">
            {displayCars.map((car, index) => (
                <Link 
                    href={`/cars/${car.slug}`} 
                    key={`${car.id}-${index}`}
                    className="w-72 h-20 bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0 flex overflow-hidden hover:shadow-md transition-all hover:scale-[1.02] relative"
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
                    <p className="text-pink-600 font-bold text-sm mt-1 leading-none">
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(car.price)}
                    </p>
                    </div>
                </Link>
            ))}
          </div>
          {/* Duplicate container for seamless loop */}
           <div className="flex gap-4 pr-4">
            {displayCars.map((car, index) => (
                <Link 
                    href={`/cars/${car.slug}`} 
                    key={`${car.id}-${index}-dup`}
                    className="w-72 h-20 bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0 flex overflow-hidden hover:shadow-md transition-all hover:scale-[1.02] relative"
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
                    <p className="text-pink-600 font-bold text-sm mt-1 leading-none">
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(car.price)}
                    </p>
                    </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .hover\\:pause:hover {
            animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
