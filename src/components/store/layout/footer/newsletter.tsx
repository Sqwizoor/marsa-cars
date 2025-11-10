import { SendIcon } from "@/components/store/icons";
import { Sparkles } from "lucide-react";

export default function Newsletter() {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
      
      <div className="max-w-[1430px] mx-auto px-5 py-8 relative z-10">
        <div className="flex flex-col gap-y-6 xl:flex-row items-center text-white">
          {/* Left */}
          <div className="flex items-center xl:w-[58%]">
            <div className="flex items-center gap-x-4">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm animate-bounce-slow">
                <SendIcon />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:gap-x-3">
                <span className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  Sign up to Newsletter
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                <span className="text-sm md:text-base opacity-90">
                  ...and receive <b className="text-yellow-300">$10 coupon</b> for first shopping
                </span>
              </div>
            </div>
          </div>
          
          {/* Right */}
          <div className="flex w-full xl:flex-1 group">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full h-12 px-6 bg-white/95 text-slate-900 rounded-l-full outline-none focus:bg-white transition-all duration-300 placeholder:text-slate-400"
            />
            <button className="h-12 px-8 text-sm font-semibold rounded-r-full bg-slate-900 text-white cursor-pointer hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap">
              Sign up
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
