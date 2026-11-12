import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ==================== ENUM VALIDATORS ====================

export const roleValidator = v.union(
  v.literal("USER"),
  v.literal("ADMIN"),
  v.literal("SELLER"),
  v.literal("ADVERTISER")
);

export const subscriptionTierValidator = v.union(
  v.literal("BRONZE"),
  v.literal("SILVER"),
  v.literal("GOLD")
);

export const subscriptionStatusValidator = v.union(
  v.literal("ACTIVE"),
  v.literal("EXPIRED"),
  v.literal("CANCELLED"),
  v.literal("PENDING"),
  v.literal("TRIALING")
);

export const storeStatusValidator = v.union(
  v.literal("PENDING"),
  v.literal("ACTIVE"),
  v.literal("BANNED"),
  v.literal("DISABLED")
);

export const shippingFeeMethodValidator = v.union(
  v.literal("ITEM"),
  v.literal("WEIGHT"),
  v.literal("FIXED")
);

export const orderStatusValidator = v.union(
  v.literal("Pending"),
  v.literal("Confirmed"),
  v.literal("Processing"),
  v.literal("Shipped"),
  v.literal("OutforDelivery"),
  v.literal("Delivered"),
  v.literal("Cancelled"),
  v.literal("Failed"),
  v.literal("Refunded"),
  v.literal("Returned"),
  v.literal("PartiallyShipped"),
  v.literal("OnHold")
);

export const paymentStatusValidator = v.union(
  v.literal("Pending"),
  v.literal("Paid"),
  v.literal("Failed"),
  v.literal("Declined"),
  v.literal("Cancelled"),
  v.literal("Refunded"),
  v.literal("PartiallyRefunded"),
  v.literal("Chargeback")
);

export const paymentMethodValidator = v.union(
  v.literal("Paypal"),
  v.literal("Stripe"),
  v.literal("PayFast")
);

export const productStatusValidator = v.union(
  v.literal("Pending"),
  v.literal("Processing"),
  v.literal("ReadyForShipment"),
  v.literal("Shipped"),
  v.literal("Delivered"),
  v.literal("Canceled"),
  v.literal("Returned"),
  v.literal("Refunded"),
  v.literal("FailedDelivery"),
  v.literal("OnHold"),
  v.literal("Backordered"),
  v.literal("PartiallyShipped"),
  v.literal("ExchangeRequested"),
  v.literal("AwaitingPickup")
);

export const productApprovalStatusValidator = v.union(
  v.literal("PENDING"),
  v.literal("APPROVED"),
  v.literal("REJECTED")
);

export const threadStatusValidator = v.union(
  v.literal("OPEN"),
  v.literal("CLOSED"),
  v.literal("PINNED"),
  v.literal("LOCKED")
);

export const postStatusValidator = v.union(
  v.literal("ACTIVE"),
  v.literal("EDITED"),
  v.literal("DELETED"),
  v.literal("HIDDEN")
);

export const reactionTypeValidator = v.union(
  v.literal("LIKE"),
  v.literal("HELPFUL"),
  v.literal("THANKS"),
  v.literal("INFORMATIVE"),
  v.literal("FUNNY"),
  v.literal("AGREE"),
  v.literal("DISAGREE")
);

export const badgeTypeValidator = v.union(
  v.literal("NEWBIE"),
  v.literal("MEMBER"),
  v.literal("VETERAN"),
  v.literal("EXPERT"),
  v.literal("LEGEND"),
  v.literal("MODERATOR"),
  v.literal("CONTRIBUTOR"),
  v.literal("HELPER"),
  v.literal("ENTHUSIAST"),
  v.literal("TECH_GURU"),
  v.literal("PARTS_SPECIALIST")
);

export const reportStatusValidator = v.union(
  v.literal("PENDING"),
  v.literal("REVIEWED"),
  v.literal("RESOLVED"),
  v.literal("DISMISSED")
);

export const reportReasonValidator = v.union(
  v.literal("SPAM"),
  v.literal("HARASSMENT"),
  v.literal("INAPPROPRIATE"),
  v.literal("OFF_TOPIC"),
  v.literal("DUPLICATE"),
  v.literal("MISINFORMATION"),
  v.literal("OTHER")
);

export const carSubscriptionTierValidator = v.union(
  v.literal("INDIVIDUAL"),
  v.literal("PREMIUM"),
  v.literal("DEALER")
);

export const carSubscriptionStatusValidator = v.union(
  v.literal("ACTIVE"),
  v.literal("EXPIRED"),
  v.literal("CANCELLED"),
  v.literal("PENDING")
);

export const carListingStatusValidator = v.union(
  v.literal("DRAFT"),
  v.literal("PENDING"),
  v.literal("ACTIVE"),
  v.literal("SOLD"),
  v.literal("EXPIRED"),
  v.literal("REJECTED")
);

export const carConditionValidator = v.union(
  v.literal("NEW"),
  v.literal("USED"),
  v.literal("CERTIFIED_PRE_OWNED")
);

export const fuelTypeValidator = v.union(
  v.literal("PETROL"),
  v.literal("DIESEL"),
  v.literal("ELECTRIC"),
  v.literal("HYBRID"),
  v.literal("PLUGIN_HYBRID"),
  v.literal("LPG"),
  v.literal("OTHER")
);

export const transmissionTypeValidator = v.union(
  v.literal("MANUAL"),
  v.literal("AUTOMATIC"),
  v.literal("SEMI_AUTOMATIC"),
  v.literal("CVT")
);

export const carSellerTypeValidator = v.union(
  v.literal("INDIVIDUAL"),
  v.literal("DEALER")
);

// ==================== CONVEX SCHEMA ====================

export default defineSchema({
  // 1. User
  users: defineTable({
    prismaId: v.string(), // Clerk userId or UUID from Neon
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    role: roleValidator,
    memberOfStoreIds: v.optional(v.array(v.string())),
    followingStoreIds: v.optional(v.array(v.string())),
    couponIds: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_created_at", ["createdAt"]),

  // 2. Category
  categories: defineTable({
    prismaId: v.string(),
    name: v.string(),
    image: v.string(),
    url: v.string(),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_url", ["url"])
    .index("by_name", ["name"])
    .index("by_featured", ["featured"])
    .index("by_updated_at", ["updatedAt"]),

  // 3. SubCategory
  subCategories: defineTable({
    prismaId: v.string(),
    name: v.string(),
    image: v.string(),
    url: v.string(),
    featured: v.boolean(),
    categoryId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_url", ["url"])
    .index("by_name", ["name"])
    .index("by_category_id", ["categoryId"])
    .index("by_featured", ["featured"])
    .index("by_updated_at", ["updatedAt"]),

  // 4. Store
  stores: defineTable({
    prismaId: v.string(),
    name: v.string(),
    description: v.string(),
    email: v.string(),
    phone: v.string(),
    url: v.string(),
    logo: v.string(),
    cover: v.string(),
    status: storeStatusValidator,
    averageRating: v.number(),
    numReviews: v.number(),
    featured: v.boolean(),
    returnPolicy: v.string(),
    defaultShippingService: v.string(),
    defaultShippingFeePerItem: v.number(),
    defaultShippingFeeForAdditionalItem: v.number(),
    defaultShippingFeePerKg: v.number(),
    defaultShippingFeeFixed: v.number(),
    defaultDeliveryTimeMin: v.number(),
    defaultDeliveryTimeMax: v.number(),
    userId: v.string(),
    memberIds: v.optional(v.array(v.string())),
    followerIds: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_url", ["url"])
    .index("by_email", ["email"])
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_featured", ["featured"]),

  // 5. Product
  products: defineTable({
    prismaId: v.string(),
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    brand: v.string(),
    rating: v.number(),
    sales: v.number(),
    numReviews: v.number(),
    shippingFeeMethod: shippingFeeMethodValidator,
    views: v.number(),
    freeShippingForAllCountries: v.boolean(),
    storeId: v.string(),
    categoryId: v.string(),
    subCategoryId: v.string(),
    offerTagId: v.optional(v.string()),
    status: productApprovalStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_slug", ["slug"])
    .index("by_store_id", ["storeId"])
    .index("by_category_id", ["categoryId"])
    .index("by_sub_category_id", ["subCategoryId"])
    .index("by_offer_tag_id", ["offerTagId"])
    .index("by_status", ["status"])
    .index("by_sales", ["sales"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["status", "categoryId", "subCategoryId", "storeId"],
    }),

  // 6. ProductVariant
  productVariants: defineTable({
    prismaId: v.string(),
    variantName: v.optional(v.string()),
    variantDescription: v.optional(v.string()),
    variantImage: v.optional(v.string()),
    slug: v.string(),
    isSale: v.boolean(),
    saleEndDate: v.optional(v.string()),
    sku: v.string(),
    keywords: v.string(),
    sales: v.number(),
    weight: v.number(),
    productId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_slug", ["slug"])
    .index("by_product_id", ["productId"]),

  // 7. Size
  sizes: defineTable({
    prismaId: v.string(),
    size: v.string(),
    quantity: v.number(),
    price: v.number(),
    discount: v.number(),
    productVariantId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_variant_id", ["productVariantId"])
    .index("by_size", ["size"]),

  // 8. ProductVariantImage
  productVariantImages: defineTable({
    prismaId: v.string(),
    url: v.string(),
    alt: v.string(),
    order: v.optional(v.number()),
    productVariantId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_variant_id", ["productVariantId"]),

  // 9. Color
  colors: defineTable({
    prismaId: v.string(),
    name: v.string(),
    productVariantId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_variant_id", ["productVariantId"]),

  // 10. OfferTag
  offerTags: defineTable({
    prismaId: v.string(),
    name: v.string(),
    url: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_url", ["url"])
    .index("by_name", ["name"]),

  // 11. Spec
  specs: defineTable({
    prismaId: v.string(),
    name: v.string(),
    value: v.string(),
    productId: v.optional(v.string()),
    variantId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_product_id", ["productId"])
    .index("by_variant_id", ["variantId"]),

  // 12. Question
  questions: defineTable({
    prismaId: v.string(),
    question: v.string(),
    answer: v.string(),
    productId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_product_id", ["productId"]),

  // 13. Country
  countries: defineTable({
    prismaId: v.string(),
    name: v.string(),
    code: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_name", ["name"])
    .index("by_code", ["code"]),

  // 14. ShippingRate
  shippingRates: defineTable({
    prismaId: v.string(),
    shippingService: v.string(),
    shippingFeePerItem: v.number(),
    shippingFeeForAdditionalItem: v.number(),
    shippingFeePerKg: v.number(),
    shippingFeeFixed: v.number(),
    deliveryTimeMin: v.number(),
    deliveryTimeMax: v.number(),
    returnPolicy: v.string(),
    countryId: v.string(),
    storeId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_country_id", ["countryId"])
    .index("by_store_id", ["storeId"])
    .index("by_store_country", ["storeId", "countryId"]),

  // 15. FreeShipping
  freeShippings: defineTable({
    prismaId: v.string(),
    productId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_product_id", ["productId"]),

  // 16. FreeShippingCountry
  freeShippingCountries: defineTable({
    prismaId: v.string(),
    freeShippingId: v.string(),
    countryId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_free_shipping_id", ["freeShippingId"])
    .index("by_country_id", ["countryId"]),

  // 17. Review
  reviews: defineTable({
    prismaId: v.string(),
    variant: v.string(),
    review: v.string(),
    rating: v.number(),
    color: v.string(),
    size: v.string(),
    quantity: v.string(),
    likes: v.number(),
    userId: v.string(),
    productId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_product_id", ["productId"])
    .index("by_product_user", ["productId", "userId"]),

  // 18. ReviewImage
  reviewImages: defineTable({
    prismaId: v.string(),
    url: v.string(),
    alt: v.string(),
    reviewId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_review_id", ["reviewId"]),

  // 19. Cart
  carts: defineTable({
    prismaId: v.string(),
    userId: v.string(),
    couponId: v.optional(v.string()),
    shippingFees: v.number(),
    subTotal: v.number(),
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_coupon_id", ["couponId"]),

  // 20. CartItem
  cartItems: defineTable({
    prismaId: v.string(),
    productId: v.string(),
    variantId: v.string(),
    sizeId: v.string(),
    productSlug: v.string(),
    variantSlug: v.string(),
    sku: v.string(),
    name: v.string(),
    image: v.string(),
    size: v.string(),
    price: v.number(),
    quantity: v.number(),
    shippingFee: v.number(),
    totalPrice: v.number(),
    cartId: v.string(),
    storeId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_cart_id", ["cartId"])
    .index("by_store_id", ["storeId"]),

  // 21. ShippingAddress
  shippingAddresses: defineTable({
    prismaId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    address1: v.string(),
    address2: v.optional(v.string()),
    state: v.string(),
    city: v.string(),
    zip_code: v.string(),
    default: v.boolean(),
    userId: v.string(),
    countryId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_country_id", ["countryId"]),

  // 22. Order
  orders: defineTable({
    prismaId: v.string(),
    shippingFees: v.number(),
    subTotal: v.number(),
    total: v.number(),
    orderStatus: orderStatusValidator,
    paymentStatus: paymentStatusValidator,
    paymentMethod: v.optional(paymentMethodValidator),
    shippingAddressId: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_order_status", ["orderStatus"])
    .index("by_created_at", ["createdAt"]),

  // 23. OrderGroup
  orderGroups: defineTable({
    prismaId: v.string(),
    status: orderStatusValidator,
    shippingService: v.string(),
    shippingDeliveryMin: v.number(),
    shippingDeliveryMax: v.number(),
    shippingFees: v.number(),
    subTotal: v.number(),
    total: v.number(),
    orderId: v.string(),
    storeId: v.string(),
    couponId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_order_id", ["orderId"])
    .index("by_store_id", ["storeId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // 24. OrderItem
  orderItems: defineTable({
    prismaId: v.string(),
    productId: v.string(),
    variantId: v.string(),
    sizeId: v.string(),
    productSlug: v.string(),
    variantSlug: v.string(),
    sku: v.string(),
    name: v.string(),
    image: v.string(),
    size: v.string(),
    quantity: v.number(),
    shippingFee: v.number(),
    price: v.number(),
    totalPrice: v.number(),
    orderGroupId: v.string(),
    status: productStatusValidator,
    storeId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_order_group_id", ["orderGroupId"])
    .index("by_product_id", ["productId"]),

  // 25. Wishlist
  wishlists: defineTable({
    prismaId: v.string(),
    userId: v.string(),
    productId: v.string(),
    variantId: v.string(),
    sizeId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_product_id", ["productId"])
    .index("by_variant_id", ["variantId"]),

  // 26. Coupon
  coupons: defineTable({
    prismaId: v.string(),
    code: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    discount: v.number(),
    storeId: v.string(),
    userIds: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_code", ["code"])
    .index("by_store_id", ["storeId"]),

  // 27. PaymentDetails
  paymentDetails: defineTable({
    prismaId: v.string(),
    paymentInetntId: v.string(),
    paymentMethod: v.string(),
    status: v.string(),
    amount: v.number(),
    currency: v.string(),
    orderId: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_order_id", ["orderId"])
    .index("by_user_id", ["userId"]),

  // 28. Subscription (Seller / Advertiser Subscription)
  subscriptions: defineTable({
    prismaId: v.string(),
    tier: subscriptionTierValidator,
    status: subscriptionStatusValidator,
    amount: v.number(),
    currency: v.string(),
    adLimit: v.number(),
    adsUsed: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    userId: v.string(),
    isTrial: v.boolean(),
    trialEndsAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // 29. StoreApplication
  storeApplications: defineTable({
    prismaId: v.string(),
    userId: v.string(),
    data: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"]),

  // 30. Advertisement
  advertisements: defineTable({
    prismaId: v.string(),
    title: v.string(),
    description: v.string(),
    image: v.optional(v.string()),
    url: v.optional(v.string()),
    isActive: v.boolean(),
    views: v.number(),
    clicks: v.number(),
    targetCategory: v.optional(v.string()),
    targetSubCategory: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"])
    .index("by_category", ["targetCategory"]),

  // 31. ForumCategory
  forumCategories: defineTable({
    prismaId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),

  // 32. ForumSubforum
  forumSubforums: defineTable({
    prismaId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    categoryId: v.string(),
    threadCount: v.number(),
    postCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_slug", ["slug"])
    .index("by_category_id", ["categoryId"])
    .index("by_order", ["order"]),

  // 33. ForumThread
  forumThreads: defineTable({
    prismaId: v.string(),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    status: threadStatusValidator,
    views: v.number(),
    isPinned: v.boolean(),
    isLocked: v.boolean(),
    isFeatured: v.boolean(),
    isAnnouncement: v.boolean(),
    tags: v.array(v.string()),
    authorId: v.string(),
    categoryId: v.string(),
    subforumId: v.optional(v.string()),
    postCount: v.number(),
    lastPostAt: v.number(),
    lastPostById: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_slug", ["slug"])
    .index("by_author_id", ["authorId"])
    .index("by_category_id", ["categoryId"])
    .index("by_subforum_id", ["subforumId"])
    .index("by_last_post_at", ["lastPostAt"])
    .index("by_views", ["views"])
    .searchIndex("search_threads", {
      searchField: "title",
      filterFields: ["categoryId", "subforumId", "status"],
    }),

  // 34. ForumPost
  forumPosts: defineTable({
    prismaId: v.string(),
    content: v.string(),
    status: postStatusValidator,
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    isAcceptedAnswer: v.boolean(),
    authorId: v.string(),
    threadId: v.string(),
    parentPostId: v.optional(v.string()),
    reactionCount: v.number(),
    replyCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_author_id", ["authorId"])
    .index("by_thread_id", ["threadId"])
    .index("by_parent_post_id", ["parentPostId"])
    .index("by_created_at", ["createdAt"]),

  // 35. ForumReaction
  forumReactions: defineTable({
    prismaId: v.string(),
    type: reactionTypeValidator,
    userId: v.string(),
    postId: v.string(),
    createdAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_post_id", ["postId"])
    .index("by_user_post_type", ["userId", "postId", "type"]),

  // 36. ForumBookmark
  forumBookmarks: defineTable({
    prismaId: v.string(),
    userId: v.string(),
    threadId: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_thread_id", ["threadId"])
    .index("by_user_thread", ["userId", "threadId"]),

  // 37. ForumReport
  forumReports: defineTable({
    prismaId: v.string(),
    reason: reportReasonValidator,
    status: reportStatusValidator,
    description: v.optional(v.string()),
    reporterId: v.string(),
    threadId: v.optional(v.string()),
    postId: v.optional(v.string()),
    reviewedById: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    moderatorNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_reporter_id", ["reporterId"])
    .index("by_thread_id", ["threadId"])
    .index("by_post_id", ["postId"])
    .index("by_status", ["status"]),

  // 38. ForumModerator
  forumModerators: defineTable({
    prismaId: v.string(),
    userId: v.string(),
    categoryId: v.optional(v.string()),
    subforumId: v.optional(v.string()),
    canPin: v.boolean(),
    canLock: v.boolean(),
    canDelete: v.boolean(),
    canBan: v.boolean(),
    assignedAt: v.number(),
    assignedBy: v.optional(v.string()),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_category_id", ["categoryId"])
    .index("by_subforum_id", ["subforumId"]),

  // 39. ForumBadge
  forumBadges: defineTable({
    prismaId: v.string(),
    type: badgeTypeValidator,
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    userId: v.string(),
    earnedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_type", ["type"]),

  // 40. ForumUserStats
  forumUserStats: defineTable({
    prismaId: v.string(),
    userId: v.string(),
    threadCount: v.number(),
    postCount: v.number(),
    reactionCount: v.number(),
    helpfulCount: v.number(),
    reputation: v.number(),
    totalViews: v.number(),
    lastActiveAt: v.number(),
    acceptedAnswers: v.number(),
    bestAnswers: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_reputation", ["reputation"]),

  // 41. CarSubscription
  carSubscriptions: defineTable({
    prismaId: v.string(),
    tier: carSubscriptionTierValidator,
    status: carSubscriptionStatusValidator,
    amount: v.number(),
    currency: v.string(),
    listingLimit: v.number(),
    listingsUsed: v.number(),
    sponsoredLimit: v.number(),
    sponsoredUsed: v.number(),
    sellerType: carSellerTypeValidator,
    isVerified: v.boolean(),
    dealerName: v.optional(v.string()),
    dealerLicense: v.optional(v.string()),
    dealerAddress: v.optional(v.string()),
    dealerPhone: v.optional(v.string()),
    dealerLogo: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // 42. CarListing
  carListings: defineTable({
    prismaId: v.string(),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    variant: v.optional(v.string()),
    price: v.number(),
    priceNegotiable: v.boolean(),
    mileage: v.number(),
    fuelType: fuelTypeValidator,
    transmission: transmissionTypeValidator,
    condition: carConditionValidator,
    bodyType: v.optional(v.string()),
    color: v.optional(v.string()),
    engineSize: v.optional(v.string()),
    drivetrain: v.optional(v.string()),
    doors: v.optional(v.number()),
    seats: v.optional(v.number()),
    vin: v.optional(v.string()),
    regNumber: v.optional(v.string()),
    province: v.string(),
    city: v.string(),
    features: v.optional(v.any()),
    status: carListingStatusValidator,
    views: v.number(),
    inquiries: v.number(),
    isFeatured: v.boolean(),
    isSponsored: v.boolean(),
    sponsoredUntil: v.optional(v.number()),
    sponsoredViews: v.number(),
    sponsoredClicks: v.number(),
    userId: v.string(),
    carSubscriptionId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_slug", ["slug"])
    .index("by_user_id", ["userId"])
    .index("by_subscription_id", ["carSubscriptionId"])
    .index("by_status", ["status"])
    .index("by_make", ["make"])
    .index("by_province", ["province"])
    .index("by_sponsored", ["isSponsored", "status"]),

  // 43. CarImage
  carImages: defineTable({
    prismaId: v.string(),
    url: v.string(),
    isPrimary: v.boolean(),
    order: v.number(),
    carListingId: v.string(),
    createdAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_car_listing_id", ["carListingId"]),

  // 44. CarInquiry
  carInquiries: defineTable({
    prismaId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    isRead: v.boolean(),
    carListingId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_car_listing_id", ["carListingId"])
    .index("by_is_read", ["isRead"]),

  // 45. Article
  articles: defineTable({
    prismaId: v.string(),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    coverImage: v.string(),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    tags: v.array(v.string()),
    views: v.number(),
    authorId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_author_id", ["authorId"]),

  // 46. PartRequest
  partRequests: defineTable({
    prismaId: v.string(),
    partName: v.string(),
    partNumber: v.optional(v.string()),
    vehicleDetails: v.string(),
    userName: v.string(),
    contactInfo: v.string(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // 47. ShipmentTracking (Bob Go Order Tracking)
  shipmentTrackings: defineTable({
    prismaId: v.string(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_order_id", ["orderId"])
    .index("by_order_group_id", ["orderGroupId"])
    .index("by_tracking_reference", ["trackingReference"]),
});
