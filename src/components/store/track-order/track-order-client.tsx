"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UnifiedShipmentTracking } from "@/lib/bobgo/types";
import BobGoTrackingCard from "@/components/store/order-page/bobgo-tracking-card";
import {
  PackageSearch,
  Search,
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function TrackOrderClient({
  initialQuery = "",
  initialResults = [],
}: {
  initialQuery?: string;
  initialResults?: UnifiedShipmentTracking[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] =
    useState<UnifiedShipmentTracking[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);

  const performLookup = useCallback(
    async (lookupValue: string, updateUrl = true) => {
      const trimmed = lookupValue.trim();
      if (!trimmed) {
        setError("Please enter your Bob Go tracking reference or Order ID.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (updateUrl) {
          const params = new URLSearchParams(searchParams?.toString() || "");
          params.delete("ref");
          params.delete("orderId");
          params.set("q", trimmed);
          router.replace(`/track-order?${params.toString()}`, {
            scroll: false,
          });
        }

        const res = await fetch(
          `/api/shipping/tracking?q=${encodeURIComponent(trimmed)}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to look up tracking details.");
        }

        setResults(data.results || []);
        setSearchedQuery(trimmed);
      } catch (err: any) {
        setError(err?.message || "Something went wrong while tracking.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (initialQuery && initialResults.length === 0) {
      void performLookup(initialQuery, false);
    }
  }, [initialQuery, initialResults.length, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performLookup(query, true);
  };

  return (
    <div className="min-h-[75vh] bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Search Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="flex items-center gap-2 text-blue-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
            <Truck className="w-4 h-4" />
            <span>Bob Go Live Courier Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Track Your Order
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl">
            Enter your <strong className="text-white">Bob Go Tracking Reference</strong>{" "}
            (waybill number) or your <strong className="text-white">Order ID</strong> to
            view real-time South African courier scans and estimated delivery dates.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. UASDRW78 or Order ID (#a1b2c3...)"
                className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-blue-500/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 sm:h-14 px-7 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition shadow-lg shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track Parcel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-lg px-3.5 py-2">
              {error}
            </p>
          )}

          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
            <span>Signed in to your account?</span>
            <Link
              href="/profile/orders"
              className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white font-semibold transition"
            >
              <span>View & track from My Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Results Section */}
        {searchedQuery && !loading && results.length === 0 && !error && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-7 h-7 text-slate-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No shipment found for &ldquo;{searchedQuery}&rdquo;
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Double-check your Bob Go tracking reference (e.g.{" "}
              <span className="font-mono font-semibold">UASDRW78</span>) or copy
              your full Order ID from{" "}
              <Link
                href="/profile/orders"
                className="text-blue-600 font-semibold hover:underline"
              >
                My Orders
              </Link>
              . If your order was just placed, courier tracking activates as soon
              as the seller dispatches your parcel.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {results.length === 1
                  ? "Shipment Tracking Details"
                  : `Found ${results.length} Shipments for Order`}
              </h2>
              {results[0]?.orderId && (
                <Link
                  href={`/order/${results[0].orderId}`}
                  className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Order Invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {results.map((item, idx) => (
              <BobGoTrackingCard
                key={`${item.trackingReference}-${idx}`}
                tracking={item}
                onRefresh={() => performLookup(searchedQuery || query, false)}
                refreshing={loading}
                defaultExpanded={true}
              />
            ))}
          </div>
        )}

        {/* Info Cards */}
        {results.length === 0 && !searchedQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <Truck className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm">
                Multi-Courier SA Coverage
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Real-time tracking across South Africa&apos;s top couriers via Bob Go
                including The Courier Guy, Dawn Wing, RAM, DPD Laser, and Bob Box.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <Clock className="w-6 h-6 text-emerald-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm">
                Live Hub & Driver Checkpoints
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Follow every scan from parcel collection, sorting hub transit,
                out-for-delivery driver dispatch, to final delivery.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-purple-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm">
                Track by Reference or Order ID
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Use either your Bob Go waybill reference or your store Order ID to
                check fulfillment progress anytime.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
