import { BobGoClient } from "../src/lib/bobgo/client";
import { BobGoRateRequest, BobGoOrder } from "../src/lib/bobgo/types";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testBobGo() {
  console.log("Testing BobGo Client...");

  // Mock Data
  const rateRequest: BobGoRateRequest = {
    collection_address: {
      street_address: "123 Main St",
      local_area: "Sandton",
      city: "Johannesburg",
      zone: "Gauteng",
      country: "South Africa",
      code: "2196",
      lat: 0,
      lng: 0,
    },
    delivery_address: {
      street_address: "456 Beach Rd",
      local_area: "Sea Point",
      city: "Cape Town",
      zone: "Western Cape",
      country: "South Africa",
      code: "8005",
    },
    parcels: [
      {
        submitted_length_cm: 30,
        submitted_width_cm: 20,
        submitted_height_cm: 10,
        submitted_weight_kg: 1,
      },
    ],
  };

  console.log("\n1. Fetching Rates...");
  const rates = await BobGoClient.getRates(rateRequest);
  console.log("Rates received:", rates.length);
  if (rates.length > 0) {
    console.log("Sample Rate:", rates[0]);
  } else {
    console.log("No rates returned. Check API Key or mock data.");
  }

  // Only test order creation if we have rates/valid config
  // Note: Creating an order might fail in sandbox if IDs/Accounts aren't set up, 
  // but it verifies the structure.
  /*
  console.log("\n2. Creating Order (Mock)...");
  const order: BobGoOrder = {
      order_number: "TEST-ORDER-" + Date.now(),
      payment_status: "paid",
      collection_address: rateRequest.collection_address,
      delivery_address: rateRequest.delivery_address,
      parcels: rateRequest.parcels,
      buyer: {
          name: "Test User",
          email: "test@example.com",
          phone: "0821234567"
      },
      items: [
          {
              name: "Test Item",
              quantity: 1,
              price: 100,
              weight: 1
          }
      ]
  };
  const createdOrder = await BobGoClient.createOrder(order);
  console.log("Order Creation Result:", createdOrder);
  */
}

testBobGo().catch(console.error);
