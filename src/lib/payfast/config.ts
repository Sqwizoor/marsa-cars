import { PayFastConfig, PayFastMode } from "./types";

export function getPayFastConfig(): PayFastConfig {
  const mode: PayFastMode = process.env.PAYFAST_MODE === "live" ? "live" : "sandbox";

  const merchantId = process.env.PAYFAST_MERCHANT_ID || "";
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "";
  const passphrase = process.env.PAYFAST_PASSPHRASE || undefined;

  // These should be absolute URLs exposed to PayFast
  const returnUrl = process.env.PAYFAST_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/payfast-return`;
  const cancelUrl = process.env.PAYFAST_CANCEL_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/payfast-cancel`;
  const notifyUrl = process.env.PAYFAST_NOTIFY_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/payfast/itn`;

  if (!merchantId || !merchantKey) {
    throw new Error("Missing PAYFAST_MERCHANT_ID or PAYFAST_MERCHANT_KEY env vars");
  }

  return { mode, merchantId, merchantKey, passphrase, returnUrl, cancelUrl, notifyUrl };
}

export function getPayFastBaseUrl(mode: PayFastMode): string {
  return mode === "live"
    ? "https://www.payfast.co.za"
    : "https://sandbox.payfast.co.za";
}

export function getPayFastValidateUrl(mode: PayFastMode): string {
  return mode === "live"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate";
}
