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
  
  // Try the configured mode first
  const primaryUrl = getPayFastValidateUrl(cfg.mode);
  const res = await fetch(primaryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: originalBody,
  });
  const text = await res.text();
  if (text.trim().toUpperCase() === "VALID") return true;

  // If failed, try the other mode (fallback)
  // This handles cases where env var is 'sandbox' but payment was 'live' or vice versa
  const fallbackMode = cfg.mode === "live" ? "sandbox" : "live";
  const fallbackUrl = getPayFastValidateUrl(fallbackMode);
  
  console.warn(`PayFast ITN validation failed on ${cfg.mode}, trying ${fallbackMode}...`);
  
  const resFallback = await fetch(fallbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: originalBody,
  });
  const textFallback = await resFallback.text();
  return textFallback.trim().toUpperCase() === "VALID";
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
  // PayFast server IP ranges (official)
  // Updated list from PayFast documentation
  if (!ip) return false;
  
  const PAYFAST_IP_RANGES = [
    // Primary PayFast IPs
    "197.97.145.",
    "41.74.179.",
    "41.79.173.",
    "196.33.227.",
    // Additional PayFast IPs
    "102.216.36.",
    "102.216.38.",
    "102.216.39.",
    "196.21.252.",
    "41.74.178.",
    // Sandbox IPs (for testing)
    "197.85.225.",
    "41.76.209.",
  ];
  
  return PAYFAST_IP_RANGES.some((prefix) => ip.startsWith(prefix));
}
