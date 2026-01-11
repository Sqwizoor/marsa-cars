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
    return null;
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

  /* const isTrial = subscription.phase === "TRIAL"; */
  const remaining = subscription.remainingAds === -1 ? "∞" : subscription.remainingAds;

  let infoText = `${remaining} ads left`;

  return (
    <div className="block text-center rounded-md bg-gradient-to-r from-orange-primary to-orange-hover text-white px-3 py-2 text-xs font-bold mb-2 shadow-md">
      <div className="flex items-center justify-center gap-2">
        <span className="uppercase tracking-wider">{subscription.tier}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm">
          {infoText}
        </span>
      </div>
    </div>
  );
}
