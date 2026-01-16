"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import {
  CarSubscription,
  CarListing,
  CarImage,
  CarSubscriptionTier,
  CarListingStatus,
  CarCondition,
  FuelType,
  TransmissionType,
  CarSellerType,
} from "@prisma/client";
import { getCarSubscriptionPlanByTier } from "@/constants/car-subscription-plans";

// ==================== CAR SUBSCRIPTION QUERIES ====================

export type CarSubscriptionWithListings = CarSubscription & {
  carListings: (CarListing & { images: CarImage[] })[];
};

/**
 * Get user's active car subscription
 */
export const getActiveCarSubscription = async (
  userId?: string
): Promise<CarSubscription | null> => {
  try {
    const user = await currentUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) return null;

    const subscription = await db.carSubscription.findFirst({
      where: {
        userId: targetUserId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    return subscription;
  } catch (error) {
    console.error("Error getting car subscription:", error);
    return null;
  }
};

/**
 * Create or activate a car subscription
 */
export const createCarSubscription = async (
  tier: CarSubscriptionTier,
  sellerType: CarSellerType = "INDIVIDUAL"
): Promise<{ subscription?: CarSubscription; error?: string }> => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthenticated" };
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.carSubscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      return { error: "You already have an active car subscription" };
    }

    const plan = getCarSubscriptionPlanByTier(tier);
    if (!plan) {
      return { error: "Invalid subscription tier" };
    }

    // Ensure user exists in database
    let dbUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: user.id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
          picture: user.imageUrl || "",
          role: "USER",
        },
      });
    }

    // For INDIVIDUAL (free) tier, activate immediately
    const startDate = new Date();
    const endDate =
      tier === "INDIVIDUAL"
        ? null // Free tier doesn't expire
        : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = await db.carSubscription.create({
      data: {
        tier,
        status: tier === "INDIVIDUAL" ? "ACTIVE" : "PENDING",
        amount: plan.price,
        currency: "ZAR",
        listingLimit: plan.listingLimit,
        listingsUsed: 0,
        sponsoredLimit: plan.sponsoredLimit,
        sponsoredUsed: 0,
        sellerType,
        startDate,
        endDate,
        paymentStatus: tier === "INDIVIDUAL" ? "COMPLETE" : "PENDING",
        userId: user.id,
      },
    });

    return { subscription };
  } catch (error) {
    console.error("Error creating car subscription:", error);
    return { error: "Failed to create subscription" };
  }
};

/**
 * Ensure user has active car subscription
 */
export const ensureCarSubscription = async (
  userId: string
): Promise<CarSubscription> => {
  const subscription = await db.carSubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    throw new Error("You need an active car subscription to perform this action");
  }

  return subscription;
};

// ==================== CAR LISTING QUERIES ====================

export type CarListingWithImages = CarListing & {
  images: CarImage[];
  user: { name: string; picture: string };
  carSubscription: { tier: CarSubscriptionTier; sellerType: CarSellerType; dealerName?: string | null };
};

export type CarListingFilters = {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  condition?: CarCondition;
  province?: string;
  city?: string;
  bodyType?: string;
  isSponsored?: boolean;
};

/**
 * Get all active car listings with filters
 */
export const getCarListings = async (
  filters: CarListingFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ listings: CarListingWithImages[]; total: number }> => {
  try {
    const where: any = {
      status: "ACTIVE",
    };

    if (filters.make) where.make = filters.make;
    if (filters.model) where.model = { contains: filters.model, mode: "insensitive" };
    if (filters.yearMin || filters.yearMax) {
      where.year = {};
      if (filters.yearMin) where.year.gte = filters.yearMin;
      if (filters.yearMax) where.year.lte = filters.yearMax;
    }
    if (filters.priceMin || filters.priceMax) {
      where.price = {};
      if (filters.priceMin) where.price.gte = filters.priceMin;
      if (filters.priceMax) where.price.lte = filters.priceMax;
    }
    if (filters.mileageMax) where.mileage = { lte: filters.mileageMax };
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.transmission) where.transmission = filters.transmission;
    if (filters.condition) where.condition = filters.condition;
    if (filters.province) where.province = filters.province;
    if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
    if (filters.bodyType) where.bodyType = filters.bodyType;
    if (filters.isSponsored !== undefined) where.isSponsored = filters.isSponsored;

    const [listings, total] = await Promise.all([
      db.carListing.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" } },
          user: { select: { name: true, picture: true } },
          carSubscription: {
            select: { tier: true, sellerType: true, dealerName: true },
          },
        },
        orderBy: [{ isSponsored: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.carListing.count({ where }),
    ]);

    return { listings: listings as CarListingWithImages[], total };
  } catch (error) {
    console.error("Error getting car listings:", error);
    return { listings: [], total: 0 };
  }
};

/**
 * Get sponsored car listings
 */
export const getSponsoredCarListings = async (
  limit: number = 6
): Promise<CarListingWithImages[]> => {
  try {
    const now = new Date();

    const listings = await db.carListing.findMany({
      where: {
        status: "ACTIVE",
        isSponsored: true,
        OR: [{ sponsoredUntil: null }, { sponsoredUntil: { gte: now } }],
      },
      include: {
        images: { orderBy: { order: "asc" } },
        user: { select: { name: true, picture: true } },
        carSubscription: {
          select: { tier: true, sellerType: true, dealerName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return listings as CarListingWithImages[];
  } catch (error) {
    console.error("Error getting sponsored listings:", error);
    return [];
  }
};

/**
 * Get a single car listing by slug
 */
export const getCarListingBySlug = async (
  slug: string
): Promise<CarListingWithImages | null> => {
  try {
    const listing = await db.carListing.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        user: { select: { name: true, picture: true } },
        carSubscription: {
          select: { tier: true, sellerType: true, dealerName: true },
        },
      },
    });

    // Increment view count
    if (listing) {
      await db.carListing.update({
        where: { id: listing.id },
        data: { views: { increment: 1 } },
      });
    }

    return listing as CarListingWithImages | null;
  } catch (error) {
    console.error("Error getting car listing:", error);
    return null;
  }
};

/**
 * Get user's car listings
 */
export const getUserCarListings = async (): Promise<CarListingWithImages[]> => {
  try {
    const user = await currentUser();

    if (!user) return [];

    const listings = await db.carListing.findMany({
      where: { userId: user.id },
      include: {
        images: { orderBy: { order: "asc" } },
        user: { select: { name: true, picture: true } },
        carSubscription: {
          select: { tier: true, sellerType: true, dealerName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return listings as CarListingWithImages[];
  } catch (error) {
    console.error("Error getting user car listings:", error);
    return [];
  }
};

/**
 * Create a new car listing
 */
export type CreateCarListingInput = {
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  variant?: string;
  price: number;
  priceNegotiable?: boolean;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  condition: CarCondition;
  bodyType?: string;
  color?: string;
  engineSize?: string;
  drivetrain?: string;
  doors?: number;
  seats?: number;
  vin?: string;
  regNumber?: string;
  province: string;
  city: string;
  features?: string[];
  images: { url: string; isPrimary?: boolean }[];
};

export const createCarListing = async (
  input: CreateCarListingInput
): Promise<{ listing?: CarListing; error?: string }> => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthenticated" };
    }

    // Get active subscription
    const subscription = await ensureCarSubscription(user.id);

    // Check listing limit
    if (
      subscription.listingLimit !== -1 &&
      subscription.listingsUsed >= subscription.listingLimit
    ) {
      return {
        error:
          "You have reached your listing limit. Upgrade your plan to list more cars.",
      };
    }

    // Generate slug
    const baseSlug = `${input.make}-${input.model}-${input.year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create listing with images
    const listing = await db.carListing.create({
      data: {
        title: input.title,
        slug: uniqueSlug,
        description: input.description,
        make: input.make,
        model: input.model,
        year: input.year,
        variant: input.variant,
        price: input.price,
        priceNegotiable: input.priceNegotiable || false,
        mileage: input.mileage,
        fuelType: input.fuelType,
        transmission: input.transmission,
        condition: input.condition,
        bodyType: input.bodyType,
        color: input.color,
        engineSize: input.engineSize,
        drivetrain: input.drivetrain,
        doors: input.doors,
        seats: input.seats,
        vin: input.vin,
        regNumber: input.regNumber,
        province: input.province,
        city: input.city,
        features: input.features || [],
        status: "PENDING",
        userId: user.id,
        carSubscriptionId: subscription.id,
        images: {
          create: input.images.map((img, index) => ({
            url: img.url,
            isPrimary: img.isPrimary || index === 0,
            order: index,
          })),
        },
      },
    });

    // Increment listings used
    await db.carSubscription.update({
      where: { id: subscription.id },
      data: { listingsUsed: { increment: 1 } },
    });

    return { listing };
  } catch (error) {
    console.error("Error creating car listing:", error);
    return { error: "Failed to create listing" };
  }
};

/**
 * Update a car listing
 */
export const updateCarListing = async (
  listingId: string,
  input: Partial<CreateCarListingInput>
): Promise<{ listing?: CarListing; error?: string }> => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthenticated" };
    }

    // Verify ownership
    const existingListing = await db.carListing.findFirst({
      where: { id: listingId, userId: user.id },
    });

    if (!existingListing) {
      return { error: "Listing not found or unauthorized" };
    }

    const updateData: any = { ...input };
    delete updateData.images;

    // If features is provided, ensure it's a proper array
    if (input.features) {
      updateData.features = input.features;
    }

    const listing = await db.carListing.update({
      where: { id: listingId },
      data: updateData,
    });

    // Update images if provided
    if (input.images && input.images.length > 0) {
      // Delete existing images
      await db.carImage.deleteMany({ where: { carListingId: listingId } });

      // Create new images
      await db.carImage.createMany({
        data: input.images.map((img, index) => ({
          carListingId: listingId,
          url: img.url,
          isPrimary: img.isPrimary || index === 0,
          order: index,
        })),
      });
    }

    return { listing };
  } catch (error) {
    console.error("Error updating car listing:", error);
    return { error: "Failed to update listing" };
  }
};

/**
 * Delete a car listing
 */
export const deleteCarListing = async (
  listingId: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthenticated" };
    }

    // Verify ownership
    const listing = await db.carListing.findFirst({
      where: { id: listingId, userId: user.id },
      include: { carSubscription: true },
    });

    if (!listing) {
      return { error: "Listing not found or unauthorized" };
    }

    // Delete listing (images cascade)
    await db.carListing.delete({ where: { id: listingId } });

    // Decrement listings used if subscription exists
    if (listing.carSubscription) {
      await db.carSubscription.update({
        where: { id: listing.carSubscriptionId },
        data: {
          listingsUsed: Math.max(0, listing.carSubscription.listingsUsed - 1),
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting car listing:", error);
    return { error: "Failed to delete listing" };
  }
};

/**
 * Sponsor a car listing
 */
export const sponsorCarListing = async (
  listingId: string,
  durationDays: number = 7
): Promise<{ success?: boolean; error?: string }> => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthenticated" };
    }

    // Get subscription
    const subscription = await ensureCarSubscription(user.id);

    // Check sponsored limit
    if (subscription.sponsoredUsed >= subscription.sponsoredLimit) {
      return {
        error:
          "You have reached your sponsored ad limit. Upgrade your plan for more sponsored slots.",
      };
    }

    // Verify ownership
    const listing = await db.carListing.findFirst({
      where: { id: listingId, userId: user.id },
    });

    if (!listing) {
      return { error: "Listing not found or unauthorized" };
    }

    if (listing.isSponsored) {
      return { error: "This listing is already sponsored" };
    }

    const sponsoredUntil = new Date();
    sponsoredUntil.setDate(sponsoredUntil.getDate() + durationDays);

    await db.carListing.update({
      where: { id: listingId },
      data: {
        isSponsored: true,
        sponsoredUntil,
      },
    });

    await db.carSubscription.update({
      where: { id: subscription.id },
      data: { sponsoredUsed: { increment: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("Error sponsoring listing:", error);
    return { error: "Failed to sponsor listing" };
  }
};

/**
 * Create a car inquiry
 */
export const createCarInquiry = async (
  listingId: string,
  data: { name: string; email: string; phone?: string; message: string }
): Promise<{ success?: boolean; error?: string }> => {
  try {
    const listing = await db.carListing.findUnique({ where: { id: listingId } });

    if (!listing) {
      return { error: "Listing not found" };
    }

    await db.carInquiry.create({
      data: {
        carListingId: listingId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      },
    });

    // Increment inquiries count
    await db.carListing.update({
      where: { id: listingId },
      data: { inquiries: { increment: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return { error: "Failed to send inquiry" };
  }
};

/**
 * Get inquiries for user's listings
 */
export const getCarInquiries = async () => {
  try {
    const user = await currentUser();

    if (!user) return [];

    const inquiries = await db.carInquiry.findMany({
      where: {
        carListing: { userId: user.id },
      },
      include: {
        carListing: {
          select: { id: true, title: true, slug: true, make: true, model: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return inquiries;
  } catch (error) {
    console.error("Error getting inquiries:", error);
    return [];
  }
};

/**
 * Mark inquiry as read
 */
export const markInquiryAsRead = async (
  inquiryId: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthenticated" };
    }

    // Verify ownership through listing
    const inquiry = await db.carInquiry.findFirst({
      where: { id: inquiryId },
      include: { carListing: true },
    });

    if (!inquiry || inquiry.carListing.userId !== user.id) {
      return { error: "Inquiry not found or unauthorized" };
    }

    await db.carInquiry.update({
      where: { id: inquiryId },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking inquiry as read:", error);
    return { error: "Failed to update inquiry" };
  }
};

/**
 * Get featured cars for homepage
 */
export const getFeaturedCars = async (
  limit: number = 8
): Promise<CarListingWithImages[]> => {
  try {
    const listings = await db.carListing.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ isSponsored: true }, { isFeatured: true }],
      },
      include: {
        images: { orderBy: { order: "asc" } },
        user: { select: { name: true, picture: true } },
        carSubscription: {
          select: { tier: true, sellerType: true, dealerName: true },
        },
      },
      orderBy: [{ isSponsored: "desc" }, { isFeatured: "desc" }, { views: "desc" }],
      take: limit,
    });

    return listings as CarListingWithImages[];
  } catch (error) {
    console.error("Error getting featured cars:", error);
    return [];
  }
};

/**
 * Get car listing statistics for dashboard
 */
export const getCarListingStats = async () => {
  try {
    const user = await currentUser();

    if (!user) return null;

    const [subscription, listings, inquiries] = await Promise.all([
      db.carSubscription.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
      }),
      db.carListing.findMany({
        where: { userId: user.id },
        select: { views: true, inquiries: true, status: true, isSponsored: true },
      }),
      db.carInquiry.count({
        where: { carListing: { userId: user.id }, isRead: false },
      }),
    ]);

    const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
    const totalInquiries = listings.reduce((sum, l) => sum + l.inquiries, 0);
    const activeListings = listings.filter((l) => l.status === "ACTIVE").length;
    const sponsoredListings = listings.filter((l) => l.isSponsored).length;

    return {
      subscription,
      totalListings: listings.length,
      activeListings,
      sponsoredListings,
      totalViews,
      totalInquiries,
      unreadInquiries: inquiries,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return null;
  }
};
