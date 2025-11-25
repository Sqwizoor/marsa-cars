"use client";
import { SimpleProduct } from "@/lib/types";
import TopSellerImg from "@/public/assets/images/featured/shocks.png";
import TopRatedImg from "@/public/assets/images/featured/light.png";
import Image from "next/image";
import Link from "next/link";
import MainSwiper from "../shared/swiper";
import Countdown from "../shared/countdown";
import { ArrowRight, Zap } from "lucide-react";

export default function AnimatedDeals() {
  return (
    <div className="w-full mt-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Limited Offer
                </span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                Super <span className="text-pink-500">Deals</span>
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                Up to 90% off on premium parts
              </p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Ends in:</p>
              <Countdown targetDate="2025-12-31T23:59:59.999Z" />
            </div>
          </div>

          {/* Featured Images with Pink Background */}
          <div className="flex gap-4 relative z-10 mt-6 md:mt-0">
            <Link href="/browse" className="group">
              <div className="bg-pink-500 rounded-xl p-3 w-32 h-24 flex items-center justify-center relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
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
              <div className="bg-pink-500 rounded-xl p-3 w-32 h-24 flex items-center justify-center relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
}
