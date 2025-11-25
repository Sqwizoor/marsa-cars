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
        className="block text-center rounded-md bg-gradient-to-r from-orange-primary to-orange-hover text-white px-3 py-2 text-xs font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 mb-2 shadow-md"
      >
        Subscribe Now
      </Link>
    );
  }

  const isTrial = subscription.phase === "TRIAL";
  const remaining = subscription.remainingAds === -1 ? "∞" : subscription.remainingAds;

  let infoText = `${remaining} ads left`;

  if (isTrial && subscription.expiresAt) {
    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    infoText = `${diffDays} days left`;
  }

  return (
    <Link
      href="/dashboard/advertiser/manage"
      className="block text-center rounded-md bg-gradient-to-r from-orange-primary to-orange-hover text-white px-3 py-2 text-xs font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 mb-2 shadow-md"
    >
      <div className="flex items-center justify-center gap-2">
        <span className="uppercase tracking-wider">{isTrial ? "Trial" : subscription.tier}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm">
          {infoText}
        </span>
      </div>
    </Link>
  );
}
