// Stripe related query/mutation helpers
// These functions were imported in payment components but the file was missing,
// causing module resolution build errors. Implement minimal versions here.
// Adjust the endpoints and payload shapes as needed to match your backend API.

// Using fetch to avoid external dependency on axios

export interface CreatePaymentIntentParams {
  amount: number; // in smallest currency unit (e.g. cents)
  currency: string;
  customerId?: string;
  metadata?: Record<string, string | number>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  id: string;
}

export async function createStripePaymentIntent(
  params: CreatePaymentIntentParams
): Promise<CreatePaymentIntentResponse> {
  const res = await fetch("/api/payments/stripe/payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to create payment intent: ${res.status}`);
  }
  return (await res.json()) as CreatePaymentIntentResponse;
}

export interface CreateStripePaymentParams {
  orderId: string;
  paymentIntentId: string;
}

export interface CreateStripePaymentResponse {
  success: boolean;
  orderId: string;
}

export async function createStripePayment(
  params: CreateStripePaymentParams
): Promise<CreateStripePaymentResponse> {
  const res = await fetch("/api/payments/stripe/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to confirm payment: ${res.status}`);
  }
  return (await res.json()) as CreateStripePaymentResponse;
}

// Optional: utility to format amounts for display (can be reused elsewhere)
export function formatAmount(amount: number, currency: string = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}
