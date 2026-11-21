"use client";
import { useState } from "react";
import { Button } from "@/components/store/ui/button";
import { trackMetaAddPaymentInfo } from "@/lib/meta-pixel";
import toast from "react-hot-toast";

interface Props {
  cartId: string;
  shippingAddressId: string;
  shippingFee?: number;
  shippingService?: string;
  disabled?: boolean;
}

export default function PayFastButton({
  cartId,
  shippingAddressId,
  shippingFee,
  shippingService,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePayNow = async () => {
    // Validate address is selected
    if (!shippingAddressId) {
      toast.error("Please add or select a shipping address first");
      return;
    }

    if (disabled) {
      toast.error("Please wait for shipping options to calculate or select an option");
      return;
    }

    try {
      setLoading(true);
      // Step 1: Create order
      const orderRes = await fetch("/api/payments/payfast/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          shippingAddressId,
          shippingFee,
          shippingService,
        }),
      });

      if (!orderRes.ok) {
        const errJson = await orderRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to create order");
      }
      const order = await orderRes.json();
      if (!order.orderId) throw new Error("Invalid order response");

      // Step 2: Initiate PayFast
      const initRes = await fetch("/api/payments/payfast/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });

      if (!initRes.ok) {
        const initErr = await initRes.json().catch(() => ({}));
        throw new Error(initErr.error || "Failed to initiate payment");
      }

      const data = await initRes.json();
      if (data.redirect) {
        trackMetaAddPaymentInfo({
          value: shippingFee,
          currency: "ZAR",
        });
        window.location.href = data.redirect;
      } else {
        toast.error("No redirect URL returned");
      }
    } catch (e: any) {
      console.error("Payment initiation error:", e);
      toast.error(e.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={loading}
      onClick={handlePayNow}
      className={`w-full py-3.5 sm:py-3 text-base font-bold shadow-md transition-all active:scale-[0.99] ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        "Continue to Payment"
      )}
    </Button>
  );
}
