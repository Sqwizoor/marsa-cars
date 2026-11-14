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

export default function RecentPurchasePopup() {
  const pathname = usePathname();
  const [items, setItems] = useState<RecentPurchaseNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Fetch recent real purchases once per session mount
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

  // Manage timed show / hide cycle
  useEffect(() => {
    if (dismissed || shouldHideOnRoute || items.length === 0 || isPaused) {
      return;
    }

    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
    }

    if (visible) {
      // Auto-hide after 6.5 seconds
      cycleTimerRef.current = setTimeout(() => {
        setVisible(false);
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 6500);
    } else {
      // Initial delay 5.5s, subsequent interval 14s
      const delay = currentIndex === 0 ? 5500 : 14000;
      cycleTimerRef.current = setTimeout(() => {
        setVisible(true);
      }, delay);
    }

    return () => {
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
      }
    };
  }, [visible, dismissed, shouldHideOnRoute, items.length, currentIndex, isPaused]);

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

  if (dismissed || shouldHideOnRoute || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

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
