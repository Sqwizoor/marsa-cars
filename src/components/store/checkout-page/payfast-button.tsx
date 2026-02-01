"use client";
import { useState } from "react";
import { Button } from "@/components/store/ui/button";
import toast from "react-hot-toast";

interface Props {
  cartId: string;
  shippingAddressId: string;
  shippingFee?: number;
  shippingService?: string;
  disabled?: boolean;
}

export default function PayFastButton({ cartId, shippingAddressId, shippingFee, shippingService, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  
  const handlePayNow = async () => {
    // Validate address is selected
    if (!shippingAddressId || disabled) {
      toast.error("Please select a shipping address first");
      return;
    }
    
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
      if (!initRes.ok) throw new Error("Failed to initiate payment");
      const data = await initRes.json();
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        toast.error("No redirect URL returned");
      }
    } catch (e: any) {
      toast.error(e.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      disabled={loading} 
      onClick={handlePayNow} 
      className={`w-full ${disabled ? 'opacity-60' : ''}`}
    >
      {loading ? "Processing..." : "Pay Now"}
    </Button>
  );
}
