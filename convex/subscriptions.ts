import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import {
  subscriptionTierValidator,
  subscriptionStatusValidator,
} from "./schema";

// ==================== SUBSCRIPTIONS ====================

export const getCurrentSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const paidStatuses = ["COMPLETE", "PAID", "Paid"];
    const active = subs
      .filter(
        (s) =>
          s.status === "ACTIVE" &&
          (paidStatuses.includes(s.paymentStatus || "") ||
            !!s.paymentId ||
            !!s.startDate)
      )
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (!active) return null;

    const now = Date.now();
    if (active.endDate && now > active.endDate) {
      return null;
    }

    const activeAds = await ctx.db
      .query("advertisements")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    const adsUsed = activeAds.filter((a) => a.isActive).length;

    const remaining =
      active.adLimit === -1 ? -1 : Math.max(0, active.adLimit - adsUsed);

    return {
      ...toPrismaShape(active)!,
      adsUsed,
      remainingAds: remaining,
      phase: "PAID",
      expiresAt: active.endDate
        ? new Date(active.endDate).toISOString()
        : null,
    };
  },
});

export const getSubscriptionHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    subs.sort((a, b) => b.createdAt - a.createdAt);
    return subs.map((s) => toPrismaShape(s)!);
  },
});

export const createSubscription = mutation({
  args: {
    userId: v.string(),
    tier: subscriptionTierValidator,
    amount: v.number(),
    adLimit: v.number(),
    status: v.optional(subscriptionStatusValidator),
    isTrial: v.optional(v.boolean()),
    trialEndsAt: v.optional(v.number()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const prismaId = generateUuid();
    const newId = await ctx.db.insert("subscriptions", {
      prismaId,
      userId: args.userId,
      tier: args.tier,
      status: args.status || "PENDING",
      amount: args.amount,
      currency: "ZAR",
      adLimit: args.adLimit,
      adsUsed: 0,
      startDate: args.status === "ACTIVE" ? now : undefined,
      endDate:
        args.status === "ACTIVE" ? now + 30 * 24 * 60 * 60 * 1000 : undefined,
      isTrial: args.isTrial || false,
      trialEndsAt: args.trialEndsAt,
      paymentId: args.paymentId,
      paymentStatus: args.paymentStatus || "PENDING",
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});
