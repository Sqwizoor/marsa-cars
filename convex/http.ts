import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", backend: "convex" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const eventType = payload.type;
      const data = payload.data;

      if (eventType === "user.created" || eventType === "user.updated") {
        const name =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          data.username ||
          "User";
        const email = data.email_addresses?.[0]?.email_address || "";
        const picture = data.image_url || "";
        const role = data.private_metadata?.role || "USER";

        await ctx.runMutation(api.users.upsertUserFromClerk, {
          id: data.id,
          name,
          email,
          picture,
          role,
        });
      } else if (eventType === "user.deleted") {
        await ctx.runMutation(api.users.deleteUserFromClerk, {
          userId: data.id,
        });
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error?.message || "Webhook error" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/webhooks/bobgo",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const trackingReference =
        payload.shipment_tracking_reference || payload.tracking_reference;
      const orderId =
        payload.channel_order_number || payload.custom_order_number;

      if (trackingReference && orderId) {
        await ctx.runMutation(api.tracking.upsertShipmentTracking, {
          orderId,
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
            `https://track.bobgo.co.za/${encodeURIComponent(trackingReference)}`,
          checkpoints: payload.checkpoints || [],
          movementEvents: payload.shipment_movement_events,
        });
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error?.message || "Bob Go webhook error" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
