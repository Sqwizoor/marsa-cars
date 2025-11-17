import { getPayFastBaseUrl, getPayFastConfig, getPayFastValidateUrl } from "./config";
import { generateSignature } from "./signature";
import { PayFastITN, PayFastPaymentRequest } from "./types";

export function buildRedirectUrl(data: Omit<PayFastPaymentRequest, "signature">) {
  const cfg = getPayFastConfig();

  // 1. Clean the data to remove any empty/null values before signing
  const cleanData: any = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanData[key] = value;
    }
  });

  // 2. Generate signature from raw values (signature helper will encode appropriately)
  const signature = generateSignature(cleanData as PayFastPaymentRequest, cfg.passphrase);

  // 3. Build final query string preserving insertion order and using same encoding style
  const encode = (v: string) => encodeURIComponent(v).replace(/%20/g, "+");
  const parts: string[] = [];
  for (const key of Object.keys(cleanData)) {
    const val = String(cleanData[key]);
    parts.push(`${key}=${encode(val)}`);
  }
  parts.push(`signature=${signature}`);

  const qs = parts.join("&");
  const url = `${getPayFastBaseUrl(cfg.mode)}/eng/process?${qs}`;

  // Log for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("PayFast Final Redirect URL:", url);
    console.log("PayFast Query String (pre-encoded):", qs);
  }

  return url;
}

export async function validateITNWithPayFast(originalBody: string) {
  const cfg = getPayFastConfig();
  const res = await fetch(getPayFastValidateUrl(cfg.mode), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: originalBody,
  });
  const text = await res.text();
  return text.trim().toUpperCase() === "VALID";
}

export function verifyITNSignature(itn: Record<string, any>): boolean {
  const { getPayFastConfig } = require("./config");
  const cfg = getPayFastConfig();
  // Ensure we don't include the signature field when calculating
  const clone: Record<string, any> = {};
  for (const key of Object.keys(itn)) {
    if (key === "signature") continue;
    clone[key] = itn[key];
  }
  const receivedSig = (itn.signature || "").toLowerCase();
  const calcSig = generateSignature(clone, cfg.passphrase).toLowerCase();
  return receivedSig === calcSig;
}

export function isFromPayFast(ip: string | null): boolean {
  // Basic allowlist per docs (can be expanded with DNS checks). Keep lenient in sandbox.
  // PayFast publishes IP ranges; here we just check common prefixes.
  if (!ip) return false;
  const allowPrefixes = ["196.33.", "41.74.", "41.79.", "197.97."]; // Not exhaustive
  return allowPrefixes.some((p) => ip.startsWith(p));
}
