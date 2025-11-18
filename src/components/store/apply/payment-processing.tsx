"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentProcessing() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Verifying Payment
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We are confirming your payment with PayFast. This usually takes a few seconds.
          The page will refresh automatically.
        </p>
      </div>
    </div>
  );
}
