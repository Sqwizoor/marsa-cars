import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";

// ==================== PART REQUESTS ====================

export const submitPartRequest = mutation({
  args: {
    partName: v.string(),
    partNumber: v.optional(v.string()),
    vehicleDetails: v.string(),
    userName: v.string(),
    contactInfo: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const prismaId = generateUuid();
    await ctx.db.insert("partRequests", {
      prismaId,
      partName: args.partName,
      partNumber: args.partNumber,
      vehicleDetails: args.vehicleDetails,
      userName: args.userName,
      contactInfo: args.contactInfo,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });
    return { success: true };
  },
});

export const getPartRequests = query({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db.query("partRequests").collect();
    return requests
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((req) => toPrismaShape(req)!);
  },
});

export const updatePartRequestStatus = mutation({
  args: {
    id: v.string(),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const existing = await findById(ctx, "partRequests", id);
    if (!existing) throw new Error("Part request not found");
    await ctx.db.patch(existing._id, {
      status,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(existing._id);
    return toPrismaShape(updated);
  },
});

export const deletePartRequest = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const existing = await findById(ctx, "partRequests", id);
    if (!existing) throw new Error("Part request not found");
    const shape = toPrismaShape(existing);
    await ctx.db.delete(existing._id);
    return shape;
  },
});
