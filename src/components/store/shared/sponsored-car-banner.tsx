"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Gauge,
  Fuel,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface SponsoredCarBannerProps {
  className?: string;
  sourceContext?: string;
}

const CAR_IMAGES = [
  {
    url: "/images/cars/mercedes-c350-coupe/c350-front.jpg",
    label: "Front AMG Styling",
  },
  {
    url: "/images/cars/mercedes-c350-coupe/c350-side.jpg",
    label: "Side Coupe Profile",
  },
  {
    url: "/images/cars/mercedes-c350-coupe/c350-rear.jpg",
    label: "Rear AMG Exhaust",
  },
  {
    url: "/images/cars/mercedes-c350-coupe/c350-license-disc.jpg",
    label: "Valid License Disc (2027)",
  },
];

export default function SponsoredCarBanner({
  className = "",
  sourceContext = "product_page",
}: SponsoredCarBannerProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const carSlug = "2014-mercedes-benz-c350-coupe-amg-sport";
  const sellerPhone = "+27725287520";
  const sellerPhoneFormatted = "+27 72 528 7520";
  const sellerName = "Thabiso";
  const whatsappUrl = `https://wa.me/27725287520?text=${encodeURIComponent(
    "Hi Thabiso, I'm contacting you regarding your 2014 Mercedes-Benz C350 Coupe AMG (R200,000) listed on Joumasecars. Is it still available for viewing in Soweto?"
  )}`;

  return (
    <div
      className={`w-full relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white shadow-xl ${className}`}
    >
      {/* Decorative gradient glow accents */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 px-4 py-3 sm:px-6 bg-neutral-900/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-sm">
            <Sparkles className="h-3.5 w-3.5 fill-black" />
            Sponsored Vehicle
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800/80 px-2.5 py-1 text-[11px] font-medium text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Verified Listing
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="hidden sm:inline font-mono">Diepkloof, Soweto</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-400">Available Now</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Image Gallery (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 group">
            <Image
              src={CAR_IMAGES[selectedImage].url}
              alt={CAR_IMAGES[selectedImage].label}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

            {/* Image caption badge */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md font-medium border border-white/10">
                {CAR_IMAGES[selectedImage].label}
              </span>
              <span className="bg-emerald-500/90 text-neutral-950 font-bold px-2 py-0.5 rounded text-[10px]">
                Valid License 2027
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {CAR_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-[16/10] overflow-hidden rounded-lg border transition-all ${
                  selectedImage === idx
                    ? "border-amber-400 ring-2 ring-amber-400/30 scale-95"
                    : "border-neutral-800 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.label}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Vehicle Information & Direct Actions (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          {/* Title & Price Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                2014 Mercedes-Benz C350 Coupe
              </h2>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-neutral-400 block">
                  Asking Price
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                  R 200,000
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Rare <strong className="text-white">AMG Sport Package</strong> in Tenorite Grey Metallic with striking{" "}
              <strong className="text-rose-400">Cranberry Red Leather Interior</strong> and Panoramic Sunroof. 
              Meticulously maintained, verified RSA license disc valid until 2027.
            </p>
          </div>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-center">
              <Gauge className="mx-auto h-4 w-4 text-amber-400 mb-1" />
              <div className="text-[10px] uppercase text-neutral-400">Mileage</div>
              <div className="text-xs sm:text-sm font-bold text-white">118,000 km</div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-center">
              <Fuel className="mx-auto h-4 w-4 text-emerald-400 mb-1" />
              <div className="text-[10px] uppercase text-neutral-400">Engine</div>
              <div className="text-xs sm:text-sm font-bold text-white">3.5L V6 (225 kW)</div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-center">
              <Sparkles className="mx-auto h-4 w-4 text-rose-400 mb-1" />
              <div className="text-[10px] uppercase text-neutral-400">Interior</div>
              <div className="text-xs sm:text-sm font-bold text-white">Red Leather AMG</div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-center">
              <MapPin className="mx-auto h-4 w-4 text-sky-400 mb-1" />
              <div className="text-[10px] uppercase text-neutral-400">Location</div>
              <div className="text-xs sm:text-sm font-bold text-white truncate">Diepkloof, JHB</div>
            </div>
          </div>

          {/* Highlights checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>7G-Tronic Plus Automatic + Paddle Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Panoramic Glass Sunroof & Xenon Lights</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>License Disc Exp: 2027-01-31 (Reg BT35PNGP)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct seller viewing at Aunt&apos;s house in Soweto</span>
            </div>
          </div>

          {/* Contact Seller & CTAs */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 text-neutral-950 font-black flex items-center justify-center text-sm shadow-md">
                T
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block">Seller: {sellerName}</span>
                <span className="text-neutral-400 text-[11px]">
                  Direct Private Seller • Soweto, Diepkloof
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>WhatsApp Seller</span>
              </a>

              {/* Call CTA */}
              <a
                href={`tel:${sellerPhone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2.5 text-xs font-semibold text-neutral-200 transition-all active:scale-95"
                title={`Call ${sellerPhoneFormatted}`}
              >
                <Phone className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">{sellerPhoneFormatted}</span>
                <span className="sm:hidden">Call</span>
              </a>

              {/* View Full Listing */}
              <Link
                href={`/cars/${carSlug}`}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-black text-neutral-950 shadow-md transition-all active:scale-95"
              >
                <span>View Full Listing</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
