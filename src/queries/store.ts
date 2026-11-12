"use server";

// DB
import { db } from "@/lib/db";
import { api, convexMutation, convexQuery, isConvexEnabled } from "@/lib/convex";
import {
  StoreDefaultShippingType,
  StoreStatus,
  StoreType,
} from "@/lib/types";
import { ensureSellerSubscription } from "@/lib/subscription-guard";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Prisma models
import { ShippingRate, Store } from "@prisma/client";

const normalizeStoreUrl = (storeUrl: string) => {
  try {
    return decodeURIComponent(storeUrl).trim();
  } catch {
    return storeUrl.trim();
  }
};

export type UpsertStoreResult =
  | { store: Store; error?: undefined }
  | { store?: undefined; error: string };

export const upsertStore = async (store: Store): Promise<UpsertStoreResult> => {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unauthenticated." };

    await ensureSellerSubscription(user.id);

    if (!store) return { error: "Please provide store data." };

    if (isConvexEnabled()) {
      return await convexMutation(api.stores.upsertStore, {
        store: {
          id: store.id,
          name: store.name,
          description: store.description,
          email: store.email,
          phone: store.phone,
          url: store.url,
          logo: store.logo,
          cover: store.cover,
          status: store.status,
          featured: store.featured,
          returnPolicy: store.returnPolicy,
          defaultShippingService: store.defaultShippingService,
          defaultShippingFeePerItem: store.defaultShippingFeePerItem,
          defaultShippingFeeForAdditionalItem: store.defaultShippingFeeForAdditionalItem,
          defaultShippingFeePerKg: store.defaultShippingFeePerKg,
          defaultShippingFeeFixed: store.defaultShippingFeeFixed,
          defaultDeliveryTimeMin: store.defaultDeliveryTimeMin,
          defaultDeliveryTimeMax: store.defaultDeliveryTimeMax,
        },
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        userEmail: user.emailAddresses[0]?.emailAddress || "",
        userPicture: user.imageUrl || "",
      });
    }

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
          role: (user.privateMetadata.role as "USER" | "ADMIN" | "SELLER") || "USER",
        },
      });
    }

    const existingStore = await db.store.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: store.name },
              { email: store.email },
              { phone: store.phone },
              { url: store.url },
            ],
          },
          {
            NOT: {
              id: store.id,
            },
          },
        ],
      },
    });

    if (existingStore) {
      let errorMessage = "";
      if (existingStore.name === store.name) {
        errorMessage = "A store with the same name already exists";
      } else if (existingStore.email === store.email) {
        errorMessage = "A store with the same email already exists";
      } else if (existingStore.phone === store.phone) {
        errorMessage = "A store with the same phone number already exists";
      } else if (existingStore.url === store.url) {
        errorMessage = "A store with the same URL already exists";
      }
      return { error: errorMessage };
    }

    const storeDetails = await db.store.upsert({
      where: {
        id: store.id,
      },
      update: store,
      create: {
        ...store,
        user: {
          connect: { id: user.id },
        },
        userId: undefined,
      },
    });

    return { store: storeDetails };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not create the store. Please try again.";
    return { error: message };
  }
};

export const getStoreDefaultShippingDetails = async (storeUrl: string) => {
  try {
    if (!storeUrl) throw new Error("Store URL is required.");
    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

    if (isConvexEnabled()) {
      return await convexQuery(api.stores.getStoreDefaultShippingDetails, {
        storeUrl: normalizedStoreUrl,
      });
    }

    const store = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
      },
      select: {
        defaultShippingService: true,
        defaultShippingFeePerItem: true,
        defaultShippingFeeForAdditionalItem: true,
        defaultShippingFeePerKg: true,
        defaultShippingFeeFixed: true,
        defaultDeliveryTimeMin: true,
        defaultDeliveryTimeMax: true,
        returnPolicy: true,
      },
    });

    if (!store) throw new Error("Store not found.");

    return store;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateStoreDefaultShippingDetails = async (
  storeUrl: string,
  details: StoreDefaultShippingType
) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    await ensureSellerSubscription(user.id);

    if (!storeUrl) throw new Error("Store URL is required.");
    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

    if (!details) {
      throw new Error("No shipping details provided to update.");
    }

    if (isConvexEnabled()) {
      return await convexMutation(api.stores.updateStoreDefaultShippingDetails, {
        storeUrl: normalizedStoreUrl,
        details,
        userId: user.id,
        isAdmin: user.privateMetadata?.role === "ADMIN",
      });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdmin = user.privateMetadata?.role === "ADMIN" || dbUser?.role === "ADMIN";

    const check_ownership = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
        ...(!isAdmin && {
          OR: [{ userId: user.id }, { members: { some: { id: user.id } } }],
        }),
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    const storeToUpdate = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (!storeToUpdate) throw new Error("Store not found.");

    const updatedStore = await db.store.update({
      where: {
        id: storeToUpdate.id,
      },
      data: details,
    });

    return updatedStore;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getStoreShippingRates = async (storeUrl: string) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    await ensureSellerSubscription(user.id);

    if (!storeUrl) throw new Error("Store URL is required.");
    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

    if (isConvexEnabled()) {
      return await convexQuery(api.stores.getStoreShippingRates, {
        storeUrl: normalizedStoreUrl,
        userId: user.id,
        isAdmin: user.privateMetadata?.role === "ADMIN",
      });
    }

    const dbUserRole = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdminUser = user.privateMetadata?.role === "ADMIN" || dbUserRole?.role === "ADMIN";

    const check_ownership = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
        ...(!isAdminUser && {
          OR: [{ userId: user.id }, { members: { some: { id: user.id } } }],
        }),
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    const store = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
        ...(!isAdminUser && {
          OR: [{ userId: user.id }, { members: { some: { id: user.id } } }],
        }),
      },
    });

    if (!store) throw new Error("Store could not be found.");

    const countries = await db.country.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const shippingRates = await db.shippingRate.findMany({
      where: {
        storeId: store.id,
      },
    });

    const rateMap = new Map();
    shippingRates.forEach((rate) => {
      rateMap.set(rate.countryId, rate);
    });

    const result = countries.map((country) => ({
      countryId: country.id,
      countryName: country.name,
      shippingRate: rateMap.get(country.id) || null,
    }));

    // Ensure South Africa is first as the main country
    result.sort((a, b) =>
      a.countryName === "South Africa" ? -1 : b.countryName === "South Africa" ? 1 : a.countryName.localeCompare(b.countryName)
    );

    return result;
  } catch (error) {
    console.error("Error retrieving store shipping rates:", error);
    throw error;
  }
};

export const upsertShippingRate = async (
  storeUrl: string,
  shippingRate: ShippingRate
) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    await ensureSellerSubscription(user.id);

    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

    if (isConvexEnabled()) {
      return await convexMutation(api.stores.upsertShippingRate, {
        storeUrl: normalizedStoreUrl,
        shippingRate: {
          id: shippingRate.id,
          shippingService: shippingRate.shippingService,
          shippingFeePerItem: shippingRate.shippingFeePerItem,
          shippingFeeForAdditionalItem: shippingRate.shippingFeeForAdditionalItem,
          shippingFeePerKg: shippingRate.shippingFeePerKg,
          shippingFeeFixed: shippingRate.shippingFeeFixed,
          deliveryTimeMin: shippingRate.deliveryTimeMin,
          deliveryTimeMax: shippingRate.deliveryTimeMax,
          returnPolicy: shippingRate.returnPolicy,
          countryId: shippingRate.countryId,
        },
        userId: user.id,
        isAdmin: user.privateMetadata?.role === "ADMIN",
      });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdmin = user.privateMetadata?.role === "ADMIN" || dbUser?.role === "ADMIN";

    const check_ownership = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
        ...(!isAdmin && {
          OR: [{ userId: user.id }, { members: { some: { id: user.id } } }],
        }),
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    if (!shippingRate) throw new Error("Please provide shipping rate data.");
    if (!shippingRate.countryId)
      throw new Error("Please provide a valid country ID.");

    const store = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
      },
    });
    if (!store) throw new Error("Please provide a valid store URL.");

    const shippingRateDetails = await db.shippingRate.upsert({
      where: {
        id: shippingRate.id,
      },
      update: { ...shippingRate, storeId: store.id },
      create: { ...shippingRate, storeId: store.id },
    });

    return shippingRateDetails;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getStoreOrders = async (storeUrl: string) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    await ensureSellerSubscription(user.id);

    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

    if (isConvexEnabled()) {
      return await convexQuery(api.stores.getStoreOrders, {
        storeUrl: normalizedStoreUrl,
        userId: user.id,
        isAdmin: user.privateMetadata?.role === "ADMIN",
      });
    }

    const store = (await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
      },
      include: {
        members: true,
      },
    })) as (Store & { members: { id: string }[] }) | null;

    if (!store) throw new Error("Store not found.");

    const isMember = store.members.some((m) => m.id === user.id);
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdmin = user.privateMetadata?.role === "ADMIN" || dbUser?.role === "ADMIN";

    if (user.id !== store.userId && !isMember && !isAdmin) {
      throw new Error("You don't have persmission to access this store.");
    }

    const orders = await db.orderGroup.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        items: true,
        coupon: true,
        order: {
          select: {
            paymentStatus: true,
            shippingAddress: {
              include: {
                country: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            paymentDetails: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    throw error;
  }
};

export const applySeller = async (store: StoreType) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    const primaryEmail = user.emailAddresses[0]?.emailAddress || "";

    if (isConvexEnabled()) {
      return await convexMutation(api.stores.applySeller, {
        store,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        userEmail: primaryEmail,
        userPicture: user.imageUrl || "",
      });
    }

    let dbUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      const existingByEmail = primaryEmail
        ? await db.user.findUnique({ where: { email: primaryEmail } })
        : null;

      if (existingByEmail) {
        dbUser = await db.user.update({
          where: { email: primaryEmail },
          data: {
            id: user.id,
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              existingByEmail.name ||
              "User",
            picture: user.imageUrl || existingByEmail.picture || "",
            role:
              (user.privateMetadata.role as "USER" | "ADMIN" | "SELLER") ||
              existingByEmail.role ||
              "USER",
          },
        });
      } else {
        dbUser = await db.user.create({
          data: {
            id: user.id,
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              "User",
            email: primaryEmail,
            picture: user.imageUrl || "",
            role:
              (user.privateMetadata.role as "USER" | "ADMIN" | "SELLER") ||
              "USER",
          },
        });
      }
    }

    if (!store) throw new Error("Please provide store data.");

    await db.storeApplication.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        data: store,
      },
      update: {
        data: store,
      },
    });

    const existingStore = await db.store.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: store.name },
              { email: store.email },
              { phone: store.phone },
              { url: store.url },
            ],
          },
        ],
      },
    });

    if (existingStore) {
      let errorMessage = "";
      if (existingStore.name === store.name) {
        errorMessage = "A store with the same name already exists";
      } else if (existingStore.email === store.email) {
        errorMessage = "A store with the same email already exists";
      } else if (existingStore.phone === store.phone) {
        errorMessage = "A store with the same phone number already exists";
      } else if (existingStore.url === store.url) {
        errorMessage = "A store with the same URL already exists";
      }
      throw new Error(errorMessage);
    }

    return { id: "draft", status: "PENDING" } as any;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllStores = async () => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "ADMIN") {
      throw new Error(
        "Unauthorized Access: Admin Privileges Required to View Stores."
      );
    }

    if (isConvexEnabled()) {
      return await convexQuery(api.stores.getAllStores, {});
    }

    const stores = await db.store.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return stores;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateStoreStatus = async (
  storeId: string,
  status: StoreStatus
) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");

  if (user.privateMetadata.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );

  if (isConvexEnabled()) {
    return await convexMutation(api.stores.updateStoreStatus, {
      storeId,
      status,
    });
  }

  const store = await db.store.findUnique({
    where: {
      id: storeId,
    },
  });

  if (!store) {
    throw new Error("Store not found !");
  }

  if (status === "ACTIVE") {
    try {
      await ensureSellerSubscription(store.userId);
    } catch {
      throw new Error(
        "Store owner must activate a subscription before approval."
      );
    }
  }

  const updatedStore = await db.store.update({
    where: {
      id: storeId,
    },
    data: {
      status,
    },
  });

  if (store.status === "PENDING" && updatedStore.status === "ACTIVE") {
    await db.user.update({
      where: {
        id: updatedStore.userId,
      },
      data: {
        role: "SELLER",
      },
    });
  }

  return updatedStore.status;
};

export const deleteStore = async (storeId: string) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "ADMIN")
      throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
      );

    if (!storeId) throw new Error("Please provide store ID.");

    if (isConvexEnabled()) {
      return await convexMutation(api.stores.deleteStore, { storeId });
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
      include: {
        products: {
          select: { id: true },
        },
      },
    });

    if (!store) throw new Error("Store not found.");

    const response = await db.$transaction(async (tx) => {
      for (const product of store.products) {
        const variants = await tx.productVariant.findMany({
          where: { productId: product.id },
          select: { id: true },
        });

        for (const variant of variants) {
          await tx.size.deleteMany({
            where: { productVariantId: variant.id },
          });

          await tx.productVariantImage.deleteMany({
            where: { productVariantId: variant.id },
          });

          await tx.color.deleteMany({
            where: { productVariantId: variant.id },
          });

          await tx.spec.deleteMany({
            where: { variantId: variant.id },
          });

          await tx.wishlist.deleteMany({
            where: { variantId: variant.id },
          });
        }

        await tx.productVariant.deleteMany({
          where: { productId: product.id },
        });

        await tx.question.deleteMany({
          where: { productId: product.id },
        });

        await tx.review.deleteMany({
          where: { productId: product.id },
        });

        await tx.spec.deleteMany({
          where: { productId: product.id },
        });

        await tx.wishlist.deleteMany({
          where: { productId: product.id },
        });

        await tx.freeShipping.deleteMany({
          where: { productId: product.id },
        });
      }

      await tx.product.deleteMany({
        where: { storeId },
      });

      const orderGroups = await tx.orderGroup.findMany({
        where: { storeId },
        select: { id: true },
      });

      for (const group of orderGroups) {
        await tx.orderItem.deleteMany({
          where: { orderGroupId: group.id },
        });
      }

      await tx.orderGroup.deleteMany({
        where: { storeId },
      });

      await tx.cartItem.deleteMany({
        where: { storeId },
      });

      await tx.coupon.deleteMany({
        where: { storeId },
      });

      await tx.shippingRate.deleteMany({
        where: { storeId },
      });

      const deletedStore = await tx.store.delete({
        where: { id: storeId },
      });

      return deletedStore;
    });

    return response;
  } catch (error) {
    console.error("Error deleting store:", error);
    throw error;
  }
};

export const getStorePageDetails = async (storeUrl: string) => {
  const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

  if (isConvexEnabled()) {
    return await convexQuery(api.stores.getStorePageDetails, {
      storeUrl: normalizedStoreUrl,
    });
  }

  const store = await db.store.findFirst({
    where: {
      url: {
        equals: normalizedStoreUrl,
        mode: "insensitive",
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      cover: true,
      averageRating: true,
      numReviews: true,
    },
  });

  if (!store) {
    throw new Error(`Store with URL "${storeUrl}" not found.`);
  }
  return store;
};

export const getStoreDashboardStats = async (storeUrl: string, days: number = 30) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");
    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

    if (isConvexEnabled()) {
      return await convexQuery(api.stores.getStoreDashboardStats, {
        storeUrl: normalizedStoreUrl,
        days,
        userId: user.id,
        isAdmin: user.privateMetadata?.role === "ADMIN",
      });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isAdmin = user.privateMetadata?.role === "ADMIN" || dbUser?.role === "ADMIN";

    const store = await db.store.findFirst({
      where: {
        url: {
          equals: normalizedStoreUrl,
          mode: "insensitive",
        },
      },
      include: {
        members: true,
      },
    });

    if (!store) throw new Error("Store not found.");

    const isOwner = store.userId === user.id;
    const isMember = store.members.some((member) => member.id === user.id);

    if (!isOwner && !isMember && !isAdmin) {
      throw new Error("Unauthorized Access: You do not have permission to view this store dashboard.");
    }

    const revenueResult = await db.orderGroup.aggregate({
      where: {
        storeId: store.id,
        order: {
          paymentStatus: "Paid",
        },
      },
      _sum: {
        total: true,
      },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    const totalOrders = await db.orderGroup.count({
      where: {
        storeId: store.id,
      },
    });

    const totalProducts = await db.product.count({
      where: {
        storeId: store.id,
      },
    });

    const recentOrders = await db.orderGroup.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        order: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
                picture: true,
              },
            },
            paymentStatus: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const ordersInRange = await db.orderGroup.findMany({
      where: {
        storeId: store.id,
        createdAt: { gte: daysAgo },
        order: { paymentStatus: "Paid" },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const graphDataMap = new Map<string, { total: number; orders: number }>();
    ordersInRange.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      const current = graphDataMap.get(date) || { total: 0, orders: 0 };
      graphDataMap.set(date, {
        total: current.total + order.total,
        orders: current.orders + 1,
      });
    });

    const graphData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const data = graphDataMap.get(dateStr) || { total: 0, orders: 0 };
      graphData.push({
        date: dateStr,
        total: data.total,
        orders: data.orders,
      });
    }

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus = await db.orderGroup.groupBy({
      by: ["status"],
      where: {
        storeId: store.id,
      },
      _count: true,
    });

    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2);
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - days);

    const previousRevenue = await db.orderGroup.aggregate({
      where: {
        storeId: store.id,
        createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
        order: { paymentStatus: "Paid" },
      },
      _sum: { total: true },
    });

    const revenueGrowth =
      previousRevenue._sum.total && previousRevenue._sum.total > 0
        ? ((totalRevenue - (previousRevenue._sum.total || 0)) /
            (previousRevenue._sum.total || 1)) *
          100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders,
      graphData,
      avgOrderValue,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      revenueGrowth,
    };
  } catch (error) {
    console.error("Error fetching store dashboard stats:", error);
    throw error;
  }
};
