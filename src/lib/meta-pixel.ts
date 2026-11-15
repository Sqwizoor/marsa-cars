declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = "1121730653781517";

const ensureFbq = () => {
  if (typeof window === "undefined") return null;
  if (typeof window.fbq === "function") return window.fbq;

  const n: ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    queue: unknown[][];
    push?: unknown;
    loaded?: boolean;
    version?: string;
  } = function (...args: unknown[]) {
    if (n.callMethod) {
      n.callMethod(...args);
    } else {
      n.queue.push(args);
    }
  };
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  window.fbq = n;

  const t = document.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";
  const s = document.getElementsByTagName("script")[0];
  if (s && s.parentNode) {
    s.parentNode.insertBefore(t, s);
  } else {
    document.head.appendChild(t);
  }

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");

  return window.fbq;
};

export const fbqTrack = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  const fbq = ensureFbq();
  if (fbq) {
    if (params && Object.keys(params).length > 0) {
      fbq("track", eventName, params);
    } else {
      fbq("track", eventName);
    }
  }
};

export const fbqTrackCustom = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  const fbq = ensureFbq();
  if (fbq) {
    if (params && Object.keys(params).length > 0) {
      fbq("trackCustom", eventName, params);
    } else {
      fbq("trackCustom", eventName);
    }
  }
};

export const BMW_1L_PRODUCT_SLUG =
  "original-bmw-twinpower-turbo-sae-0w30-longlife-19fe-1l-1794476810626";
export const BMW_1L_VARIANT_SLUG =
  "bmw-twinpower-turbo-0w30-1l-1794476810626";
export const BMW_TWIN_PACK_PRODUCT_SLUG = "bmw-0w30-twin-pack";
export const BMW_TWIN_PACK_VARIANT_SLUG = "bmw-0w30-2l-offer";

export const getBmwLandingPageEventName = (
  productSlug?: string,
  variantSlug?: string
): "BMW_0W30_1L_LandingPage" | "BMW_0W30_TwinPack_LandingPage" | null => {
  if (
    productSlug === BMW_1L_PRODUCT_SLUG ||
    variantSlug === BMW_1L_VARIANT_SLUG
  ) {
    return "BMW_0W30_1L_LandingPage";
  }
  if (
    productSlug === BMW_TWIN_PACK_PRODUCT_SLUG ||
    variantSlug === BMW_TWIN_PACK_VARIANT_SLUG
  ) {
    return "BMW_0W30_TwinPack_LandingPage";
  }
  return null;
};

export const trackMetaLandingPage = (params: {
  productSlug: string;
  variantSlug: string;
  productId?: string;
  name?: string;
  price?: number;
}) => {
  const specificEvent = getBmwLandingPageEventName(
    params.productSlug,
    params.variantSlug
  );
  if (!specificEvent) return;

  if (typeof window !== "undefined") {
    const w = window as unknown as { __bmwLandingTracked?: string };
    if (w.__bmwLandingTracked === params.variantSlug) return;
    w.__bmwLandingTracked = params.variantSlug;
  }

  const payload: Record<string, unknown> = {
    page_type: "landing_page",
    product_slug: params.productSlug,
    variant_slug: params.variantSlug,
    ...(params.productId ? { content_ids: [params.productId] } : {}),
    ...(params.name ? { content_name: params.name } : {}),
    content_type: "product",
    ...(typeof params.price === "number"
      ? { value: params.price, currency: "ZAR" }
      : {}),
  };

  fbqTrackCustom("LandingPageView", payload);
  fbqTrackCustom(specificEvent, payload);
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
