"use client";
import { useState } from "react";
import { Button } from "@/components/store/ui/button";
import toast from "react-hot-toast";

interface Props {
  cartId: string;
  shippingAddressId: string;
  shippingFee?: number;
  shippingService?: string;
}

export default function PayFastButton({ cartId, shippingAddressId, shippingFee, shippingService }: Props) {
  const [loading, setLoading] = useState(false);
  const handlePayFast = async () => {
    try {
      setLoading(true);
      // Step 1: Create order
      const orderRes = await fetch("/api/payments/payfast/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, shippingAddressId, shippingFee, shippingService }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();
      if (!order.orderId) throw new Error("Invalid order response");

      // Step 2: Initiate PayFast
      const initRes = await fetch("/api/payments/payfast/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      if (!initRes.ok) throw new Error("Failed to initiate PayFast payment");
      const data = await initRes.json();
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        toast.error("No redirect URL returned");
      }
    } catch (e: any) {
      toast.error(e.message || "PayFast initiation failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button disabled={loading} onClick={handlePayFast} variant="outline" className="w-full mt-2">
      {loading ? "Redirecting..." : "Pay with PayFast"}
    </Button>
  );
}
