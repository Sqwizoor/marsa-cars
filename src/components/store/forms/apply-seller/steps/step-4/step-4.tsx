"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedContainer from "../../animated-container";
import {
  getSubscriptionPlanByTier,
  type SubscriptionPlanTier,
} from "@/constants/subscription-plans";
import type { StoreType } from "@/lib/types";

export default function Step4({
  selectedPlan,
  formData,
}: {
  selectedPlan: SubscriptionPlanTier | null;
  formData: StoreType;
}) {
  const plan = getSubscriptionPlanByTier(selectedPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/payments/payfast/trial-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store: formData }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start trial payment");
      }
      const data = await res.json();
      if (!data.redirect) {
        throw new Error("Missing redirect URL from server");
      }
      window.location.href = data.redirect;
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatedContainer>
        <div className="h-full w-full bg-white rounded-2xl p-8 flex items-center justify-center shadow-sm border border-slate-200">
          <div className="max-w-xl w-full space-y-8 text-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Seller onboarding
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
                  Kick-start your store trial
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Pay a once-off <span className="font-semibold text-emerald-600">R10</span> to
                  activate your seller trial and unlock advertising.
                </p>
              </div>
              <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-lg font-semibold text-emerald-600">
                  R10
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">
                Store preview
              </p>
              <p className="text-base font-semibold text-slate-900">
                {formData.name || "Your awesome store"}
              </p>
              <p className="text-xs text-slate-500">
                {formData.url ? `${formData.url}.marsa.cars` : "Custom URL not set"}
              </p>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                {formData.description ||
                  "Sell your cars, parts and accessories with a modern, trusted storefront."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">
                  Trial fee
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-600">
                  R10
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    once-off
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Helps keep the marketplace free from spam stores.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">
                  Plan
                </p>
                {plan ? (
                  <>
                    <p className="mt-1 text-lg font-semibold">{plan.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      You can upgrade or change plans any time.
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">
                    No plan selected yet. You can pick one later.
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/60 bg-red-50 px-4 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartTrial}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Redirecting to PayFast..." : "Start R10 trial with PayFast"}
              </button>
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Skip for now  Ill finish later
              </Link>
            </div>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}
