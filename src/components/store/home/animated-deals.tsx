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
    <div className="relative bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 w-full min-h-[55vh] rounded-3xl overflow-hidden shadow-2xl">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        {/* Animated circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-2xl animate-ping" 
             style={{ animationDuration: '3s' }} />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-spin" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white rounded-full animate-spin" 
             style={{ animationDuration: '6s' }} />
      </div>

      {/* Hero text section */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <div className="space-y-2">
          {/* Discount badge */}
          <div className="inline-flex items-center justify-center px-6 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30 mb-4">
            <span className="text-white text-sm font-semibold tracking-wider">LIMITED TIME OFFER</span>
          </div>
          
          {/* Main discount text */}
          <h1 className="font-black text-7xl md:text-8xl lg:text-9xl text-white drop-shadow-2xl tracking-tight">
            Up to <span className="text-yellow-300">90%</span>
          </h1>
          
          {/* Super Deals text */}
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide drop-shadow-lg">
            Super Deals
          </h2>
          
          {/* CTA Button */}
          <div className="pt-4">
            <Link 
              href="/browse"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-pink-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
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
        className="group absolute top-[15%] left-[5%] md:left-[8%] lg:left-[12%] rounded-2xl w-[130px] md:w-[160px] lg:w-[180px] h-[170px] md:h-[200px] lg:h-[220px] z-20 flex flex-col items-center p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:bg-white/20 transform hover:scale-105 hover:-rotate-2 transition-all duration-300"
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
          <span className="text-lg md:text-xl font-bold text-center text-white drop-shadow-lg">
            Top Sellers
          </span>
        </div>
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-pink-600 font-black text-sm shadow-lg">
          HOT
        </div>
      </Link>

      {/* Top Rated Card */}
      <Link
        href="/browse"
        className="group absolute top-[15%] right-[5%] md:right-[8%] lg:right-[12%] rounded-2xl w-[130px] md:w-[160px] lg:w-[180px] h-[170px] md:h-[200px] lg:h-[220px] z-20 flex flex-col items-center p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:bg-white/20 transform hover:scale-105 hover:rotate-2 transition-all duration-300"
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
          <span className="text-lg md:text-xl font-bold text-center text-white drop-shadow-lg">
            Top Rated
          </span>
        </div>
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </Link>

      {/* Countdown Timer */}
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex justify-center items-center bg-pink-600/80 backdrop-blur-lg px-8 py-4 rounded-2xl border border-white/30 shadow-xl z-30">
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
