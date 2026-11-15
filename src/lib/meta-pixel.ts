"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const fbqTrack = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  }
};

export const trackMetaViewContent = (params: {
  id: string;
  name: string;
  price: number;
  contentType?: "product" | "vehicle";
  category?: string;
}) => {
  fbqTrack("ViewContent", {
    content_ids: [params.id],
    content_name: params.name,
    content_type: params.contentType ?? "product",
    value: params.price,
    currency: "ZAR",
    ...(params.category ? { content_category: params.category } : {}),
  });
};

export const trackMetaAddToCart = (params: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) => {
  fbqTrack("AddToCart", {
    content_ids: [params.id],
    content_name: params.name,
    content_type: "product",
    value: params.price * params.quantity,
    currency: "ZAR",
    num_items: params.quantity,
  });
};

export const trackMetaAddToWishlist = (params: {
  id: string;
  name: string;
  price?: number;
  contentType?: "product" | "vehicle";
}) => {
  fbqTrack("AddToWishlist", {
    content_ids: [params.id],
    content_name: params.name,
    content_type: params.contentType ?? "product",
    ...(typeof params.price === "number"
      ? { value: params.price, currency: "ZAR" }
      : {}),
  });
};
