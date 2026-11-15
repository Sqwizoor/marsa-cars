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
    if (params && Object.keys(params).length > 0) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  }
};

// 1. AddPaymentInfo
export const trackMetaAddPaymentInfo = (params?: {
  value?: number;
  currency?: string;
  contentIds?: string[];
}) => {
  fbqTrack("AddPaymentInfo", {
    ...(typeof params?.value === "number"
      ? { value: params.value, currency: params.currency ?? "ZAR" }
      : {}),
    ...(params?.contentIds ? { content_ids: params.contentIds } : {}),
  });
};

// 2. AddToCart
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

// 3. AddToWishlist
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

// 4. CompleteRegistration
export const trackMetaCompleteRegistration = (params?: {
  contentName?: string;
  status?: boolean;
}) => {
  fbqTrack("CompleteRegistration", {
    ...(params?.contentName ? { content_name: params.contentName } : {}),
    ...(typeof params?.status === "boolean" ? { status: params.status } : {}),
  });
};

// 5. Contact
export const trackMetaContact = (params?: {
  contentName?: string;
  contentCategory?: string;
}) => {
  fbqTrack("Contact", {
    ...(params?.contentName ? { content_name: params.contentName } : {}),
    ...(params?.contentCategory
      ? { content_category: params.contentCategory }
      : {}),
  });
};

// 6. CustomizeProduct
export const trackMetaCustomizeProduct = (params?: {
  id?: string;
  name?: string;
  customization?: string;
}) => {
  fbqTrack("CustomizeProduct", {
    ...(params?.id ? { content_ids: [params.id] } : {}),
    ...(params?.name ? { content_name: params.name } : {}),
    ...(params?.customization ? { variant: params.customization } : {}),
  });
};

// 7. Donate
export const trackMetaDonate = (params?: {
  value?: number;
  currency?: string;
}) => {
  fbqTrack("Donate", {
    ...(typeof params?.value === "number"
      ? { value: params.value, currency: params.currency ?? "ZAR" }
      : {}),
  });
};

// 8. FindLocation
export const trackMetaFindLocation = (params?: { location?: string }) => {
  fbqTrack("FindLocation", {
    ...(params?.location ? { content_name: params.location } : {}),
  });
};

// 9. InitiateCheckout
export const trackMetaInitiateCheckout = (params?: {
  value?: number;
  numItems?: number;
  contentIds?: string[];
}) => {
  fbqTrack("InitiateCheckout", {
    ...(typeof params?.value === "number"
      ? { value: params.value, currency: "ZAR" }
      : {}),
    ...(typeof params?.numItems === "number"
      ? { num_items: params.numItems }
      : {}),
    ...(params?.contentIds ? { content_ids: params.contentIds } : {}),
  });
};

// 10. Lead
export const trackMetaLead = (params?: {
  id?: string;
  name?: string;
  value?: number;
  category?: string;
}) => {
  fbqTrack("Lead", {
    ...(params?.id ? { content_ids: [params.id] } : {}),
    ...(params?.name ? { content_name: params.name } : {}),
    ...(params?.category ? { content_category: params.category } : {}),
    ...(typeof params?.value === "number"
      ? { value: params.value, currency: "ZAR" }
      : {}),
  });
};

// 11. Purchase
export const trackMetaPurchase = (params: {
  value: number;
  currency?: string;
  orderId?: string;
  contentIds?: string[];
  numItems?: number;
}) => {
  fbqTrack("Purchase", {
    value: Number(params.value.toFixed(2)),
    currency: params.currency ?? "ZAR",
    content_type: "product",
    ...(params.orderId ? { order_id: params.orderId } : {}),
    ...(params.contentIds ? { content_ids: params.contentIds } : {}),
    ...(typeof params.numItems === "number"
      ? { num_items: params.numItems }
      : {}),
  });
};

// 12. Schedule
export const trackMetaSchedule = (params?: {
  id?: string;
  name?: string;
}) => {
  fbqTrack("Schedule", {
    ...(params?.id ? { content_ids: [params.id] } : {}),
    ...(params?.name ? { content_name: params.name } : {}),
  });
};

// 13. Search
export const trackMetaSearch = (params: {
  searchString: string;
  contentCategory?: string;
}) => {
  fbqTrack("Search", {
    search_string: params.searchString,
    ...(params.contentCategory
      ? { content_category: params.contentCategory }
      : {}),
  });
};

// 14. StartTrial
export const trackMetaStartTrial = (params?: {
  value?: string | number;
  currency?: string;
  predictedLtv?: string | number;
}) => {
  fbqTrack("StartTrial", {
    value:
      params?.value !== undefined ? Number(params.value).toFixed(2) : "0.00",
    currency: params?.currency ?? "ZAR",
    predicted_ltv:
      params?.predictedLtv !== undefined
        ? Number(params.predictedLtv).toFixed(2)
        : "0.00",
  });
};

// 15. SubmitApplication
export const trackMetaSubmitApplication = (params?: {
  contentName?: string;
}) => {
  fbqTrack("SubmitApplication", {
    ...(params?.contentName ? { content_name: params.contentName } : {}),
  });
};

// 16. Subscribe
export const trackMetaSubscribe = (params?: {
  value?: string | number;
  currency?: string;
  predictedLtv?: string | number;
}) => {
  fbqTrack("Subscribe", {
    value:
      params?.value !== undefined ? Number(params.value).toFixed(2) : "0.00",
    currency: params?.currency ?? "ZAR",
    predicted_ltv:
      params?.predictedLtv !== undefined
        ? Number(params.predictedLtv).toFixed(2)
        : "0.00",
  });
};

// 17. ViewContent
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
