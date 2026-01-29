import { BobGoOrder, BobGoRate, BobGoRateRequest } from "./types";

const BOBGO_API_URL = process.env.BOBGO_API_URL || "https://api.bobgo.co.za/v2";
const BOBGO_API_KEY = process.env.BOBGO_API_KEY;

if (!BOBGO_API_KEY) {
  console.warn("BOBGO_API_KEY is not set. Shipping rates will fail.");
}

export const BobGoClient = {
  /**
   * Get shipping rates for a shipment
   */
  getRates: async (data: BobGoRateRequest): Promise<BobGoRate[]> => {
    if (!BOBGO_API_KEY) return [];

    try {
      const response = await fetch(`${BOBGO_API_URL}/rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BOBGO_API_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("BobGo Rates Error:", error);
        return [];
      }

      const result = await response.json();
      return result.rates || [];
    } catch (error) {
      console.error("BobGo Client Error:", error);
      return [];
    }
  },

  /**
   * Create an order in BobGo
   */
  createOrder: async (order: BobGoOrder) => {
    if (!BOBGO_API_KEY) return null;

    try {
      const response = await fetch(`${BOBGO_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BOBGO_API_KEY}`,
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("BobGo Create Order Error:", error);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("BobGo Client Error:", error);
      return null;
    }
  },
};
