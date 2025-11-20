"use client";
import { SimpleProduct } from "@/lib/types";
import TopSellerImg from "@/public/assets/images/featured/shocks.png";
import TopRatedImg from "@/public/assets/images/featured/light.png";
import Image from "next/image";
import Link from "next/link";
import MainSwiper from "../shared/swiper";
import Countdown from "../shared/countdown";
import { ArrowRight, Zap } from "lucide-react";

export default function AnimatedDeals({
  products,
}: {
  products: SimpleProduct[];
}) {
  return (
    <div className="w-full mt-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Banner Section */}
        <div className="lg:w-[320px] bg-gray-50 p-6 flex flex-col justify-between relative shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Limited Offer
              </span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">
              Super <span className="text-pink-500">Deals</span>
            </h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">
              Up to 90% off on premium parts
            </p>
            
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ends in:</p>
              <Countdown targetDate="2025-12-31T23:59:59.999Z" />
            </div>
          </div>

          {/* Featured Images with Pink Background */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <Link href="/browse" className="group">
              <div className="bg-pink-500 rounded-xl p-3 h-24 flex items-center justify-center relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image 
                  src={TopSellerImg} 
                  alt="Top Seller" 
                  className="object-contain w-full h-full drop-shadow-md group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute bottom-1 left-0 right-0 text-center">
                   <span className="text-[9px] font-bold text-white/90 uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Top Seller</span>
                </div>
              </div>
            </Link>
            <Link href="/browse" className="group">
              <div className="bg-pink-500 rounded-xl p-3 h-24 flex items-center justify-center relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image 
                  src={TopRatedImg} 
                  alt="Top Rated" 
                  className="object-contain w-full h-full drop-shadow-md group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute bottom-1 left-0 right-0 text-center">
                   <span className="text-[9px] font-bold text-white/90 uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Top Rated</span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Right Swiper Section */}
        <div className="flex-1 p-4 lg:p-6 min-w-0 bg-white flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <Zap className="w-4 h-4 text-pink-500 fill-pink-500" />
               Flash Sale Items
             </h3>
             <Link href="/browse" className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-colors">
               View All <ArrowRight className="w-3 h-3" />
             </Link>
          </div>
          <MainSwiper
            products={products}
            type="deal"
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
              1536: { slidesPerView: 5, spaceBetween: 20 },
            }}
          />
        </div>
      </div>
    </div>
  );
}
