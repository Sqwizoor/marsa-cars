"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UnifiedShipmentTracking } from "@/lib/bobgo/types";
import BobGoTrackingCard from "./bobgo-tracking-card";
import { ExternalLink, Loader2, Truck } from "lucide-react";

export default function GroupTrackingSection({
  orderGroupId,
  orderId,
}: {
  orderGroupId: string;
  orderId: string;
}) {
  const [tracking, setTracking] = useState<UnifiedShipmentTracking | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showWidget, setShowWidget] = useState(false);

  const loadTracking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipping/tracking?q=${encodeURIComponent(orderGroupId)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setTracking(data.results[0]);
          // Auto-expand if an actual Bob Go tracking reference is attached
          if (data.results[0].source !== "order_status") {
            setShowWidget(true);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load group Bob Go tracking:", err);
    } finally {
      setLoading(false);
    }
  }, [orderGroupId]);

  useEffect(() => {
    void loadTracking();
  }, [loadTracking]);

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-slate-50/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                Bob Go Order Tracking
              </span>
              {tracking && tracking.source !== "order_status" && (
                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  {tracking.trackingReference}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {loading
                ? "Checking Bob Go courier status..."
                : tracking
                  ? `${tracking.courierName || "Bob Go"} • ${tracking.statusFriendly}`
                  : "Track parcel fulfillment & courier scans"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWidget((prev) => !prev)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{showWidget ? "Hide Timeline" : "Live Timeline"}</span>
          </button>

          <Link
            href={
              tracking && tracking.source !== "order_status"
                ? `/track-order?ref=${encodeURIComponent(tracking.trackingReference)}`
                : `/track-order?orderId=${encodeURIComponent(orderId)}`
            }
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            <span>Track Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {showWidget && tracking && (
        <div className="mt-4">
          <BobGoTrackingCard
            tracking={tracking}
            onRefresh={loadTracking}
            refreshing={loading}
            defaultExpanded={true}
          />
        </div>
      )}
    </div>
  );
}
