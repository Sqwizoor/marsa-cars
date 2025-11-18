"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PaymentProcessing() {
  const router = useRouter();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    // Show manual button after 5 seconds if still stuck
    const timeout = setTimeout(() => {
      setShowManual(true);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/payments/payfast/simulate-trial-success", {
        method: "POST",
      });
      
      if (res.ok) {
        toast({
          title: "Success",
          description: "Payment verified manually. Refreshing...",
        });
        router.refresh();
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to verify payment manually",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

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

        {showManual && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3">
              Taking longer than expected? If you have completed the payment:
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualCheck}
              disabled={isChecking}
            >
              {isChecking ? "Verifying..." : "I have completed the payment"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
