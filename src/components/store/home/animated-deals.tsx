"use client";
import { SimpleProduct } from "@/lib/types";
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
    <div className="relative w-full min-h-[50vh] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(244,114,182,0.45)] bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600">
      {/* Subtle animated background using pink theme */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -left-10 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-rose-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 border border-white/20 rounded-full" />
        <div className="absolute top-10 right-1/4 w-24 h-24 border border-white/15 rounded-3xl rotate-6" />
      </div>

      {/* Hero text section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 px-4">
        <div className="space-y-2">
          {/* Discount badge */}
          <div className="inline-flex items-center justify-center px-5 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 mb-3">
            <span className="text-xs font-semibold tracking-[0.18em] text-pink-50 uppercase">
              Limited time • Pink Super Deals
            </span>
          </div>
          
          {/* Main discount text */}
          <h1 className="font-black text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] tracking-tight">
            Up to <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">90%</span>
          </h1>
          
          {/* Super Deals text */}
          <h2 className="text-pink-50 text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide drop-shadow-lg">
            Super Deals
          </h2>
          
          {/* CTA Button */}
          <div className="pt-3">
            <Link 
              href="/browse"
              className="inline-flex items-center gap-2 px-7 py-3 bg-white text-pink-600 rounded-full font-semibold text-sm md:text-base shadow-lg hover:shadow-xl hover:bg-pink-50 hover:text-pink-700 transform hover:translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
            >
              Shop Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Sellers Card */}
      <Link
        href="/browse"
        className="group absolute top-[15%] left-[5%] md:left-[8%] lg:left-[12%] rounded-2xl w-[130px] md:w-[150px] lg:w-[170px] h-[170px] md:h-[190px] lg:h-[210px] z-20 flex flex-col items-center p-3 bg-white/12 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transform hover:scale-105 hover:-rotate-2 transition-all duration-300"
      >
        <div className="relative w-full h-[60%] rounded-xl overflow-hidden bg-white shadow-lg">
          <Image
            src={TopSellerImg}
            alt="Top Sellers"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm md:text-base font-semibold text-center text-white drop-shadow-lg">
            Top Sellers
          </span>
        </div>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center text-pink-700 font-black text-xs shadow-lg">
          HOT
        </div>
      </Link>

      {/* Top Rated Card */}
      <Link
        href="/browse"
        className="group absolute top-[15%] right-[5%] md:right-[8%] lg:right-[12%] rounded-2xl w-[130px] md:w-[150px] lg:w-[170px] h-[170px] md:h-[190px] lg:h-[210px] z-20 flex flex-col items-center p-3 bg-white/12 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transform hover:scale-105 hover:rotate-2 transition-all duration-300"
      >
        <div className="relative w-full h-[60%] rounded-xl overflow-hidden bg-white shadow-lg">
          <Image
            src={TopRatedImg}
            alt="Top Rated"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm md:text-base font-semibold text-center text-white drop-shadow-lg">
            Top Rated
          </span>
        </div>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-pink-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </Link>

      {/* Countdown Timer */}
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex justify-center items-center bg-pink-700/80 backdrop-blur-lg px-6 py-3 rounded-2xl border border-white/20 shadow-xl z-30">
        <Countdown targetDate="2025-12-31T23:59:59.999Z" home_style />
      </div>

      {/* Product Swiper */}
      <div className="gap-2 w-[280px] sm:w-[350px] md:w-[450px] lg:w-[550px] xl:w-[650px] absolute top-[5%] left-1/2 -translate-x-1/2 z-10">
        <MainSwiper
          products={products}
          type="simple"
          spaceBetween={10}
          slidesPerView={3}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 12 },
            768: { slidesPerView: 4, spaceBetween: 15 },
            1024: { slidesPerView: 5, spaceBetween: 15 },
            1280: { slidesPerView: 6, spaceBetween: 15 },
          }}
        />
      </div>
    </div>
  );
}
