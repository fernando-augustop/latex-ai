import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    currentPeriodEnd: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("User already has an active subscription");
    }

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      tier: args.tier,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

export const update = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("past_due")
      )
    ),
    currentPeriodEnd: v.optional(v.number()),
    tier: v.optional(
      v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))
    ),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.currentPeriodEnd !== undefined)
      updates.currentPeriodEnd = args.currentPeriodEnd;
    if (args.tier !== undefined) updates.tier = args.tier;

    await ctx.db.patch(args.subscriptionId, updates);
  },
});
