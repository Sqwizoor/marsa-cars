export interface BobGoRate {
  service_level_id: number;
  service_level_name: string;
  service_level_code?: string;
  courier_id: number;
  courier_name: string;
  courier_slug?: string;
  description?: string;
  total_charge: number;
  tax_amount: number;
  currency: string;
  delivery_time_min: number;
  delivery_time_max: number;
}

export interface BobGoRateRequest {
  collection_address: {
    street_address: string;
    local_area: string;
    city: string;
    zone: string;
    country: string;
    code: string;
    lat?: number;
    lng?: number;
  };
  delivery_address: {
    street_address: string;
    local_area: string;
    city: string;
    zone: string;
    country: string; // ISO code e.g., 'ZA'
    code: string; // postal code
    lat?: number;
    lng?: number;
  };
  parcels: {
    submitted_length_cm: number;
    submitted_width_cm: number;
    submitted_height_cm: number;
    submitted_weight_kg: number;
  }[];
}

export interface BobGoOrder {
  order_number: string;
  payment_status: "paid" | "unpaid";
  collection_address: BobGoRateRequest["collection_address"];
  delivery_address: BobGoRateRequest["delivery_address"];
  parcels: BobGoRateRequest["parcels"];
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    weight: number;
  }[];
}

export interface BobGoCheckpoint {
  time: string;
  time_string?: string;
  status: string;
  status_friendly?: string;
  message: string;
  location?: string;
  country?: string;
  zone?: string;
  city?: string;
  zip?: string;
}

export interface BobGoMovementEvents {
  collection?: string | null;
  in_transit?: string | null;
  out_for_delivery?: string | null;
  delivery?: string | null;
  exception?: string | null;
}

export interface BobGoTrackingResponse {
  id?: number | string;
  shipment_tracking_reference: string;
  provider_tracking_reference?: string;
  custom_tracking_reference?: string;
  channel_order_number?: string;
  status: string;
  status_friendly: string;
  courier_name?: string;
  courier_code?: string;
  courier_phone?: string;
  courier_logo?: string;
  service_level_name?: string;
  last_checkpoint_time?: string;
  shipment_time_created?: string;
  shipment_estimated_delivery_date_from?: string;
  shipment_estimated_delivery_date_to?: string;
  checkpoints: BobGoCheckpoint[];
  grouped_checkpoints?: Record<string, BobGoCheckpoint[]>;
  shipment_movement_events?: BobGoMovementEvents;
  tracking_url?: string;
}

export interface BobGoWebhookPayload extends BobGoTrackingResponse {
  shipment?: {
    collection_address?: Record<string, any>;
    delivery_address?: Record<string, any>;
    collection_contact_name?: string;
    collection_contact_mobile_number?: string;
    delivery_contact_name?: string;
    delivery_contact_mobile_number?: string;
    delivery_contact_email?: string;
  };
}

export interface BobGoCreateShipmentRequest {
  collection_address: {
    company?: string;
    street_address: string;
    local_area: string;
    city: string;
    zone: string;
    country: string;
    code: string;
  };
  collection_contact: {
    name: string;
    mobile_number: string;
    email?: string;
  };
  delivery_address: {
    company?: string;
    street_address: string;
    local_area: string;
    city: string;
    zone: string;
    country: string;
    code: string;
  };
  delivery_contact: {
    name: string;
    mobile_number: string;
    email?: string;
  };
  parcels: {
    description?: string;
    submitted_length_cm: number;
    submitted_width_cm: number;
    submitted_height_cm: number;
    submitted_weight_kg: number;
  }[];
  declared_value?: number;
  custom_tracking_reference?: string;
  custom_order_number?: string;
  service_level_code?: string;
  service_level_id?: number;
  provider_slug?: string;
}

export interface UnifiedShipmentTracking {
  id?: string;
  orderId?: string;
  orderGroupId?: string;
  storeName?: string;
  trackingReference: string;
  providerTrackingReference?: string | null;
  courierName?: string | null;
  courierCode?: string | null;
  serviceLevel?: string | null;
  status: string;
  statusFriendly: string;
  trackingUrl?: string | null;
  estimatedDeliveryFrom?: string | null;
  estimatedDeliveryTo?: string | null;
  lastCheckpointTime?: string | null;
  checkpoints: BobGoCheckpoint[];
  movementEvents?: BobGoMovementEvents | null;
  source: "bobgo_live" | "bobgo_cached" | "order_status";
}

/**
 * Maps a Bob Go shipment status slug into our internal OrderStatus enum value.
 */
export function mapBobGoStatusToOrderStatus(
  bobgoStatus: string
):
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "OutforDelivery"
  | "Delivered"
  | "Cancelled"
  | "Failed"
  | "Returned"
  | "OnHold" {
  const normalized = (bobgoStatus || "").toLowerCase().trim();

  if (
    normalized === "delivered" ||
    normalized === "completed" ||
    normalized === "collected-by-recipient"
  ) {
    return "Delivered";
  }
  if (
    normalized === "out-for-delivery" ||
    normalized === "out_for_delivery" ||
    normalized === "ready-for-collection"
  ) {
    return "OutforDelivery";
  }
  if (
    normalized === "in-transit" ||
    normalized === "in_transit" ||
    normalized === "collected" ||
    normalized === "at-hub" ||
    normalized === "at-destination-hub" ||
    normalized === "dispatched"
  ) {
    return "Shipped";
  }
  if (
    normalized === "pending-collection" ||
    normalized === "awaiting-collection" ||
    normalized === "collection-assigned" ||
    normalized === "submitted"
  ) {
    return "Processing";
  }
  if (normalized === "cancelled" || normalized === "canceled") {
    return "Cancelled";
  }
  if (
    normalized === "returned" ||
    normalized === "returned-to-sender" ||
    normalized === "returning-to-sender"
  ) {
    return "Returned";
  }
  if (
    normalized === "delivery-exception" ||
    normalized === "collection-exception" ||
    normalized === "on-hold"
  ) {
    return "OnHold";
  }
  if (normalized === "failed" || normalized === "delivery-failed") {
    return "Failed";
  }

  return "Processing";
}
