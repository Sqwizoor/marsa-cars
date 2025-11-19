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
    <div className="relative w-full py-12 px-4 md:px-8 rounded-3xl overflow-hidden bg-main-primary shadow-2xl">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-primary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div className="text-center md:text-left">
            <div className="inline-block px-4 py-1 rounded-full bg-orange-primary/10 border border-orange-primary/20 text-orange-primary text-sm font-medium mb-4">
              Limited Time Offer
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Super <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-primary to-pink-primary">Deals</span>
            </h2>
            <p className="text-main-secondary text-lg">Save up to 90% on premium auto parts</p>
          </div>
          
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
            <Countdown targetDate="2025-12-31T23:59:59.999Z" home_style />
          </div>
        </div>

        {/* Featured Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Top Sellers Card */}
          <Link href="/browse" className="group relative h-[240px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/5 hover:border-orange-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute right-0 top-0 w-2/3 h-full">
               <Image
                src={TopSellerImg}
                alt="Top Sellers"
                fill
                className="object-contain object-right p-4 group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="relative h-full flex flex-col justify-center p-8 z-10">
              <div className="w-10 h-10 rounded-full bg-orange-primary flex items-center justify-center text-white font-bold text-xs mb-4 shadow-lg shadow-orange-primary/20">
                HOT
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Top Sellers</h3>
              <p className="text-main-secondary text-sm mb-4">Most popular items this week</p>
              <span className="inline-flex items-center text-orange-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                Shop Now <span className="ml-2">→</span>
              </span>
            </div>
          </Link>

          {/* Top Rated Card */}
          <Link href="/browse" className="group relative h-[240px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/5 hover:border-blue-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute right-0 top-0 w-2/3 h-full">
               <Image
                src={TopRatedImg}
                alt="Top Rated"
                fill
                className="object-contain object-right p-4 group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="relative h-full flex flex-col justify-center p-8 z-10">
              <div className="w-10 h-10 rounded-full bg-blue-primary flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-primary/20">
                ★
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Top Rated</h3>
              <p className="text-main-secondary text-sm mb-4">Curated by our experts</p>
              <span className="inline-flex items-center text-blue-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                View Collection <span className="ml-2">→</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Products Swiper Section */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
          <MainSwiper
            products={products}
            type="deal"
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 4, spaceBetween: 24 },
              1024: { slidesPerView: 5, spaceBetween: 24 },
              1280: { slidesPerView: 6, spaceBetween: 24 },
            }}
          />
        </div>
      </div>
    </div>
  );
}
