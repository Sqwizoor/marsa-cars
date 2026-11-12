import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import { orderStatusValidator } from "./schema";

export const getTrackingByReference = query({
  args: { trackingReference: v.string() },
  handler: async (ctx, { trackingReference }) => {
    const clean = trackingReference.trim();
    const doc = await ctx.db
      .query("shipmentTrackings")
      .withIndex("by_tracking_reference", (q) => q.eq("trackingReference", clean))
      .first();

    if (doc) return toPrismaShape(doc);

    // Fallback check by providerTrackingReference
    const all = await ctx.db.query("shipmentTrackings").collect();
    const byProvider = all.find(
      (item) =>
        item.providerTrackingReference?.toLowerCase() === clean.toLowerCase()
    );
    return byProvider ? toPrismaShape(byProvider) : null;
  },
});

export const getTrackingsByOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    const docs = await ctx.db
      .query("shipmentTrackings")
      .withIndex("by_order_id", (q) => q.eq("orderId", orderId))
      .collect();
    return docs.map((d) => toPrismaShape(d)!);
  },
});

export const getTrackingByOrderGroup = query({
  args: { orderGroupId: v.string() },
  handler: async (ctx, { orderGroupId }) => {
    const doc = await ctx.db
      .query("shipmentTrackings")
      .withIndex("by_order_group_id", (q) => q.eq("orderGroupId", orderGroupId))
      .first();
    return doc ? toPrismaShape(doc) : null;
  },
});

export const getPublicOrderSummary = query({
  args: { lookupId: v.string() },
  handler: async (ctx, { lookupId }) => {
    const clean = lookupId.trim().replace(/^#/, "");
    // Check Order by prismaId
    const order = await findById(ctx, "orders", clean);
    if (order) {
      const groups = await ctx.db
        .query("orderGroups")
        .withIndex("by_order_id", (q) => q.eq("orderId", order.prismaId))
        .collect();
      const enrichedGroups = await Promise.all(
        groups.map(async (g) => {
          const store = await findById(ctx, "stores", g.storeId);
          return {
            ...toPrismaShape(g)!,
            storeName: store?.name || "Store",
          };
        })
      );
      return {
        order: toPrismaShape(order),
        groups: enrichedGroups,
      };
    }

    // Check OrderGroup by prismaId
    const group = await findById(ctx, "orderGroups", clean);
    if (group) {
      const parentOrder = await findById(ctx, "orders", group.orderId);
      const store = await findById(ctx, "stores", group.storeId);
      return {
        order: parentOrder ? toPrismaShape(parentOrder) : null,
        groups: [
          {
            ...toPrismaShape(group)!,
            storeName: store?.name || "Store",
          },
        ],
      };
    }

    return null;
  },
});

export const upsertShipmentTracking = mutation({
  args: {
    orderId: v.string(),
    orderGroupId: v.optional(v.string()),
    trackingReference: v.string(),
    providerTrackingReference: v.optional(v.string()),
    bobgoShipmentId: v.optional(v.string()),
    courierName: v.optional(v.string()),
    courierCode: v.optional(v.string()),
    serviceLevel: v.optional(v.string()),
    status: v.string(),
    statusFriendly: v.string(),
    trackingUrl: v.optional(v.string()),
    estimatedDeliveryFrom: v.optional(v.number()),
    estimatedDeliveryTo: v.optional(v.number()),
    lastCheckpointTime: v.optional(v.number()),
    checkpoints: v.optional(v.any()),
    movementEvents: v.optional(v.any()),
    syncOrderStatus: v.optional(orderStatusValidator),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { syncOrderStatus, ...data } = args;

    let existing = args.orderGroupId
      ? await ctx.db
          .query("shipmentTrackings")
          .withIndex("by_order_group_id", (q) =>
            q.eq("orderGroupId", args.orderGroupId)
          )
          .first()
      : null;

    if (!existing) {
      existing = await ctx.db
        .query("shipmentTrackings")
        .withIndex("by_tracking_reference", (q) =>
          q.eq("trackingReference", args.trackingReference)
        )
        .first();
    }

    let docId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...data,
        updatedAt: now,
      });
      docId = existing._id;
    } else {
      docId = await ctx.db.insert("shipmentTrackings", {
        prismaId: generateUuid(),
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (syncOrderStatus) {
      if (args.orderGroupId) {
        const group = await findById(ctx, "orderGroups", args.orderGroupId);
        if (group) {
          await ctx.db.patch(group._id, {
            status: syncOrderStatus,
            updatedAt: now,
          });
        }
      }
      const order = await findById(ctx, "orders", args.orderId);
      if (order) {
        await ctx.db.patch(order._id, {
          orderStatus: syncOrderStatus,
          updatedAt: now,
        });
      }
    }

    const updated = await ctx.db.get(docId);
    return updated ? toPrismaShape(updated) : null;
  },
});
