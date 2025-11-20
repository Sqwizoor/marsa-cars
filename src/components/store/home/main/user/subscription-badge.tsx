"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SubscriptionBadge() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSub() {
      try {
        const res = await fetch("/api/subscriptions/current", { cache: "no-store" });
        const json = await res.json();
        setSubscription(json.subscription || null);
      } catch (e) {
        console.error("Failed to fetch subscription", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSub();
  }, []);

  if (loading) {
    return (
      <div className="text-xs text-gray-500 text-center py-1 animate-pulse">
        Loading...
      </div>
    );
  }

  if (!subscription) {
    return (
      <Link
        href="/subscriptions"
        className="block text-center rounded-md bg-yellow-50 text-yellow-700 px-3 py-2 text-xs font-semibold hover:bg-yellow-100 transition mb-2"
      >
        No Active Plan
      </Link>
    );
  }

  const isTrial = subscription.phase === "TRIAL";
  const remaining = subscription.remainingAds === -1 ? "∞" : subscription.remainingAds;

  return (
    <Link
      href="/dashboard/advertiser/manage"
      className="block text-center rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 text-xs font-semibold hover:from-indigo-600 hover:to-purple-700 transition mb-2"
    >
      <div className="flex items-center justify-center gap-2">
        <span>{isTrial ? "Trial" : subscription.tier}</span>
        <span className="rounded bg-white/20 px-2 py-0.5">
          {remaining} left
        </span>
      </div>
    </Link>
  );
}
