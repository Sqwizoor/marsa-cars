"use server";

import { db } from "@/lib/db";
import {
  api,
  convexMutation,
  convexQuery,
  isConvexEnabled,
} from "@/lib/convex";
import { BobGoClient } from "@/lib/bobgo/client";
import {
  BobGoCheckpoint,
  BobGoTrackingResponse,
  UnifiedShipmentTracking,
  mapBobGoStatusToOrderStatus,
} from "@/lib/bobgo/types";
import { currentUser } from "@clerk/nextjs/server";
import { getShippingDatesRange } from "@/lib/utils";

function safeParseDate(val?: string | Date | number | null): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

function toUnifiedFromBobGo(
  live: BobGoTrackingResponse,
  meta?: {
    id?: string;
    orderId?: string;
    orderGroupId?: string;
    storeName?: string;
    courierNameFallback?: string | null;
    serviceLevelFallback?: string | null;
  }
): UnifiedShipmentTracking {
  return {
    id: meta?.id,
    orderId: meta?.orderId || live.channel_order_number,
    orderGroupId: meta?.orderGroupId,
    storeName: meta?.storeName,
    trackingReference: live.shipment_tracking_reference,
    providerTrackingReference: live.provider_tracking_reference || null,
    courierName: live.courier_name || meta?.courierNameFallback || "Bob Go Courier",
    courierCode: live.courier_code || null,
    serviceLevel: live.service_level_name || meta?.serviceLevelFallback || null,
    status: live.status,
    statusFriendly: live.status_friendly || live.status,
    trackingUrl:
      live.tracking_url ||
      BobGoClient.getPublicTrackingUrl(live.shipment_tracking_reference),
    estimatedDeliveryFrom: live.shipment_estimated_delivery_date_from || null,
    estimatedDeliveryTo: live.shipment_estimated_delivery_date_to || null,
    lastCheckpointTime: live.last_checkpoint_time || null,
    checkpoints: Array.isArray(live.checkpoints) ? live.checkpoints : [],
    movementEvents: live.shipment_movement_events || null,
    source: "bobgo_live",
  };
}

function toUnifiedFromRecord(
  record: any,
  storeName?: string
): UnifiedShipmentTracking {
  const checkpoints: BobGoCheckpoint[] = Array.isArray(record.checkpoints)
    ? record.checkpoints
    : [];
  return {
    id: record.id,
    orderId: record.orderId,
    orderGroupId: record.orderGroupId || undefined,
    storeName,
    trackingReference: record.trackingReference,
    providerTrackingReference: record.providerTrackingReference || null,
    courierName: record.courierName || "Bob Go Courier",
    courierCode: record.courierCode || null,
    serviceLevel: record.serviceLevel || null,
    status: record.status || "pending-collection",
    statusFriendly: record.statusFriendly || "Awaiting Courier Update",
    trackingUrl:
      record.trackingUrl ||
      BobGoClient.getPublicTrackingUrl(record.trackingReference),
    estimatedDeliveryFrom: record.estimatedDeliveryFrom
      ? new Date(record.estimatedDeliveryFrom).toISOString()
      : null,
    estimatedDeliveryTo: record.estimatedDeliveryTo
      ? new Date(record.estimatedDeliveryTo).toISOString()
      : null,
    lastCheckpointTime: record.lastCheckpointTime
      ? new Date(record.lastCheckpointTime).toISOString()
      : null,
    checkpoints,
    movementEvents: record.movementEvents || null,
    source: "bobgo_cached",
  };
}

function buildOrderStatusFallback(
  group: any,
  parentOrder: any,
  storeName?: string
): UnifiedShipmentTracking {
  const status: string = group.status || parentOrder?.orderStatus || "Pending";
  const createdAt = group.createdAt
    ? new Date(group.createdAt)
    : new Date();
  const updatedAt = group.updatedAt
    ? new Date(group.updatedAt)
    : createdAt;

  const { minDate, maxDate } = getShippingDatesRange(
    group.shippingDeliveryMin || 3,
    group.shippingDeliveryMax || 7,
    createdAt
  );

  const checkpoints: BobGoCheckpoint[] = [
    {
      time: createdAt.toISOString(),
      status: "order-placed",
      status_friendly: "Order Placed",
      message: `Order received and assigned to ${storeName || "seller"} (${group.shippingService || "Standard Delivery"}).`,
      location: "Online Store",
    },
  ];

  if (parentOrder?.paymentStatus === "Paid") {
    checkpoints.unshift({
      time: createdAt.toISOString(),
      status: "payment-confirmed",
      status_friendly: "Payment Confirmed",
      message: "Payment verified. Preparing parcel for Bob Go courier collection.",
      location: "Billing",
    });
  }

  if (status !== "Pending") {
    const statusMessages: Record<string, { friendly: string; msg: string; bobStatus: string }> = {
      Confirmed: {
        friendly: "Order Confirmed",
        msg: "Seller confirmed your order and is packing your items.",
        bobStatus: "pending-collection",
      },
      Processing: {
        friendly: "Packing & Awaiting Collection",
        msg: "Parcel is being prepared for Bob Go courier pickup.",
        bobStatus: "pending-collection",
      },
      Shipped: {
        friendly: "In Transit",
        msg: "Parcel has been handed over to the courier and is in transit.",
        bobStatus: "in-transit",
      },
      PartiallyShipped: {
        friendly: "Partially Shipped",
        msg: "Part of your order has been dispatched with the courier.",
        bobStatus: "in-transit",
      },
      OutforDelivery: {
        friendly: "Out for Delivery",
        msg: "Courier driver is out for delivery to your shipping address.",
        bobStatus: "out-for-delivery",
      },
      Delivered: {
        friendly: "Delivered",
        msg: "Parcel has been delivered.",
        bobStatus: "delivered",
      },
      Cancelled: {
        friendly: "Order Cancelled",
        msg: "This shipment has been cancelled.",
        bobStatus: "cancelled",
      },
      OnHold: {
        friendly: "On Hold",
        msg: "Order is currently on hold.",
        bobStatus: "on-hold",
      },
    };

    const info = statusMessages[status] || {
      friendly: status,
      msg: `Order status updated to ${status}.`,
      bobStatus: status.toLowerCase(),
    };

    checkpoints.unshift({
      time: updatedAt.toISOString(),
      status: info.bobStatus,
      status_friendly: info.friendly,
      message: info.msg,
      location: storeName || "Fulfillment Center",
    });
  }

  const bobStatusMap: Record<string, string> = {
    Pending: "pending-collection",
    Confirmed: "pending-collection",
    Processing: "pending-collection",
    Shipped: "in-transit",
    PartiallyShipped: "in-transit",
    OutforDelivery: "out-for-delivery",
    Delivered: "delivered",
    Cancelled: "cancelled",
  };

  const friendlyMap: Record<string, string> = {
    Pending: "Order Received",
    Confirmed: "Confirmed — Preparing Shipment",
    Processing: "Awaiting Courier Collection",
    Shipped: "In Transit",
    PartiallyShipped: "Partially Shipped",
    OutforDelivery: "Out for Delivery",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
  };

  return {
    orderId: group.orderId || parentOrder?.id,
    orderGroupId: group.id,
    storeName: storeName || group.store?.name || "Seller",
    trackingReference: `#${String(group.id).slice(0, 8).toUpperCase()}`,
    providerTrackingReference: null,
    courierName: group.shippingService || "Bob Go Shipping",
    courierCode: null,
    serviceLevel: group.shippingService || "Standard",
    status: bobStatusMap[status] || status.toLowerCase(),
    statusFriendly: friendlyMap[status] || status,
    trackingUrl: null,
    estimatedDeliveryFrom: minDate,
    estimatedDeliveryTo: maxDate,
    lastCheckpointTime: updatedAt.toISOString(),
    checkpoints,
    movementEvents: null,
    source: "order_status",
  };
}

/**
 * Internal helper to persist/upsert a ShipmentTracking record safely across Convex and Prisma.
 */
export async function persistShipmentTracking(params: {
  orderId: string;
  orderGroupId?: string;
  trackingReference: string;
  providerTrackingReference?: string;
  bobgoShipmentId?: string;
  courierName?: string;
  courierCode?: string;
  serviceLevel?: string;
  status: string;
  statusFriendly: string;
  trackingUrl?: string;
  estimatedDeliveryFrom?: string | Date | null;
  estimatedDeliveryTo?: string | Date | null;
  lastCheckpointTime?: string | Date | null;
  checkpoints?: BobGoCheckpoint[];
  movementEvents?: any;
  syncOrderStatus?: boolean;
}) {
  const mappedOrderStatus = params.syncOrderStatus
    ? mapBobGoStatusToOrderStatus(params.status)
    : undefined;

  const estFrom = safeParseDate(params.estimatedDeliveryFrom);
  const estTo = safeParseDate(params.estimatedDeliveryTo);
  const lastCp = safeParseDate(params.lastCheckpointTime);

  if (isConvexEnabled()) {
    return await convexMutation(api.tracking.upsertShipmentTracking, {
      orderId: params.orderId,
      orderGroupId: params.orderGroupId,
      trackingReference: params.trackingReference,
      providerTrackingReference: params.providerTrackingReference,
      bobgoShipmentId: params.bobgoShipmentId,
      courierName: params.courierName,
      courierCode: params.courierCode,
      serviceLevel: params.serviceLevel,
      status: params.status,
      statusFriendly: params.statusFriendly,
      trackingUrl:
        params.trackingUrl ||
        BobGoClient.getPublicTrackingUrl(params.trackingReference),
      estimatedDeliveryFrom: estFrom?.getTime(),
      estimatedDeliveryTo: estTo?.getTime(),
      lastCheckpointTime: lastCp?.getTime(),
      checkpoints: params.checkpoints,
      movementEvents: params.movementEvents,
      syncOrderStatus: mappedOrderStatus,
    });
  }

  // Prisma / Neon persistence (wrapped in try/catch in case `prisma db push` hasn't been executed yet)
  try {
    const trackingDelegate = (db as any).shipmentTracking;
    if (trackingDelegate) {
      let existing = params.orderGroupId
        ? await trackingDelegate.findUnique({
            where: { orderGroupId: params.orderGroupId },
          })
        : null;

      if (!existing) {
        existing = await trackingDelegate.findFirst({
          where: { trackingReference: params.trackingReference },
        });
      }

      const payload = {
        orderId: params.orderId,
        orderGroupId: params.orderGroupId || null,
        trackingReference: params.trackingReference,
        providerTrackingReference: params.providerTrackingReference || null,
        bobgoShipmentId: params.bobgoShipmentId || null,
        courierName: params.courierName || null,
        courierCode: params.courierCode || null,
        serviceLevel: params.serviceLevel || null,
        status: params.status,
        statusFriendly: params.statusFriendly,
        trackingUrl:
          params.trackingUrl ||
          BobGoClient.getPublicTrackingUrl(params.trackingReference),
        estimatedDeliveryFrom: estFrom || null,
        estimatedDeliveryTo: estTo || null,
        lastCheckpointTime: lastCp || null,
        checkpoints: params.checkpoints || [],
        movementEvents: params.movementEvents || null,
      };

      const saved = existing
        ? await trackingDelegate.update({
            where: { id: existing.id },
            data: payload,
          })
        : await trackingDelegate.create({
            data: payload,
          });

      if (mappedOrderStatus) {
        if (params.orderGroupId) {
          await db.orderGroup
            .update({
              where: { id: params.orderGroupId },
              data: { status: mappedOrderStatus as any },
            })
            .catch(() => null);
        }
        await db.order
          .update({
            where: { id: params.orderId },
            data: { orderStatus: mappedOrderStatus as any },
          })
          .catch(() => null);
      }

      return saved;
    }
  } catch (err) {
    console.warn(
      "Note: ShipmentTracking table not yet synced in Neon (run `npx prisma db push` to persist tracking records).",
      err
    );
  }

  return null;
}

/**
 * Seller or Admin action: Save / update a Bob Go tracking reference for an OrderGroup,
 * immediately sync live Bob Go checkpoints if available, and optionally mark as Shipped.
 */
export async function saveOrderGroupTracking(input: {
  storeId: string;
  orderGroupId: string;
  trackingReference: string;
  providerTrackingReference?: string;
  courierName?: string;
  serviceLevel?: string;
  markAsShipped?: boolean;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");

  const cleanRef = input.trackingReference.trim();
  if (!cleanRef) throw new Error("Tracking reference is required.");

  // Verify seller store ownership or ADMIN role
  const isAdmin = user.privateMetadata?.role === "ADMIN";
  let orderId = "";

  if (isConvexEnabled()) {
    const summary = await convexQuery<any>(api.tracking.getPublicOrderSummary, {
      lookupId: input.orderGroupId,
    });
    const matchedGroup = summary?.groups?.[0];
    if (!matchedGroup) throw new Error("Order group not found.");
    orderId = matchedGroup.orderId;
  } else {
    if (!isAdmin) {
      const store = await db.store.findFirst({
        where: {
          id: input.storeId,
          OR: [
            { userId: user.id },
            { members: { some: { id: user.id } } },
          ],
        },
      });
      if (!store) throw new Error("Unauthorized access to store.");
    }

    const group = await db.orderGroup.findUnique({
      where: { id: input.orderGroupId },
    });
    if (!group) throw new Error("Order group not found.");
    orderId = group.orderId;
  }

  // Pull live status from Bob Go immediately if available
  const live = await BobGoClient.getTracking(cleanRef);

  const status =
    live?.status || (input.markAsShipped ? "in-transit" : "pending-collection");
  const statusFriendly =
    live?.status_friendly ||
    (input.markAsShipped ? "Shipped / In Transit" : "Awaiting Courier Scan");

  await persistShipmentTracking({
    orderId,
    orderGroupId: input.orderGroupId,
    trackingReference: cleanRef,
    providerTrackingReference:
      live?.provider_tracking_reference || input.providerTrackingReference,
    courierName: live?.courier_name || input.courierName || "Bob Go Courier",
    courierCode: live?.courier_code,
    serviceLevel: live?.service_level_name || input.serviceLevel,
    status,
    statusFriendly,
    trackingUrl:
      live?.tracking_url || BobGoClient.getPublicTrackingUrl(cleanRef),
    estimatedDeliveryFrom: live?.shipment_estimated_delivery_date_from,
    estimatedDeliveryTo: live?.shipment_estimated_delivery_date_to,
    lastCheckpointTime: live?.last_checkpoint_time,
    checkpoints: live?.checkpoints || [],
    movementEvents: live?.shipment_movement_events,
    syncOrderStatus: Boolean(live || input.markAsShipped),
  });

  return {
    success: true,
    trackingReference: cleanRef,
    trackingUrl: BobGoClient.getPublicTrackingUrl(cleanRef),
    liveFound: Boolean(live),
    statusFriendly,
  };
}

/**
 * Retrieve tracking record for a single OrderGroup (with optional live Bob Go refresh)
 */
export async function getOrderGroupTracking(
  orderGroupId: string,
  refreshLive = true
): Promise<UnifiedShipmentTracking | null> {
  let saved: any = null;

  if (isConvexEnabled()) {
    saved = await convexQuery(api.tracking.getTrackingByOrderGroup, {
      orderGroupId,
    });
  } else {
    try {
      saved = await (db as any).shipmentTracking?.findUnique({
        where: { orderGroupId },
      });
    } catch {
      saved = null;
    }
  }

  if (!saved) return null;

  if (refreshLive && saved.trackingReference) {
    const live = await BobGoClient.getTracking(saved.trackingReference);
    if (live) {
      await persistShipmentTracking({
        orderId: saved.orderId,
        orderGroupId: saved.orderGroupId,
        trackingReference: live.shipment_tracking_reference,
        providerTrackingReference:
          live.provider_tracking_reference || saved.providerTrackingReference,
        courierName: live.courier_name || saved.courierName,
        courierCode: live.courier_code || saved.courierCode,
        serviceLevel: live.service_level_name || saved.serviceLevel,
        status: live.status,
        statusFriendly: live.status_friendly,
        trackingUrl: live.tracking_url,
        estimatedDeliveryFrom: live.shipment_estimated_delivery_date_from,
        estimatedDeliveryTo: live.shipment_estimated_delivery_date_to,
        lastCheckpointTime: live.last_checkpoint_time,
        checkpoints: live.checkpoints,
        movementEvents: live.shipment_movement_events,
        syncOrderStatus: true,
      });

      return toUnifiedFromBobGo(live, {
        id: saved.id,
        orderId: saved.orderId,
        orderGroupId: saved.orderGroupId,
        courierNameFallback: saved.courierName,
        serviceLevelFallback: saved.serviceLevel,
      });
    }
  }

  return toUnifiedFromRecord(saved);
}

/**
 * Unified public lookup by either:
 *   1) Bob Go Tracking Reference / Courier Waybill (e.g., "UASDRW78")
 *   2) Order ID or Order Group ID
 */
export async function lookupOrderOrTracking(
  rawQuery: string
): Promise<UnifiedShipmentTracking[]> {
  const cleanQuery = rawQuery.trim().replace(/^#/, "");
  if (!cleanQuery) return [];

  // 1. Check saved ShipmentTracking by trackingReference or providerTrackingReference
  let savedByRef: any = null;
  if (isConvexEnabled()) {
    savedByRef = await convexQuery(api.tracking.getTrackingByReference, {
      trackingReference: cleanQuery,
    });
  } else {
    try {
      savedByRef = await (db as any).shipmentTracking?.findFirst({
        where: {
          OR: [
            {
              trackingReference: {
                equals: cleanQuery,
                mode: "insensitive",
              },
            },
            {
              providerTrackingReference: {
                equals: cleanQuery,
                mode: "insensitive",
              },
            },
          ],
        },
      });
    } catch {
      savedByRef = null;
    }
  }

  if (savedByRef) {
    const live = await BobGoClient.getTracking(savedByRef.trackingReference);
    if (live) {
      await persistShipmentTracking({
        orderId: savedByRef.orderId,
        orderGroupId: savedByRef.orderGroupId,
        trackingReference: live.shipment_tracking_reference,
        providerTrackingReference:
          live.provider_tracking_reference ||
          savedByRef.providerTrackingReference,
        courierName: live.courier_name || savedByRef.courierName,
        courierCode: live.courier_code || savedByRef.courierCode,
        serviceLevel: live.service_level_name || savedByRef.serviceLevel,
        status: live.status,
        statusFriendly: live.status_friendly,
        trackingUrl: live.tracking_url,
        estimatedDeliveryFrom: live.shipment_estimated_delivery_date_from,
        estimatedDeliveryTo: live.shipment_estimated_delivery_date_to,
        lastCheckpointTime: live.last_checkpoint_time,
        checkpoints: live.checkpoints,
        movementEvents: live.shipment_movement_events,
        syncOrderStatus: true,
      });

      return [
        toUnifiedFromBobGo(live, {
          id: savedByRef.id,
          orderId: savedByRef.orderId,
          orderGroupId: savedByRef.orderGroupId,
          courierNameFallback: savedByRef.courierName,
          serviceLevelFallback: savedByRef.serviceLevel,
        }),
      ];
    }
    return [toUnifiedFromRecord(savedByRef)];
  }

  // 2. Check if cleanQuery matches an Order ID or OrderGroup ID in our database
  let orderSummary: { order: any; groups: any[] } | null = null;

  if (isConvexEnabled()) {
    orderSummary = await convexQuery(api.tracking.getPublicOrderSummary, {
      lookupId: cleanQuery,
    });
  } else {
    const order = await db.order
      .findUnique({
        where: { id: cleanQuery },
        include: {
          groups: {
            include: { store: { select: { name: true } } },
          },
        },
      })
      .catch(() => null);

    if (order) {
      orderSummary = {
        order,
        groups: order.groups.map((g) => ({
          ...g,
          storeName: g.store?.name || "Seller",
        })),
      };
    } else {
      const singleGroup = await db.orderGroup
        .findUnique({
          where: { id: cleanQuery },
          include: {
            order: true,
            store: { select: { name: true } },
          },
        })
        .catch(() => null);

      if (singleGroup) {
        orderSummary = {
          order: singleGroup.order,
          groups: [
            {
              ...singleGroup,
              storeName: singleGroup.store?.name || "Seller",
            },
          ],
        };
      }
    }
  }

  if (orderSummary && orderSummary.groups.length > 0) {
    const results: UnifiedShipmentTracking[] = [];

    // Check if there are saved ShipmentTracking records for this order
    let orderTrackings: any[] = [];
    const parentOrderId =
      orderSummary.order?.id || orderSummary.groups[0]?.orderId;

    if (parentOrderId) {
      if (isConvexEnabled()) {
        orderTrackings = await convexQuery(api.tracking.getTrackingsByOrder, {
          orderId: parentOrderId,
        });
      } else {
        try {
          orderTrackings =
            (await (db as any).shipmentTracking?.findMany({
              where: { orderId: parentOrderId },
            })) || [];
        } catch {
          orderTrackings = [];
        }
      }

      // If none saved locally yet, check Bob Go shipments API by order_number!
      if (orderTrackings.length === 0) {
        const remoteShipments = await BobGoClient.getShipments({
          order_number: parentOrderId,
        });
        for (const ship of remoteShipments) {
          const ref = ship.tracking_reference || ship.shipment_tracking_reference;
          if (ref) {
            const live = await BobGoClient.getTracking(ref);
            if (live) {
              await persistShipmentTracking({
                orderId: parentOrderId,
                orderGroupId: orderSummary.groups[0]?.id,
                trackingReference: ref,
                providerTrackingReference: live.provider_tracking_reference,
                courierName: live.courier_name || ship.courier_name,
                courierCode: live.courier_code,
                serviceLevel: live.service_level_name,
                status: live.status,
                statusFriendly: live.status_friendly,
                trackingUrl: live.tracking_url,
                estimatedDeliveryFrom: live.shipment_estimated_delivery_date_from,
                estimatedDeliveryTo: live.shipment_estimated_delivery_date_to,
                lastCheckpointTime: live.last_checkpoint_time,
                checkpoints: live.checkpoints,
                movementEvents: live.shipment_movement_events,
                syncOrderStatus: true,
              });
              results.push(
                toUnifiedFromBobGo(live, {
                  orderId: parentOrderId,
                  orderGroupId: orderSummary.groups[0]?.id,
                  storeName: orderSummary.groups[0]?.storeName,
                })
              );
            }
          }
        }
        if (results.length > 0) return results;
      }
    }

    // Map each OrderGroup to either its Bob Go tracking or its internal order status fallback
    for (const grp of orderSummary.groups) {
      const matchedTrack = orderTrackings.find(
        (t) => t.orderGroupId === grp.id || !t.orderGroupId
      );
      if (matchedTrack) {
        const live = await BobGoClient.getTracking(
          matchedTrack.trackingReference
        );
        if (live) {
          results.push(
            toUnifiedFromBobGo(live, {
              id: matchedTrack.id,
              orderId: parentOrderId,
              orderGroupId: grp.id,
              storeName: grp.storeName,
              courierNameFallback: matchedTrack.courierName,
              serviceLevelFallback: matchedTrack.serviceLevel,
            })
          );
        } else {
          results.push(toUnifiedFromRecord(matchedTrack, grp.storeName));
        }
      } else {
        results.push(
          buildOrderStatusFallback(grp, orderSummary.order, grp.storeName)
        );
      }
    }

    return results;
  }

  // 3. Direct Bob Go tracking lookup (for any Bob Go tracking reference even if booked outside our DB)
  const directLive = await BobGoClient.getTracking(cleanQuery);
  if (directLive) {
    return [toUnifiedFromBobGo(directLive)];
  }

  return [];
}
