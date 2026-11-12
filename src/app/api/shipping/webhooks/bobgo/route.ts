import { NextRequest, NextResponse } from "next/server";
import { BobGoClient } from "@/lib/bobgo/client";
import { BobGoWebhookPayload } from "@/lib/bobgo/types";
import { persistShipmentTracking } from "@/queries/tracking";
import { db } from "@/lib/db";
import { api, convexQuery, isConvexEnabled } from "@/lib/convex";

/**
 * Bob Go Webhook Receiver
 * Configure in Bob Go Dashboard -> Settings -> Webhooks:
 *   Topic: `tracking/updated` (and optionally `shipment/submitted`)
 *   URL:   `https://<your-domain>/api/shipping/webhooks/bobgo`
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("bobgo-webhook-signature");
    const topic = req.headers.get("x-bobgroup-topic") || "tracking/updated";

    if (!BobGoClient.verifyWebhookSignature(rawBody, signature)) {
      console.warn("Invalid Bob Go webhook signature rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as BobGoWebhookPayload;
    const trackingReference =
      payload.shipment_tracking_reference ||
      (payload as any).tracking_reference;

    if (!trackingReference) {
      return NextResponse.json({ received: true, skipped: "no_tracking_ref" });
    }

    console.log(`Bob Go Webhook [${topic}] received for ${trackingReference}:`, {
      status: payload.status,
      channel_order_number: payload.channel_order_number,
    });

    // Resolve orderId and orderGroupId
    let orderId =
      payload.channel_order_number ||
      (payload as any).custom_order_number ||
      "";
    let orderGroupId: string | undefined = undefined;

    if (isConvexEnabled()) {
      const existing = await convexQuery<any>(api.tracking.getTrackingByReference, {
        trackingReference,
      });
      if (existing) {
        orderId = orderId || existing.orderId;
        orderGroupId = existing.orderGroupId;
      } else if (orderId) {
        const summary = await convexQuery<any>(api.tracking.getPublicOrderSummary, {
          lookupId: orderId,
        });
        if (summary?.order) {
          orderId = summary.order.id;
          orderGroupId = summary.groups?.[0]?.id;
        }
      }
    } else {
      try {
        const existing = await (db as any).shipmentTracking?.findFirst({
          where: { trackingReference },
        });
        if (existing) {
          orderId = orderId || existing.orderId;
          orderGroupId = existing.orderGroupId || undefined;
        } else if (orderId) {
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: { groups: { select: { id: true } } },
          });
          if (order) {
            orderGroupId = order.groups[0]?.id;
          }
        }
      } catch {
        // Ignore if table not migrated yet
      }
    }

    if (orderId) {
      await persistShipmentTracking({
        orderId,
        orderGroupId,
        trackingReference,
        providerTrackingReference: payload.provider_tracking_reference,
        courierName: payload.courier_name,
        courierCode: payload.courier_code,
        serviceLevel: payload.service_level_name,
        status: payload.status || "in-transit",
        statusFriendly:
          payload.status_friendly || payload.status || "In Transit",
        trackingUrl:
          payload.tracking_url ||
          BobGoClient.getPublicTrackingUrl(trackingReference),
        estimatedDeliveryFrom: payload.shipment_estimated_delivery_date_from,
        estimatedDeliveryTo: payload.shipment_estimated_delivery_date_to,
        lastCheckpointTime: payload.last_checkpoint_time,
        checkpoints: payload.checkpoints || [],
        movementEvents: payload.shipment_movement_events,
        syncOrderStatus: true,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Bob Go Webhook Error:", error);
    // Return 200 or 500 depending on parse failure; 200 prevents infinite retries on malformed test pings
    return NextResponse.json({ received: false }, { status: 200 });
  }
}
