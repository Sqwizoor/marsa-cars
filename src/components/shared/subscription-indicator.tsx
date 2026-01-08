"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SubscriptionResponse {
  subscription: {
    id: string;
    tier: string;
    status: string;
    adLimit: number;
    adsUsed: number;
    remainingAds?: number;
    endDate?: string | null;
    trialEndsAt?: string | null;
    expiresAt?: string | null;
    phase?: "TRIAL" | "PAID";
  } | null;
}

export default function SubscriptionIndicator() {
  const [data, setData] = useState<SubscriptionResponse["subscription"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchSub() {
      try {
        const res = await fetch("/api/subscriptions/current", { cache: "no-store" });
        const json = await res.json();
        if (active) setData(json.subscription || null);
      } catch (e: any) {
        if (active) setError("Failed");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchSub();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="hidden lg:flex items-center gap-1 text-xs text-white/70 animate-pulse">
        <span>Subscription...</span>
      </div>
    );
  }
  if (error || !data) {
    return (
      <Link
        href="/subscriptions"
        className="hidden lg:inline-flex items-center gap-2 rounded-full bg-yellow-500/20 text-yellow-100 px-3 py-1 text-xs font-semibold hover:bg-yellow-500/30 transition"
        title="No active ads plan"
      >
        <span>No Ads Plan</span>
      </Link>
    );
  }

  const remaining = data.remainingAds ?? (data.adLimit === -1 ? -1 : data.adLimit - data.adsUsed);
  const expiresAt = data.expiresAt || data.trialEndsAt || data.endDate;
  const isTrial = data.phase === "TRIAL" || data.status === "TRIALING";
  const expired = expiresAt ? new Date() > new Date(expiresAt) : false;
  const expiryLabel = expiresAt ? new Date(expiresAt).toLocaleDateString() : null;

  // Calculate days left
  let daysLeft = null;
  if (expiresAt) {
    const now = new Date();
    const end = new Date(expiresAt);
    const diffTime = end.getTime() - now.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <Link
      href="/dashboard/advertiser/manage"
      className="hidden lg:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/80 to-purple-600/80 px-3 py-1 text-xs font-semibold text-white shadow hover:from-indigo-500 hover:to-purple-600 transition"
      title="View subscription details"
    >
      <span>{data.tier}</span>
      <span className="rounded bg-white/20 px-2 py-0.5">
        {remaining === -1 ? "∞" : `${remaining} left`}
      </span>
      {/* show renewal info for paid plans only */}
      {!isTrial && expiryLabel && (
        <span className="text-white/70">Renews {expiryLabel}</span>
      )}
      {expired && (
        <span className="text-red-300 font-medium">Expired</span>
      )}
    </Link>
  );
}
