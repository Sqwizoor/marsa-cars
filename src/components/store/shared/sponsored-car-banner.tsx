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
  ChevronRight,
  CheckCircle2,
  Play,
  X,
  Package,
} from "lucide-react";

interface SponsoredCarBannerProps {
  className?: string;
  sourceContext?: string;
}

const SPONSORED_DEALS = [
  {
    id: "mercedes-c350",
    tabLabel: "Mercedes C350 Coupe (R200k)",
    tagline: "AMG Sport Package • Soweto, Diepkloof",
    title: "2014 Mercedes-Benz C350 Coupe",
    price: "R 200,000",
    priceSubtext: "Asking Price",
    slug: "2014-mercedes-benz-c350-coupe-amg-sport",
    description: (
      <>
        Rare <strong className="text-white">AMG Sport Package</strong> in Tenorite Grey Metallic with striking{" "}
        <strong className="text-rose-400">Cranberry Red Leather Interior</strong> and Panoramic Sunroof. Meticulously maintained, verified RSA license disc valid until 2027.
      </>
    ),
    location: "Diepkloof, Soweto",
    sellerName: "Thabiso",
    sellerSubtext: "Direct Private Seller • Soweto, Diepkloof",
    sellerPhone: "+27725287520",
    sellerPhoneFormatted: "+27 72 528 7520",
    whatsappUrl: `https://wa.me/27725287520?text=${encodeURIComponent(
      "Hi Thabiso, I'm contacting you regarding your 2014 Mercedes-Benz C350 Coupe AMG (R200,000) listed on Joumasecars. Is it still available for viewing in Soweto?"
    )}`,
    videoUrl: "/images/cars/mercedes-c350-coupe/c350-video-tour.mp4",
    videoPoster: "/images/cars/mercedes-c350-coupe/video-frame.jpg",
    specs: [
      { icon: Gauge, label: "Mileage", value: "118,000 km", color: "text-amber-400" },
      { icon: Fuel, label: "Engine", value: "3.5L V6 (225 kW)", color: "text-emerald-400" },
      { icon: Sparkles, label: "Interior", value: "Red Leather AMG", color: "text-rose-400" },
      { icon: MapPin, label: "Location", value: "Diepkloof, JHB", color: "text-sky-400" },
    ],
    features: [
      "7G-Tronic Plus Automatic + Paddle Shift",
      "Panoramic Glass Sunroof & Xenon Lights",
      "License Disc Exp: 2027-01-31 (Reg BT35PNGP)",
      "Direct seller viewing at Aunt's house in Soweto",
    ],
    images: [
      { url: "/images/cars/mercedes-c350-coupe/c350-front.jpg", label: "Front AMG Styling" },
      { url: "/images/cars/mercedes-c350-coupe/c350-side.jpg", label: "Side Coupe Profile" },
      { url: "/images/cars/mercedes-c350-coupe/c350-rear.jpg", label: "Rear AMG Exhaust" },
      { url: "/images/cars/mercedes-c350-coupe/c350-license-disc.jpg", label: "Valid License Disc (2027)" },
    ],
  },
  {
    id: "challenger-trailer",
    tabLabel: "Challenger Luggage Trailer (R25k)",
    tagline: "Completely Redone • Louis Trichardt",
    title: "2007 Challenger Luggage Trailer",
    price: "R 25,000",
    priceSubtext: "Asking Price",
    slug: "challenger-luggage-trailer-2007",
    description: (
      <>
        2007 Challenger luggage trailer, <strong className="text-white">completely redone inside and out</strong>. Fresh white &amp; black finish, diamond-plate nosecone, steel roof rack basket, and heavy-duty tow hitch.
      </>
    ),
    location: "Louis Trichardt, Limpopo",
    sellerName: "Leon",
    sellerSubtext: "Private Seller • Louis Trichardt, Limpopo",
    sellerPhone: "+27738961878",
    sellerPhoneFormatted: "+27 73 896 1878",
    whatsappUrl: `https://wa.me/27738961878?text=${encodeURIComponent(
      "Hi Leon, I'm contacting you regarding your 2007 Challenger Luggage Trailer (R25,000) listed on Joumasecars. Is it still available for viewing in Louis Trichardt?"
    )}`,
    videoUrl: null,
    videoPoster: null,
    specs: [
      { icon: Package, label: "Condition", value: "Fully Redone", color: "text-amber-400" },
      { icon: Package, label: "Type", value: "Luggage Trailer", color: "text-emerald-400" },
      { icon: Sparkles, label: "Color", value: "White & Black", color: "text-neutral-300" },
      { icon: MapPin, label: "Location", value: "Louis Trichardt", color: "text-sky-400" },
    ],
    features: [
      "Diamond-Plate Nosecone Storage Box",
      "Steel Mesh Roof Rack Basket",
      "Side Access Hatch & Rear Hinged Door",
      "Tow Hitch, Jockey Stand & Safety Chain",
    ],
    images: [
      {
        url: "https://res.cloudinary.com/dphfdfqah/image/upload/v1794633773/lruzb1n4klrg3engan06.jpg",
        label: "Hitch & Nosecone View",
      },
      {
        url: "https://res.cloudinary.com/dphfdfqah/image/upload/v1794633774/yxbqu7qiljnvxcyzfzvl.jpg",
        label: "Roof Basket & Side",
      },
      {
        url: "https://res.cloudinary.com/dphfdfqah/image/upload/v1794633775/q3wjlaapcf0bijqgw6k5.jpg",
        label: "Side Profile & Wheels",
      },
      {
        url: "https://res.cloudinary.com/dphfdfqah/image/upload/v1794633776/cdm9p8ndsep7lx7by3kw.jpg",
        label: "Rear Door & Tail Lights",
      },
    ],
  },
];

export default function SponsoredCarBanner({
  className = "",
  sourceContext = "product_page",
}: SponsoredCarBannerProps) {
  const [activeDealIdx, setActiveDealIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const deal = SPONSORED_DEALS[activeDealIdx];

  const handleTabChange = (idx: number) => {
    setActiveDealIdx(idx);
    setSelectedImage(0);
    setShowVideoModal(false);
  };

  return (
    <div
      className={`w-full relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white shadow-xl ${className}`}
    >
      {/* Decorative gradient glow accents */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Top Header & Deal Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 px-4 py-3 sm:px-6 bg-neutral-900/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-sm">
            <Sparkles className="h-3.5 w-3.5 fill-black" />
            Sponsored Deals
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800/80 px-2.5 py-1 text-[11px] font-medium text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Verified Listings
          </span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-neutral-950/80 p-1 rounded-xl border border-neutral-800">
          {SPONSORED_DEALS.map((d, idx) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleTabChange(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeDealIdx === idx
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {d.tabLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Image Gallery & Video Trigger (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 group">
            <Image
              src={deal.images[selectedImage]?.url || deal.images[0].url}
              alt={deal.images[selectedImage]?.label || deal.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

            {/* Image caption badge */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md font-medium border border-white/10 truncate max-w-[200px]">
                {deal.images[selectedImage]?.label || deal.title}
              </span>

              {/* Video button if available */}
              {deal.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md transition-all active:scale-95"
                >
                  <Play className="h-3 w-3 fill-white" />
                  <span>Play Video Tour</span>
                </button>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {deal.images.map((img, idx) => (
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
                {deal.title}
              </h2>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-neutral-400 block">
                  {deal.priceSubtext}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                  {deal.price}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {deal.description}
            </p>
          </div>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {deal.specs.map((s, idx) => {
              const IconComp = s.icon;
              return (
                <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-center">
                  <IconComp className={`mx-auto h-4 w-4 ${s.color} mb-1`} />
                  <div className="text-[10px] uppercase text-neutral-400">{s.label}</div>
                  <div className="text-xs sm:text-sm font-bold text-white truncate">{s.value}</div>
                </div>
              );
            })}
          </div>

          {/* Highlights checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
            {deal.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Contact Seller & CTAs */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 text-neutral-950 font-black flex items-center justify-center text-sm shadow-md">
                {deal.sellerName[0]}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block">Seller: {deal.sellerName}</span>
                <span className="text-neutral-400 text-[11px]">
                  {deal.sellerSubtext}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* WhatsApp CTA */}
              <a
                href={deal.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>WhatsApp</span>
              </a>

              {/* Call CTA */}
              <a
                href={`tel:${deal.sellerPhone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2.5 text-xs font-semibold text-neutral-200 transition-all active:scale-95"
                title={`Call ${deal.sellerPhoneFormatted}`}
              >
                <Phone className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">{deal.sellerPhoneFormatted}</span>
                <span className="sm:hidden">Call</span>
              </a>

              {/* View Full Listing */}
              <Link
                href={`/cars/${deal.slug}`}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-black text-neutral-950 shadow-md transition-all active:scale-95"
              >
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal if open */}
      {showVideoModal && deal.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Play className="h-4 w-4 text-rose-500 fill-rose-500" />
                <span>{deal.title} — Walkaround Video Tour</span>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-2 sm:p-4">
              <video
                src={deal.videoUrl}
                poster={deal.videoPoster || undefined}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[70vh] rounded-xl bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
