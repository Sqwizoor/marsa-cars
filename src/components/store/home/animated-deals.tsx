"use client";
import { SimpleProduct } from "@/lib/types";
// import AnimatedImg from "@/public/assets/images/ads/animated-deals.gif";
import TopSellerImg from "@/public/assets/images/featured/shocks.png";
import TopRatedImg from "@/public/assets/images/featured/light.png";
import Image from "next/image";
import Link from "next/link";
import MainSwiper from "../shared/swiper";
import Countdown from "../shared/countdown";
export default function AnimatedDeals({
  products,
}: {
  products: SimpleProduct[];
}) {
  return (
    <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 w-full min-h-[50vh] rounded-2xl overflow-hidden shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)] animate-pulse" />
      </div>
      
      {/* Main discount text with modern styling */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="inline-block font-bold text-6xl md:text-7xl text-white drop-shadow-2xl">
          Up to 90%
        </span>
        <p className="text-white/90 text-xl md:text-2xl font-medium mt-2 drop-shadow-lg">
          Super Deals
        </p>
      </div>

      {/* Top Sellers Card - Modern glassmorphism style */}
      <Link
        href="/browse"
        className="group absolute top-[20%] left-[7%] min-[1070px]:left-[10%] rounded-3xl w-[140px] md:w-[160px] h-[190px] md:h-[210px] z-10 flex flex-col items-center p-4 bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
      >
        <div className="relative w-full h-[65%] rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
          <Image
            src={TopSellerImg}
            alt="Top Sellers"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span className="text-lg md:text-xl font-bold text-center text-white mt-auto drop-shadow-lg">
          Top Sellers
        </span>
      </Link>

      {/* Top Rated Card - Modern glassmorphism style */}
      <Link
        href="/browse"
        className="group absolute top-[20%] right-[7%] min-[1070px]:right-[10%] rounded-3xl w-[140px] md:w-[160px] h-[190px] md:h-[210px] z-10 flex flex-col items-center p-4 bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
      >
        <div className="relative w-full h-[65%] rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
          <Image
            src={TopRatedImg}
            alt="Top Rated"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span className="text-lg md:text-xl font-bold text-center text-white mt-auto drop-shadow-lg">
          Top Rated
        </span>
      </Link>

      {/* Countdown with modern background */}
      <div className="absolute top-[82%] left-1/2 -translate-x-1/2 flex justify-center items-center bg-black/20 backdrop-blur-md px-6 py-3 rounded-full">
        <Countdown targetDate="2025-04-12T19:15:00.769Z" home_style />
      </div>

      {/* Product swiper with improved positioning */}
      <div className="gap-[5px] w-[300px] min-[1100px]:w-[400px] min-[1400px]:w-[510px] absolute top-[3%] left-1/2 -translate-x-1/2">
        <MainSwiper
          products={products}
          type="simple"
          spaceBetween={-5}
          slidesPerView={3}
          breakpoints={{
            1100: { slidesPerView: 4 },
            1400: { slidesPerView: 5 },
          }}
        />
      </div>
    </div>
  );
}
