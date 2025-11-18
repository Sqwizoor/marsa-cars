"use client";
import { useRouter } from "next/navigation";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { FormEvent, useEffect, useState } from "react";
import {
  createStripePayment,
  createStripePaymentIntent,
} from "@/queries/stripe";
export default function StripePayment({ orderId }: { orderId: string }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSecret = async () => {
      const res = await createStripePaymentIntent({
        amount: 0, // Amount should be fetched from order
        currency: "zar",
        metadata: { orderId },
      });
      if (res.clientSecret) setClientSecret(res.clientSecret);
    };
    fetchSecret();
  }, [orderId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    if (clientSecret) {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: "http://localhost:3000",
        },
        redirect: "if_required",
      });

      if (!error && paymentIntent) {
        try {
          const res = await createStripePayment({
            orderId,
            paymentIntentId: paymentIntent.id,
          });
          if (!res.success) throw new Error("Failed");
          router.refresh();
        } catch (error: unknown) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    }
    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse h-6 w-40 bg-primary/10 rounded-md" />
        <div className="animate-pulse h-10 w-full bg-primary/10 rounded-md" />
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      {clientSecret && <PaymentElement />}
      {errorMessage && (
        <div className="tetx-sm text-red-500">{errorMessage}</div>
      )}
      <button
        disabled={!stripe || loading}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
      >
        {loading ? "Processing" : "Pay"}
      </button>
    </form>
  );
}
