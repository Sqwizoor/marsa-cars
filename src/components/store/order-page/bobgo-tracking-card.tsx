"use client";

import React, { useState } from "react";
import { UnifiedShipmentTracking } from "@/lib/bobgo/types";
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";

interface BobGoTrackingCardProps {
  tracking: UnifiedShipmentTracking;
  onRefresh?: () => void;
  refreshing?: boolean;
  defaultExpanded?: boolean;
}

const STEPS = [
  { key: "booked", label: "Booked", icon: Package },
  { key: "collected", label: "Collected", icon: Clock },
  { key: "in-transit", label: "In Transit", icon: Truck },
  { key: "out-for-delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getActiveStepIndex(status: string): number {
  const s = (status || "").toLowerCase().trim();
  if (s === "delivered" || s === "completed" || s === "collected-by-recipient") {
    return 4;
  }
  if (
    s === "out-for-delivery" ||
    s === "out_for_delivery" ||
    s === "ready-for-collection"
  ) {
    return 3;
  }
  if (
    s === "in-transit" ||
    s === "in_transit" ||
    s === "at-hub" ||
    s === "at-destination-hub" ||
    s === "dispatched"
  ) {
    return 2;
  }
  if (s === "collected") {
    return 1;
  }
  return 0;
}

function isExceptionStatus(status: string): boolean {
  const s = (status || "").toLowerCase();
  return (
    s.includes("cancel") ||
    s.includes("fail") ||
    s.includes("exception") ||
    s.includes("return") ||
    s.includes("hold")
  );
}

function getStatusBadgeStyle(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "delivered" || s === "completed") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (s.includes("out-for-delivery") || s.includes("in-transit") || s === "collected") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (isExceptionStatus(s)) {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function formatDateTimeZA(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BobGoTrackingCard({
  tracking,
  onRefresh,
  refreshing = false,
  defaultExpanded = true,
}: BobGoTrackingCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const activeStep = getActiveStepIndex(tracking.status);
  const hasException = isExceptionStatus(tracking.status);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tracking.trackingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                {tracking.source === "order_status"
                  ? "Order Fulfillment Tracking"
                  : "Powered by Bob Go"}
              </span>
              {tracking.storeName && (
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
                  Seller: {tracking.storeName}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="font-mono font-bold text-base sm:text-lg tracking-wide">
                {tracking.trackingReference}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy reference"
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
              tracking.status
            )}`}
          >
            {hasException ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            )}
            {tracking.statusFriendly}
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          )}

          {tracking.trackingUrl && tracking.source !== "order_status" && (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <span>Bob Go Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-sm">
        <div>
          <p className="text-xs text-slate-500">Courier & Service</p>
          <p className="font-semibold text-slate-900">
            {tracking.courierName || "Bob Go Courier"}
            {tracking.serviceLevel &&
            tracking.serviceLevel !== tracking.courierName
              ? ` • ${tracking.serviceLevel}`
              : ""}
          </p>
          {tracking.providerTrackingReference && (
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Waybill: {tracking.providerTrackingReference}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Estimated Delivery
          </p>
          <p className="font-semibold text-emerald-700">
            {tracking.estimatedDeliveryFrom || tracking.estimatedDeliveryTo ? (
              <>
                {formatDateShort(tracking.estimatedDeliveryFrom)}
                {tracking.estimatedDeliveryTo &&
                tracking.estimatedDeliveryTo !== tracking.estimatedDeliveryFrom
                  ? ` – ${formatDateShort(tracking.estimatedDeliveryTo)}`
                  : ""}
              </>
            ) : (
              "Pending courier scan"
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Last Update</p>
          <p className="font-medium text-slate-800">
            {tracking.lastCheckpointTime
              ? formatDateTimeZA(tracking.lastCheckpointTime)
              : "Awaiting first scan"}
          </p>
        </div>
      </div>

      {/* Visual Stepper */}
      {!hasException && (
        <div className="px-5 py-6 border-b border-slate-100">
          <div className="relative flex items-center justify-between">
            {/* Background track line */}
            <div className="absolute left-5 right-5 top-5 h-1 bg-slate-200 rounded-full -z-0" />
            {/* Active progress line */}
            <div
              className="absolute left-5 top-5 h-1 bg-blue-600 rounded-full transition-all duration-500 -z-0"
              style={{
                width: `calc(${(activeStep / (STEPS.length - 1)) * 100}% - 2.5rem)`,
              }}
            />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div
                  key={step.key}
                  className="relative z-10 flex flex-col items-center text-center w-1/5"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-300 text-slate-400"
                    } ${isCurrent ? "ring-4 ring-blue-100 scale-105" : ""}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-medium leading-tight ${
                      isCompleted ? "text-slate-900 font-semibold" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Checkpoints Toggle Header */}
      <div className="px-5 py-3 flex items-center justify-between bg-white">
        <span className="text-sm font-semibold text-slate-800">
          Tracking History ({tracking.checkpoints?.length || 0}{" "}
          {tracking.checkpoints?.length === 1 ? "event" : "events"})
        </span>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <span>{expanded ? "Hide details" : "Show details"}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Checkpoints Vertical Timeline */}
      {expanded && (
        <div className="px-5 pb-6 pt-2">
          {tracking.checkpoints && tracking.checkpoints.length > 0 ? (
            <ol className="relative border-s-2 border-slate-200 ms-3 space-y-5">
              {tracking.checkpoints.map((cp, index) => {
                const isLatest = index === 0;
                const locParts = [cp.location, cp.city, cp.zone]
                  .filter(Boolean)
                  .filter((v, i, arr) => arr.indexOf(v) === i);

                return (
                  <li key={`${cp.time}-${index}`} className="ms-6">
                    <span
                      className={`absolute -start-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                        isLatest ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p
                        className={`text-sm ${
                          isLatest
                            ? "font-bold text-slate-900"
                            : "font-medium text-slate-700"
                        }`}
                      >
                        {cp.message || cp.status_friendly || cp.status}
                      </p>
                      <time className="text-xs text-slate-500 shrink-0">
                        {formatDateTimeZA(cp.time)}
                      </time>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {cp.status_friendly && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {cp.status_friendly}
                        </span>
                      )}
                      {locParts.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {locParts.join(", ")}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                Shipment registered — awaiting first courier scan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tracking checkpoints from Bob Go will appear here automatically once
                the courier collects your parcel.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
