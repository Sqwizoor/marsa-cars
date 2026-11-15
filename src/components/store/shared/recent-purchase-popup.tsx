"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import type { RecentPurchaseNotification } from "@/app/api/recent-purchases/route";

const HIDDEN_ROUTE_PREFIXES = [
  "/checkout",
  "/cart",
  "/sign-in",
  "/sign-up",
  "/dashboard",
  "/seller",
  "/admin",
];

const SESSION_DISMISS_KEY = "recentPurchasePopupDismissed";
const SEEN_BUYERS_24H_KEY = "recentPurchaseSeenBuyers_24h";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Diverse pool of Zulu, Xhosa, Sotho/Tswana/Pedi, and broader African buyer profiles
const AFRICAN_BUYER_POOL: Array<{ buyerName: string; city: string }> = [
  // Zulu
  { buyerName: "Sipho N.", city: "Durban" },
  { buyerName: "Thabo M.", city: "Johannesburg" },
  { buyerName: "Bongani K.", city: "Pietermaritzburg" },
  { buyerName: "Sibusiso D.", city: "Sandton" },
  { buyerName: "Zanele N.", city: "Umhlanga" },
  { buyerName: "Mandla Z.", city: "Richards Bay" },
  { buyerName: "Nomvula S.", city: "Midrand" },
  { buyerName: "Lungile B.", city: "Durban" },
  { buyerName: "Ayanda N.", city: "Centurion" },
  { buyerName: "Sandile M.", city: "Randburg" },
  { buyerName: "Nonhle Z.", city: "Ballito" },
  { buyerName: "Vusi N.", city: "Newcastle" },
  { buyerName: "Nokuthula G.", city: "Pinetown" },
  { buyerName: "Siyabonga M.", city: "Roodepoort" },
  { buyerName: "Nkosinathi C.", city: "Fourways" },
  { buyerName: "Philani H.", city: "Amanzimtoti" },
  { buyerName: "Thulisile M.", city: "Empangeni" },
  { buyerName: "Mthunzi S.", city: "Hillcrest" },
  { buyerName: "Nkosazana D.", city: "Westville" },
  { buyerName: "Bheki M.", city: "Krugersdorp" },
  // Xhosa
  { buyerName: "Lunga M.", city: "Cape Town" },
  { buyerName: "Siyanda N.", city: "Gqeberha" },
  { buyerName: "Thandiwe M.", city: "East London" },
  { buyerName: "Zolani K.", city: "Bellville" },
  { buyerName: "Buhle D.", city: "Somerset West" },
  { buyerName: "Andile N.", city: "Johannesburg" },
  { buyerName: "Nolwazi M.", city: "George" },
  { buyerName: "Lukhanyo S.", city: "Mthatha" },
  { buyerName: "Unathi X.", city: "Century City" },
  { buyerName: "Khaya M.", city: "Gqeberha" },
  { buyerName: "Zikhona G.", city: "Durbanville" },
  { buyerName: "Anele M.", city: "Midrand" },
  { buyerName: "Babalwa T.", city: "Pretoria" },
  { buyerName: "Lwazi M.", city: "Stellenbosch" },
  { buyerName: "Sinethemba M.", city: "East London" },
  { buyerName: "Asavela N.", city: "Claremont" },
  { buyerName: "Mihlali Q.", city: "Paarl" },
  { buyerName: "Nandipha T.", city: "Brackenfell" },
  { buyerName: "Odwa K.", city: "Makhanda" },
  { buyerName: "Yanga M.", city: "Komani" },
  // Sotho / Tswana / Pedi
  { buyerName: "Tshepo M.", city: "Pretoria" },
  { buyerName: "Lerato M.", city: "Bloemfontein" },
  { buyerName: "Karabo N.", city: "Polokwane" },
  { buyerName: "Kagiso M.", city: "Rustenburg" },
  { buyerName: "Palesa S.", city: "Soweto" },
  { buyerName: "Mpho L.", city: "Centurion" },
  { buyerName: "Thato K.", city: "Midrand" },
  { buyerName: "Tebogo M.", city: "Alberton" },
  { buyerName: "Refilwe M.", city: "Kempton Park" },
  { buyerName: "Lesedi P.", city: "Boksburg" },
  { buyerName: "Boitumelo M.", city: "Witbank" },
  { buyerName: "Katlego R.", city: "Polokwane" },
  { buyerName: "Kabelo T.", city: "Potchefstroom" },
  { buyerName: "Tumelo S.", city: "Vereeniging" },
  { buyerName: "Thapelo M.", city: "Nelspruit" },
  { buyerName: "Rethabile M.", city: "Benoni" },
  { buyerName: "Olebogeng K.", city: "Klerksdorp" },
  { buyerName: "Dineo M.", city: "Vanderbijlpark" },
  { buyerName: "Keaobaka S.", city: "Mahikeng" },
  { buyerName: "Neo M.", city: "Montana" },
  // Broader African
  { buyerName: "Tendai M.", city: "Johannesburg" },
  { buyerName: "Chipo N.", city: "Sandton" },
  { buyerName: "Tatenda M.", city: "Pretoria" },
  { buyerName: "Farai C.", city: "Midrand" },
  { buyerName: "Tinashe S.", city: "Randburg" },
  { buyerName: "Tariro C.", city: "Centurion" },
  { buyerName: "Jabulani C.", city: "Nelspruit" },
  { buyerName: "Naledi K.", city: "Fourways" },
  { buyerName: "Simba N.", city: "Edenvale" },
  { buyerName: "Tafadzwa G.", city: "Bedfordview" },
  { buyerName: "Kudzai M.", city: "Bryanston" },
  { buyerName: "Rudo N.", city: "Sunninghill" },
  { buyerName: "Nomsa D.", city: "Mbombela" },
  { buyerName: "Themba M.", city: "Germiston" },
  { buyerName: "Mbali N.", city: "waterfall" },
  { buyerName: "Sello M.", city: "Silver Lakes" },
];

const REALISTIC_TIME_LABELS = [
  "11 mins ago",
  "19 mins ago",
  "28 mins ago",
  "37 mins ago",
  "49 mins ago",
  "1h ago",
  "2h ago",
  "3h ago",
  "Earlier today",
];

function getSeenBuyers24h(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SEEN_BUYERS_24H_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    const now = Date.now();
    const pruned: Record<string, number> = {};
    for (const [name, ts] of Object.entries(parsed)) {
      if (typeof ts === "number" && now - ts < TWENTY_FOUR_HOURS_MS) {
        pruned[name] = ts;
      }
    }
    localStorage.setItem(SEEN_BUYERS_24H_KEY, JSON.stringify(pruned));
    return pruned;
  } catch {
    return {};
  }
}

function markBuyerSeen24h(buyerName: string) {
  if (typeof window === "undefined") return;
  try {
    const seen = getSeenBuyers24h();
    seen[buyerName] = Date.now();
    localStorage.setItem(SEEN_BUYERS_24H_KEY, JSON.stringify(seen));
  } catch {
    // Ignore storage errors
  }
}

export default function RecentPurchasePopup() {
  const pathname = usePathname();
  const [items, setItems] = useState<RecentPurchaseNotification[]>([]);
  const [currentItem, setCurrentItem] =
    useState<RecentPurchaseNotification | null>(null);
  const [shownCount, setShownCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productIndexRef = useRef(0);

  const shouldHideOnRoute = HIDDEN_ROUTE_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  // Restore session dismissal preference
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_DISMISS_KEY) === "true") {
        setDismissed(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch store products / recent purchases once per session mount
  useEffect(() => {
    if (dismissed || shouldHideOnRoute || items.length > 0) return;

    let cancelled = false;
    fetch("/api/recent-purchases")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.items) && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {
        // Fail silently so storefront experience is unaffected
      });

    return () => {
      cancelled = true;
    };
  }, [dismissed, shouldHideOnRoute, items.length]);

  // Manage timed show / hide cycle with natural, trustworthy spacing
  useEffect(() => {
    if (dismissed || shouldHideOnRoute || items.length === 0 || isPaused) {
      return;
    }

    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
    }

    if (visible) {
      // Keep card visible for 6.5 seconds
      cycleTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, 6500);
    } else {
      // First card after 14–20s; subsequent cards spaced 45–80s apart so it feels organic & trustworthy
      const delay =
        shownCount === 0
          ? 14000 + Math.floor(Math.random() * 6000)
          : 45000 + Math.floor(Math.random() * 35000);

      cycleTimerRef.current = setTimeout(() => {
        const seen = getSeenBuyers24h();
        const availableProfiles = AFRICAN_BUYER_POOL.filter(
          (p) => !seen[p.buyerName]
        );

        // If every single name in the pool has been shown in the last 24h, stop showing for today
        if (availableProfiles.length === 0) {
          return;
        }

        const chosenProfile =
          availableProfiles[
            Math.floor(Math.random() * availableProfiles.length)
          ];
        const baseProduct = items[productIndexRef.current % items.length];
        productIndexRef.current += 1;

        const timeLabel =
          REALISTIC_TIME_LABELS[
            Math.floor(Math.random() * REALISTIC_TIME_LABELS.length)
          ];

        const nextNotification: RecentPurchaseNotification = {
          ...baseProduct,
          buyerName: chosenProfile.buyerName,
          city:
            chosenProfile.city.charAt(0).toUpperCase() +
            chosenProfile.city.slice(1),
          timeLabel,
        };

        markBuyerSeen24h(chosenProfile.buyerName);
        setCurrentItem(nextNotification);
        setShownCount((prev) => prev + 1);
        setVisible(true);
      }, delay);
    }

    return () => {
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
      }
    };
  }, [visible, dismissed, shouldHideOnRoute, items, shownCount, isPaused]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  };

  if (dismissed || shouldHideOnRoute || !currentItem) {
    return null;
  }

  const formattedPrice = `R${Math.round(currentItem.price).toLocaleString("en-ZA")}`;

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-3 left-3 right-3 sm:right-auto sm:bottom-5 sm:left-5 z-40 pointer-events-none flex justify-center sm:justify-start transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative w-full max-w-[350px] sm:w-[344px] rounded-2xl border border-gray-200/90 bg-white/95 backdrop-blur-md shadow-[0_14px_34px_-10px_rgba(15,23,42,0.22)] p-2.5 sm:p-3 transition-transform hover:scale-[1.01] ${
          visible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close recent purchase notification"
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <Link
          href={`/product/${currentItem.productSlug}/${currentItem.variantSlug}`}
          className="flex items-center gap-3 pr-5 group"
        >
          {/* Product Thumbnail */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentItem.image}
              alt={currentItem.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white">
              <ShoppingBag className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* Purchase Details */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="truncate">
                {currentItem.buyerName} in {currentItem.city}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] font-bold text-main-primary line-clamp-1 group-hover:text-orange-hover transition-colors">
              Purchased {currentItem.productName}
            </p>

            <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 pt-0.5">
              <span className="inline-flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{currentItem.timeLabel}</span>
              </span>
              <span className="font-bold text-orange-primary shrink-0">
                {formattedPrice}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
