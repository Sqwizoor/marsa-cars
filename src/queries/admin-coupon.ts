"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Get all coupons for admin
 * @returns All coupons with store information
 */
export const getAllCoupons = async () => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const coupons = await db.coupon.findMany({
    include: {
      store: {
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
      _count: {
        select: {
          orders: true,
          users: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return coupons;
};

/**
 * Delete a coupon (admin only)
 * @param couponId - The ID of the coupon to delete
 */
export const adminDeleteCoupon = async (couponId: string) => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const response = await db.coupon.delete({
    where: {
      id: couponId,
    },
  });

  return response;
};
