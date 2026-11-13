import crypto from "crypto";
import {
  BobGoCreateShipmentRequest,
  BobGoOrder,
  BobGoRate,
  BobGoRateRequest,
  BobGoTrackingResponse,
} from "./types";

function getBobGoBaseUrl(): string {
  if (process.env.BOBGO_API_URL) {
    return process.env.BOBGO_API_URL.replace(/\/+$/, "");
  }
  if (process.env.BOBGO_MODE === "sandbox") {
    return "https://api.sandbox.bobgo.co.za/v2";
  }
  return "https://api.bobgo.co.za/v2";
}

function getBobGoHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (process.env.BOBGO_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.BOBGO_API_KEY}`;
  }
  return headers;
}

export const BobGoClient = {
  /**
   * Public Bob Go tracking portal URL for a given tracking reference
   */
  getPublicTrackingUrl: (trackingReference: string): string => {
    const cleanRef = trackingReference.trim();
    const baseTrackUrl =
      process.env.BOBGO_MODE === "sandbox"
        ? "https://track.sandbox.bobgo.co.za"
        : "https://track.bobgo.co.za";
    return `${baseTrackUrl}/${encodeURIComponent(cleanRef)}`;
  },

  /**
   * Get shipping rates for a shipment
   */
  getRates: async (data: BobGoRateRequest): Promise<BobGoRate[]> => {
    if (!process.env.BOBGO_API_KEY) {
      console.warn("BOBGO_API_KEY is not set. Shipping rates will fail.");
      return [];
    }

    try {
      const response = await fetch(`${getBobGoBaseUrl()}/rates`, {
        method: "POST",
        headers: getBobGoHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("BobGo Rates Error:", error);
        return [];
      }

      const result = await response.json();

      // BobGo v2 returns quotes nested under provider_rate_requests[].responses[]
      if (Array.isArray(result.provider_rate_requests)) {
        const parsedRates: BobGoRate[] = [];

        for (const provider of result.provider_rate_requests) {
          if (provider?.status !== "success" || !Array.isArray(provider.responses)) {
            continue;
          }

          provider.responses.forEach((resp: any, idx: number) => {
            if (resp?.status !== "success" || typeof resp.rate_amount !== "number") {
              return;
            }

            const slCode: string = resp.service_level_code || resp.service_level?.code || "";
            const slName: string =
              resp.service_level?.name || slCode || "Standard Delivery";
            const slDays = resp.service_level?.service_level_days;

            let minDays = 2;
            let maxDays = 5;
            if (typeof slDays === "number" && slDays > 0) {
              minDays = slDays;
              maxDays = slDays;
            } else {
              const upper = `${slCode} ${slName}`.toUpperCase();
              if (upper.includes("SDX") || upper.includes("SAME")) {
                minDays = 0;
                maxDays = 1;
              } else if (
                upper.includes("OVN") ||
                upper.includes("PRI") ||
                upper.includes("ND") ||
                upper.includes("EXP") ||
                upper.includes("ON1") ||
                upper.includes("AIR") ||
                upper.includes("EXPRESS") ||
                upper.includes("OVERNIGHT")
              ) {
                minDays = 1;
                maxDays = 2;
              }
            }

            const totalCharge = Number(resp.rate_amount.toFixed(2));
            const exclVat =
              typeof resp.rate_amount_excl_vat === "number"
                ? resp.rate_amount_excl_vat
                : totalCharge / 1.15;
            const taxAmount = Number(Math.max(0, totalCharge - exclVat).toFixed(2));
            const providerId = Number(provider.provider_id) || 0;

            parsedRates.push({
              service_level_id: providerId * 10000 + idx + 1,
              service_level_name: slName,
              service_level_code: slCode,
              courier_id: providerId,
              courier_name: provider.provider_name || provider.provider_slug || "Courier",
              courier_slug: provider.provider_slug,
              description: resp.service_level?.description || undefined,
              total_charge: totalCharge,
              tax_amount: taxAmount,
              currency: "ZAR",
              delivery_time_min: minDays,
              delivery_time_max: maxDays,
            });
          });
        }

        return parsedRates.sort((a, b) => a.total_charge - b.total_charge);
      }

      if (Array.isArray(result.rates)) {
        return [...result.rates].sort((a, b) => a.total_charge - b.total_charge);
      }

      return [];
    } catch (error) {
      console.error("BobGo Client Error (getRates):", error);
      return [];
    }
  },

  /**
   * Create an order in Bob Go (/v2/orders)
   */
  createOrder: async (order: BobGoOrder) => {
    if (!process.env.BOBGO_API_KEY) return null;

    try {
      const response = await fetch(`${getBobGoBaseUrl()}/orders`, {
        method: "POST",
        headers: getBobGoHeaders(),
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("BobGo Create Order Error:", error);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("BobGo Client Error (createOrder):", error);
      return null;
    }
  },

  /**
   * Create / book a shipment in Bob Go (/v2/shipments)
   */
  createShipment: async (shipment: BobGoCreateShipmentRequest) => {
    if (!process.env.BOBGO_API_KEY) {
      throw new Error("BOBGO_API_KEY is not configured.");
    }

    const response = await fetch(`${getBobGoBaseUrl()}/shipments`, {
      method: "POST",
      headers: getBobGoHeaders(),
      body: JSON.stringify(shipment),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BobGo Create Shipment Error:", errorText);
      throw new Error(`Bob Go shipment creation failed: ${errorText}`);
    }

    return await response.json();
  },

  /**
   * Fetch live tracking checkpoints & milestones from Bob Go (/v2/tracking)
   * Note: Bob Go returns an array of tracking objects for `GET /v2/tracking?tracking_reference=...`
   */
  getTracking: async (
    trackingReference: string
  ): Promise<BobGoTrackingResponse | null> => {
    const cleanRef = trackingReference.trim();
    if (!cleanRef) return null;

    try {
      const url = `${getBobGoBaseUrl()}/tracking?tracking_reference=${encodeURIComponent(
        cleanRef
      )}`;
      const response = await fetch(url, {
        method: "GET",
        headers: getBobGoHeaders(),
        cache: "no-store",
      });

      if (!response.ok) {
        // Bob Go returns 404 or 500 with JSON message when tracking_reference doesn't exist yet
        const errBody = await response.text();
        console.warn(
          `BobGo Tracking lookup non-OK (${response.status}) for "${cleanRef}":`,
          errBody
        );
        return null;
      }

      const payload = await response.json();
      const rawItem = Array.isArray(payload)
        ? payload[0]
        : payload?.tracking
          ? Array.isArray(payload.tracking)
            ? payload.tracking[0]
            : payload.tracking
          : payload;

      if (!rawItem || (!rawItem.status && !rawItem.checkpoints)) {
        return null;
      }

      const ref =
        rawItem.shipment_tracking_reference ||
        rawItem.tracking_reference ||
        cleanRef;

      return {
        ...rawItem,
        shipment_tracking_reference: ref,
        status: rawItem.status || "pending-collection",
        status_friendly:
          rawItem.status_friendly ||
          rawItem.status ||
          "Awaiting Courier Update",
        checkpoints: Array.isArray(rawItem.checkpoints)
          ? rawItem.checkpoints
          : [],
        tracking_url:
          rawItem.tracking_url || BobGoClient.getPublicTrackingUrl(ref),
      };
    } catch (error) {
      console.error("BobGo Client Error (getTracking):", error);
      return null;
    }
  },

  /**
   * List shipments from Bob Go (/v2/shipments) filtered by tracking_reference or order_number
   */
  getShipments: async (params?: {
    tracking_reference?: string;
    order_number?: string;
    id?: string;
  }): Promise<any[]> => {
    if (!process.env.BOBGO_API_KEY) return [];

    try {
      const searchParams = new URLSearchParams();
      if (params?.tracking_reference) {
        searchParams.set("tracking_reference", params.tracking_reference);
      }
      if (params?.order_number) {
        searchParams.set("custom_order_number", params.order_number);
      }
      if (params?.id) {
        searchParams.set("id", params.id);
      }

      const qs = searchParams.toString();
      const url = `${getBobGoBaseUrl()}/shipments${qs ? `?${qs}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getBobGoHeaders(),
        cache: "no-store",
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.shipments)) return data.shipments;
      return [];
    } catch (error) {
      console.error("BobGo Client Error (getShipments):", error);
      return [];
    }
  },

  /**
   * Verify `bobgo-webhook-signature` HMAC-SHA256 header (base64 encoded)
   * If BOBGO_WEBHOOK_SECRET is not set, returns true so webhooks work during initial setup.
   */
  verifyWebhookSignature: (
    rawBody: string,
    signatureHeader: string | null
  ): boolean => {
    const secret = process.env.BOBGO_WEBHOOK_SECRET;
    if (!secret) return true;
    if (!signatureHeader) return false;

    try {
      const computed = crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64");

      const sigBuf = Buffer.from(signatureHeader.trim());
      const compBuf = Buffer.from(computed);
      if (sigBuf.length !== compBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, compBuf);
    } catch {
      return false;
    }
  },
};
