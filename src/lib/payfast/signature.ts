import crypto from "crypto";
import { PayFastPaymentRequest } from "./types";

/**
 * Build the parameter string PayFast expects when generating a signature (HTML form spec).
 * - Preserve the insertion order of keys provided
 * - Remove empty / null / undefined values
 * - Exclude the `signature` field
 * - Include `merchant_key` (PayFast form spec includes all non-blank fields)
 * - URL-encode values, replace spaces with '+'
 * - Append passphrase (if provided) using the same encoding
 */
export function buildSignatureString(
  params: PayFastPaymentRequest | Record<string, unknown>,
  passphrase?: string
): string {
  const record = params as Record<string, unknown>;

  const encode = (v: string) => encodeURIComponent(v).replace(/%20/g, "+");

  const parts: string[] = [];
  for (const key of Object.keys(record)) {
    if (key === "signature") continue;
    const raw = record[key];
    if (raw === undefined || raw === null || raw === "") continue;
    const val = String(raw).trim();
    parts.push(`${key}=${encode(val)}`);
  }

  if (passphrase && passphrase.trim() !== "") {
    parts.push(`passphrase=${encode(passphrase.trim())}`);
  }

  return parts.join("&");
}

// Backwards compatibility: some modules still import buildParameterString
// Use the new implementation under the hood.
export const buildParameterString = buildSignatureString;

export function generateSignature(
  params: PayFastPaymentRequest | Record<string, unknown>,
  passphrase?: string
): string {
  const signatureString = buildSignatureString(params, passphrase);

  if (process.env.NODE_ENV === "development") {
    console.log("=== PayFast Signature Generation ===");
    console.log("Input params:", JSON.stringify(params, null, 2));
    console.log("Passphrase:", passphrase ? `[${passphrase.length} chars]` : "[NONE]");
    console.log("Signature String:", signatureString);
  }

  const signature = crypto.createHash("md5").update(signatureString).digest("hex");

  if (process.env.NODE_ENV === "development") {
    console.log("Generated Signature:", signature);
    console.log("====================================");
  }

  return signature;
}

export function appendSignature(
  request: PayFastPaymentRequest,
  passphrase?: string
): PayFastPaymentRequest {
  const signature = generateSignature(request, passphrase);
  return { ...request, signature };
}
