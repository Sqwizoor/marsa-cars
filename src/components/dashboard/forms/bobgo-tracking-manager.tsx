"use client";

import React, { useCallback, useEffect, useState } from "react";
import { UnifiedShipmentTracking } from "@/lib/bobgo/types";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Save,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

const SA_COURIERS = [
  "The Courier Guy",
  "Bob Box",
  "Dawn Wing (DPD Laser)",
  "RAM Hand-to-Hand",
  "Fastway Couriers",
  "Internet Express",
  "Aramex South Africa",
  "Skynet Worldwide Express",
  "Other (Bob Go)",
];

interface BobGoTrackingManagerProps {
  storeId: string;
  orderGroupId: string;
  currentShippingService?: string;
}

export default function BobGoTrackingManager({
  storeId,
  orderGroupId,
  currentShippingService,
}: BobGoTrackingManagerProps) {
  const [existing, setExisting] = useState<UnifiedShipmentTracking | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [trackingReference, setTrackingReference] = useState("");
  const [providerTrackingReference, setProviderTrackingReference] =
    useState("");
  const [courierName, setCourierName] = useState(
    currentShippingService || "The Courier Guy"
  );
  const [serviceLevel, setServiceLevel] = useState("");
  const [markAsShipped, setMarkAsShipped] = useState(true);

  const fetchCurrentTracking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipping/tracking?groupId=${encodeURIComponent(orderGroupId)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const found: UnifiedShipmentTracking | undefined = data.results?.[0];
        if (found) {
          setExisting(found);
          setTrackingReference(found.trackingReference || "");
          setProviderTrackingReference(found.providerTrackingReference || "");
          if (found.courierName) setCourierName(found.courierName);
          if (found.serviceLevel) setServiceLevel(found.serviceLevel);
        }
      }
    } catch (err) {
      console.error("Error loading group tracking:", err);
    } finally {
      setLoading(false);
    }
  }, [orderGroupId]);

  useEffect(() => {
    void fetchCurrentTracking();
  }, [fetchCurrentTracking]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingReference.trim()) {
      toast.error("Please enter a Bob Go tracking reference.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/shipping/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          orderGroupId,
          trackingReference: trackingReference.trim(),
          providerTrackingReference:
            providerTrackingReference.trim() || undefined,
          courierName: courierName.trim() || undefined,
          serviceLevel: serviceLevel.trim() || undefined,
          markAsShipped,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save tracking details");
      }

      toast.success(
        data.liveFound
          ? `Synced live Bob Go status: ${data.statusFriendly}`
          : "Bob Go tracking reference saved!"
      );
      await fetchCurrentTracking();
    } catch (err: any) {
      toast.error(err?.message || "Could not save Bob Go tracking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 my-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Bob Go Shipment & Tracking
            </h4>
            <p className="text-xs text-slate-500">
              Attach a Bob Go tracking reference so the buyer can track live courier scans
            </p>
          </div>
        </div>

        {existing && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {existing.statusFriendly}
            </span>
            <button
              type="button"
              onClick={fetchCurrentTracking}
              disabled={loading}
              title="Refresh from Bob Go"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            {existing.trackingUrl && (
              <a
                href={existing.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <span>Bob Go</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bob Go Tracking Reference *
            </label>
            <input
              type="text"
              value={trackingReference}
              onChange={(e) => setTrackingReference(e.target.value)}
              placeholder="e.g. UASDRW78"
              className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Courier Waybill (Optional)
            </label>
            <input
              type="text"
              value={providerTrackingReference}
              onChange={(e) => setProviderTrackingReference(e.target.value)}
              placeholder="e.g. TCG-123456"
              className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Courier Partner
            </label>
            <select
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SA_COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Level (Optional)
            </label>
            <input
              type="text"
              value={serviceLevel}
              onChange={(e) => setServiceLevel(e.target.value)}
              placeholder="e.g. Economy / Overnight"
              className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={markAsShipped}
              onChange={(e) => setMarkAsShipped(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Sync order status & mark as Shipped</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{existing ? "Update & Sync Bob Go" : "Save & Sync Bob Go"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
