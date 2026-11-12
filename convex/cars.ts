import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import {
  carSubscriptionTierValidator,
  carSellerTypeValidator,
  carListingStatusValidator,
  carConditionValidator,
  fuelTypeValidator,
  transmissionTypeValidator,
} from "./schema";

const CAR_SUBSCRIPTION_PLANS: Record<
  "INDIVIDUAL" | "PREMIUM" | "DEALER",
  { price: number; listingLimit: number; sponsoredLimit: number }
> = {
  INDIVIDUAL: { price: 0, listingLimit: 2, sponsoredLimit: 0 },
  PREMIUM: { price: 199, listingLimit: 10, sponsoredLimit: 2 },
  DEALER: { price: 999, listingLimit: -1, sponsoredLimit: 10 },
};

async function enrichCarListing(ctx: any, listing: any) {
  const images = await ctx.db
    .query("carImages")
    .withIndex("by_car_listing_id", (q: any) =>
      q.eq("carListingId", listing.prismaId)
    )
    .collect();
  images.sort((a: any, b: any) => a.order - b.order);

  const user = await findById(ctx, "users", listing.userId);
  const carSubscription = await findById(
    ctx,
    "carSubscriptions",
    listing.carSubscriptionId
  );

  return {
    ...toPrismaShape(listing)!,
    sponsoredUntil: listing.sponsoredUntil
      ? new Date(listing.sponsoredUntil).toISOString()
      : null,
    images: images.map((img: any) => toPrismaShape(img)!),
    user: user
      ? {
          id: user.prismaId,
          name: user.name,
          picture: user.picture,
          email: user.email,
        }
      : { id: listing.userId, name: "Seller", picture: "", email: "" },
    carSubscription: carSubscription
      ? {
          id: carSubscription.prismaId,
          tier: carSubscription.tier,
          sellerType: carSubscription.sellerType,
          dealerName: carSubscription.dealerName ?? null,
          dealerLogo: carSubscription.dealerLogo ?? null,
          dealerPhone: carSubscription.dealerPhone ?? null,
          dealerAddress: carSubscription.dealerAddress ?? null,
        }
      : {
          tier: "INDIVIDUAL",
          sellerType: "INDIVIDUAL",
          dealerName: null,
          dealerLogo: null,
          dealerPhone: null,
          dealerAddress: null,
        },
  };
}

// ==================== CAR SUBSCRIPTIONS ====================

export const getActiveCarSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db
      .query("carSubscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "ACTIVE")
      )
      .collect();
    if (subs.length === 0) return null;
    subs.sort((a, b) => b.createdAt - a.createdAt);
    return toPrismaShape(subs[0]);
  },
});

export const createCarSubscription = mutation({
  args: {
    userId: v.string(),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userPicture: v.optional(v.string()),
    tier: carSubscriptionTierValidator,
    sellerType: v.optional(carSellerTypeValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("carSubscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "ACTIVE")
      )
      .first();

    if (existing) {
      return { error: "You already have an active car subscription" };
    }

    const plan = CAR_SUBSCRIPTION_PLANS[args.tier];
    if (!plan) {
      return { error: "Invalid subscription tier" };
    }

    const now = Date.now();
    let dbUser = await findById(ctx, "users", args.userId);
    if (!dbUser) {
      await ctx.db.insert("users", {
        prismaId: args.userId,
        name: args.userName || "User",
        email: args.userEmail || "",
        picture: args.userPicture || "",
        role: "USER",
        createdAt: now,
        updatedAt: now,
      });
    }

    const prismaId = generateUuid();
    const endDate =
      args.tier === "INDIVIDUAL" ? undefined : now + 30 * 24 * 60 * 60 * 1000;

    const newId = await ctx.db.insert("carSubscriptions", {
      prismaId,
      tier: args.tier,
      status: args.tier === "INDIVIDUAL" ? "ACTIVE" : "PENDING",
      amount: plan.price,
      currency: "ZAR",
      listingLimit: plan.listingLimit,
      listingsUsed: 0,
      sponsoredLimit: plan.sponsoredLimit,
      sponsoredUsed: 0,
      sellerType: args.sellerType || "INDIVIDUAL",
      isVerified: false,
      startDate: now,
      endDate,
      paymentStatus: args.tier === "INDIVIDUAL" ? "COMPLETE" : "PENDING",
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get(newId);
    return { subscription: toPrismaShape(created) };
  },
});

// ==================== CAR LISTINGS ====================

export const getCarListings = query({
  args: {
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    yearMin: v.optional(v.number()),
    yearMax: v.optional(v.number()),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    mileageMax: v.optional(v.number()),
    fuelType: v.optional(fuelTypeValidator),
    transmission: v.optional(transmissionTypeValidator),
    condition: v.optional(carConditionValidator),
    province: v.optional(v.string()),
    city: v.optional(v.string()),
    bodyType: v.optional(v.string()),
    isSponsored: v.optional(v.boolean()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 20;

    let listings = await ctx.db
      .query("carListings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .collect();

    if (args.make) listings = listings.filter((l) => l.make === args.make);
    if (args.model) {
      const m = args.model.toLowerCase();
      listings = listings.filter((l) => l.model.toLowerCase().includes(m));
    }
    if (args.yearMin !== undefined)
      listings = listings.filter((l) => l.year >= args.yearMin!);
    if (args.yearMax !== undefined)
      listings = listings.filter((l) => l.year <= args.yearMax!);
    if (args.priceMin !== undefined)
      listings = listings.filter((l) => l.price >= args.priceMin!);
    if (args.priceMax !== undefined)
      listings = listings.filter((l) => l.price <= args.priceMax!);
    if (args.mileageMax !== undefined)
      listings = listings.filter((l) => l.mileage <= args.mileageMax!);
    if (args.fuelType)
      listings = listings.filter((l) => l.fuelType === args.fuelType);
    if (args.transmission)
      listings = listings.filter((l) => l.transmission === args.transmission);
    if (args.condition)
      listings = listings.filter((l) => l.condition === args.condition);
    if (args.province)
      listings = listings.filter((l) => l.province === args.province);
    if (args.city) {
      const c = args.city.toLowerCase();
      listings = listings.filter((l) => l.city.toLowerCase().includes(c));
    }
    if (args.bodyType)
      listings = listings.filter((l) => l.bodyType === args.bodyType);
    if (args.isSponsored !== undefined)
      listings = listings.filter((l) => l.isSponsored === args.isSponsored);

    listings.sort((a, b) => {
      if (a.isSponsored !== b.isSponsored) return a.isSponsored ? -1 : 1;
      return b.createdAt - a.createdAt;
    });

    const total = listings.length;
    const paged = listings.slice((page - 1) * limit, page * limit);
    const enriched = await Promise.all(
      paged.map((l) => enrichCarListing(ctx, l))
    );

    return { listings: enriched, total };
  },
});

export const getSponsoredCarListings = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 6 }) => {
    const now = Date.now();
    const listings = await ctx.db
      .query("carListings")
      .withIndex("by_sponsored", (q) =>
        q.eq("isSponsored", true).eq("status", "ACTIVE")
      )
      .collect();

    const valid = listings
      .filter((l) => !l.sponsoredUntil || l.sponsoredUntil >= now)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return await Promise.all(valid.map((l) => enrichCarListing(ctx, l)));
  },
});

export const getCarListingBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const listing = await ctx.db
      .query("carListings")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!listing) return null;
    return await enrichCarListing(ctx, listing);
  },
});

export const incrementCarListingViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const listing = await ctx.db
      .query("carListings")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (listing) {
      await ctx.db.patch(listing._id, {
        views: listing.views + 1,
      });
    }
  },
});

export const getUserCarListings = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const listings = await ctx.db
      .query("carListings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    listings.sort((a, b) => b.createdAt - a.createdAt);
    return await Promise.all(listings.map((l) => enrichCarListing(ctx, l)));
  },
});

export const createCarListing = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    variant: v.optional(v.string()),
    price: v.number(),
    priceNegotiable: v.optional(v.boolean()),
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
    features: v.optional(v.array(v.string())),
    images: v.array(
      v.object({
        url: v.string(),
        isPrimary: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("carSubscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "ACTIVE")
      )
      .collect();

    if (subs.length === 0) {
      return {
        error: "You need an active car subscription to perform this action",
      };
    }

    const subscription = subs[0];
    if (
      subscription.listingLimit !== -1 &&
      subscription.listingsUsed >= subscription.listingLimit
    ) {
      return {
        error:
          "You have reached your listing limit. Upgrade your plan to list more cars.",
      };
    }

    const now = Date.now();
    const baseSlug = `${args.make}-${args.model}-${args.year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${now.toString(36)}`;
    const listingPrismaId = generateUuid();

    const newId = await ctx.db.insert("carListings", {
      prismaId: listingPrismaId,
      title: args.title,
      slug: uniqueSlug,
      description: args.description,
      make: args.make,
      model: args.model,
      year: args.year,
      variant: args.variant,
      price: args.price,
      priceNegotiable: args.priceNegotiable || false,
      mileage: args.mileage,
      fuelType: args.fuelType,
      transmission: args.transmission,
      condition: args.condition,
      bodyType: args.bodyType,
      color: args.color,
      engineSize: args.engineSize,
      drivetrain: args.drivetrain,
      doors: args.doors,
      seats: args.seats,
      vin: args.vin,
      regNumber: args.regNumber,
      province: args.province,
      city: args.city,
      features: args.features || [],
      status: "PENDING",
      views: 0,
      inquiries: 0,
      isFeatured: false,
      isSponsored: false,
      sponsoredViews: 0,
      sponsoredClicks: 0,
      userId: args.userId,
      carSubscriptionId: subscription.prismaId,
      createdAt: now,
      updatedAt: now,
    });

    for (let i = 0; i < args.images.length; i++) {
      await ctx.db.insert("carImages", {
        prismaId: generateUuid(),
        url: args.images[i].url,
        isPrimary: args.images[i].isPrimary || i === 0,
        order: i,
        carListingId: listingPrismaId,
        createdAt: now,
      });
    }

    await ctx.db.patch(subscription._id, {
      listingsUsed: subscription.listingsUsed + 1,
      updatedAt: now,
    });

    const created = await ctx.db.get(newId);
    return { listing: toPrismaShape(created) };
  },
});

export const updateCarListing = mutation({
  args: {
    listingId: v.string(),
    userId: v.string(),
    updates: v.any(),
  },
  handler: async (ctx, { listingId, userId, updates }) => {
    const existing = await findById(ctx, "carListings", listingId);
    if (!existing || existing.userId !== userId) {
      return { error: "Listing not found or unauthorized" };
    }

    const now = Date.now();
    const { images, ...fields } = updates;
    await ctx.db.patch(existing._id, {
      ...fields,
      updatedAt: now,
    });

    if (images && Array.isArray(images) && images.length > 0) {
      const oldImages = await ctx.db
        .query("carImages")
        .withIndex("by_car_listing_id", (q) =>
          q.eq("carListingId", existing.prismaId)
        )
        .collect();
      for (const img of oldImages) {
        await ctx.db.delete(img._id);
      }

      for (let i = 0; i < images.length; i++) {
        await ctx.db.insert("carImages", {
          prismaId: generateUuid(),
          url: images[i].url,
          isPrimary: images[i].isPrimary || i === 0,
          order: i,
          carListingId: existing.prismaId,
          createdAt: now,
        });
      }
    }

    const updated = await ctx.db.get(existing._id);
    return { listing: toPrismaShape(updated) };
  },
});

export const deleteCarListing = mutation({
  args: {
    listingId: v.string(),
    userId: v.string(),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, { listingId, userId, isAdmin }) => {
    const listing = await findById(ctx, "carListings", listingId);
    if (!listing || (!isAdmin && listing.userId !== userId)) {
      return { error: "Listing not found or unauthorized" };
    }

    // Delete images
    const images = await ctx.db
      .query("carImages")
      .withIndex("by_car_listing_id", (q) =>
        q.eq("carListingId", listing.prismaId)
      )
      .collect();
    for (const img of images) {
      await ctx.db.delete(img._id);
    }

    // Delete inquiries
    const inquiries = await ctx.db
      .query("carInquiries")
      .withIndex("by_car_listing_id", (q) =>
        q.eq("carListingId", listing.prismaId)
      )
      .collect();
    for (const inq of inquiries) {
      await ctx.db.delete(inq._id);
    }

    // Decrement subscription listingsUsed
    const sub = await findById(
      ctx,
      "carSubscriptions",
      listing.carSubscriptionId
    );
    if (sub) {
      await ctx.db.patch(sub._id, {
        listingsUsed: Math.max(0, sub.listingsUsed - 1),
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(listing._id);
    return { success: true };
  },
});

export const sponsorCarListing = mutation({
  args: {
    listingId: v.string(),
    userId: v.string(),
    durationDays: v.optional(v.number()),
  },
  handler: async (ctx, { listingId, userId, durationDays = 7 }) => {
    const subs = await ctx.db
      .query("carSubscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "ACTIVE")
      )
      .collect();
    if (subs.length === 0) {
      return { error: "You need an active car subscription" };
    }

    const subscription = subs[0];
    if (subscription.sponsoredUsed >= subscription.sponsoredLimit) {
      return {
        error:
          "You have reached your sponsored ad limit. Upgrade your plan for more sponsored slots.",
      };
    }

    const listing = await findById(ctx, "carListings", listingId);
    if (!listing || listing.userId !== userId) {
      return { error: "Listing not found or unauthorized" };
    }

    if (listing.isSponsored) {
      return { error: "This listing is already sponsored" };
    }

    const now = Date.now();
    const sponsoredUntil = now + durationDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(listing._id, {
      isSponsored: true,
      sponsoredUntil,
      updatedAt: now,
    });

    await ctx.db.patch(subscription._id, {
      sponsoredUsed: subscription.sponsoredUsed + 1,
      updatedAt: now,
    });

    return { success: true };
  },
});

export const createCarInquiry = mutation({
  args: {
    listingId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const listing = await findById(ctx, "carListings", args.listingId);
    if (!listing) return { error: "Listing not found" };

    const now = Date.now();
    await ctx.db.insert("carInquiries", {
      prismaId: generateUuid(),
      carListingId: listing.prismaId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      message: args.message,
      isRead: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(listing._id, {
      inquiries: listing.inquiries + 1,
      updatedAt: now,
    });

    return { success: true };
  },
});

export const getCarInquiries = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const listings = await ctx.db
      .query("carListings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const listingMap = new Map(listings.map((l) => [l.prismaId, l]));
    const results: any[] = [];

    for (const listing of listings) {
      const inquiries = await ctx.db
        .query("carInquiries")
        .withIndex("by_car_listing_id", (q) =>
          q.eq("carListingId", listing.prismaId)
        )
        .collect();
      for (const inq of inquiries) {
        results.push({
          ...toPrismaShape(inq)!,
          carListing: {
            id: listing.prismaId,
            title: listing.title,
            slug: listing.slug,
            make: listing.make,
            model: listing.model,
          },
        });
      }
    }

    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return results;
  },
});

export const markInquiryAsRead = mutation({
  args: { inquiryId: v.string(), userId: v.string() },
  handler: async (ctx, { inquiryId, userId }) => {
    const inquiry = await findById(ctx, "carInquiries", inquiryId);
    if (!inquiry) return { error: "Inquiry not found" };

    const listing = await findById(ctx, "carListings", inquiry.carListingId);
    if (!listing || listing.userId !== userId) {
      return { error: "Inquiry not found or unauthorized" };
    }

    await ctx.db.patch(inquiry._id, {
      isRead: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getFeaturedCars = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const active = await ctx.db
      .query("carListings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .collect();

    const featured = active
      .filter((l) => l.isSponsored || l.isFeatured)
      .sort((a, b) => {
        if (a.isSponsored !== b.isSponsored) return a.isSponsored ? -1 : 1;
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return b.views - a.views;
      })
      .slice(0, limit);

    return await Promise.all(featured.map((l) => enrichCarListing(ctx, l)));
  },
});

export const getCarListingStats = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db
      .query("carSubscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "ACTIVE")
      )
      .collect();
    const subscription = subs[0] ? toPrismaShape(subs[0]) : null;

    const listings = await ctx.db
      .query("carListings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    listings.sort((a, b) => b.views - a.views);

    let unreadInquiries = 0;
    for (const l of listings) {
      const inqs = await ctx.db
        .query("carInquiries")
        .withIndex("by_car_listing_id", (q) =>
          q.eq("carListingId", l.prismaId)
        )
        .collect();
      unreadInquiries += inqs.filter((i) => !i.isRead).length;
    }

    const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
    const totalInquiries = listings.reduce((sum, l) => sum + l.inquiries, 0);
    const activeListings = listings.filter((l) => l.status === "ACTIVE").length;
    const sponsoredListings = listings.filter((l) => l.isSponsored).length;

    const topCars = listings.slice(0, 5).map((car) => ({
      name:
        car.title.length > 25 ? car.title.substring(0, 25) + "..." : car.title,
      views: car.views,
      inquiries: car.inquiries,
    }));

    const statusMap: Record<string, number> = {};
    listings.forEach((car) => {
      statusMap[car.status] = (statusMap[car.status] || 0) + 1;
    });
    const statusDistribution = Object.keys(statusMap).map((key) => ({
      name: key,
      value: statusMap[key],
    }));

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const today = new Date();
    const growthData: { name: string; value: number; fullDate: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      growthData.push({ name: months[d.getMonth()], value: 0, fullDate: d });
    }

    listings.forEach((car) => {
      const d = new Date(car.createdAt);
      const bin = growthData.find(
        (g) =>
          g.fullDate.getMonth() === d.getMonth() &&
          g.fullDate.getFullYear() === d.getFullYear()
      );
      if (bin) bin.value++;
    });

    return {
      subscription,
      totalListings: listings.length,
      activeListings,
      sponsoredListings,
      totalViews,
      totalInquiries,
      unreadInquiries,
      topCars,
      statusDistribution,
      listingsGrowth: growthData.map(({ name, value }) => ({ name, value })),
    };
  },
});

export const getAdminCarListings = query({
  args: { status: v.optional(carListingStatusValidator) },
  handler: async (ctx, { status }) => {
    const listings = status
      ? await ctx.db
          .query("carListings")
          .withIndex("by_status", (q) => q.eq("status", status))
          .collect()
      : await ctx.db.query("carListings").collect();

    listings.sort((a, b) => b.createdAt - a.createdAt);
    return await Promise.all(listings.map((l) => enrichCarListing(ctx, l)));
  },
});

export const updateCarListingStatus = mutation({
  args: {
    listingId: v.string(),
    status: carListingStatusValidator,
  },
  handler: async (ctx, { listingId, status }) => {
    const listing = await findById(ctx, "carListings", listingId);
    if (!listing) return { error: "Listing not found" };

    await ctx.db.patch(listing._id, {
      status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getSponsoredCars = query({
  args: {
    sessionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, limit = 8 }) => {
    const sponsored = await ctx.db
      .query("carListings")
      .withIndex("by_sponsored", (q) =>
        q.eq("isSponsored", true).eq("status", "ACTIVE")
      )
      .collect();

    if (sponsored.length === 0) return [];

    const seed = sessionId || Math.random().toString();
    const shuffled = [...sponsored];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash = hash & hash;
    }
    for (let i = shuffled.length - 1; i > 0; i--) {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      const j = hash % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, limit);
    return await Promise.all(selected.map((c) => enrichCarListing(ctx, c)));
  },
});
