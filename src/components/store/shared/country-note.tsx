import { Info } from "lucide-react";

export default function CountryNote({ country }: { country: string }) {
  return (
    <div className="w-full p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start sm:items-center gap-2.5 sm:gap-3">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/90 flex flex-shrink-0 items-center justify-center mt-0.5 sm:mt-0">
        <Info className="w-4 h-4 text-emerald-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          Shipping fees are calculated via BobGo courier based on your delivery destination (
          <span className="font-semibold text-emerald-950">{country}</span>).
          Rates automatically update when you select or add your delivery address.
        </p>
      </div>
    </div>
  );
}

