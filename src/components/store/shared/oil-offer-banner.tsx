import { ArrowRight, Droplets, Tag } from "lucide-react";
import Link from "next/link";

export default function OilOfferBanner() {
  return (
    <Link
      href="/browse?search=oil"
      className="group block w-full rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/70 to-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-500/15 border border-amber-300/60 flex items-center justify-center shrink-0 text-amber-700">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800">
              <Tag className="w-3 h-3" />
              <span>Engine Oil Offer</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-main-primary group-hover:text-amber-800 transition-colors">
              Need Engine Oil for Your Service?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Browse quality synthetic and multi-grade engine oils and lubricants with nationwide BobGo courier delivery.
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:pl-2">
          <span className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-amber-600 group-hover:bg-amber-700 px-5 py-2.5 text-sm font-bold text-white transition-colors whitespace-nowrap">
            <span>Shop Engine Oil</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
