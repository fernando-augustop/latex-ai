import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getOrCreateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return existing;
    }

    const today = new Date().toISOString().split("T")[0];
    const userId = await ctx.db.insert("users", {
      email,
      name: identity.name ?? email.split("@")[0],
      avatar: identity.pictureUrl,
      tier: "free",
      createdAt: Date.now(),
      aiMessagesUsedToday: 0,
      lastAiResetDate: today,
    });

    return (await ctx.db.get(userId))!;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    tier: v.optional(
      v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const today = new Date().toISOString().split("T")[0];

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      tier: args.tier ?? "free",
      createdAt: Date.now(),
      aiMessagesUsedToday: 0,
      lastAiResetDate: today,
    });
  },
});

export const updateTier = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, { tier: args.tier });
  },
});

export const getAiUsage = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split("T")[0];

    if (user.lastAiResetDate !== today) {
      return 0;
    }

    return user.aiMessagesUsedToday;
  },
});

export const incrementAiUsage = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split("T")[0];

    if (user.lastAiResetDate !== today) {
      await ctx.db.patch(args.userId, {
        aiMessagesUsedToday: 1,
        lastAiResetDate: today,
      });
    } else {
      await ctx.db.patch(args.userId, {
        aiMessagesUsedToday: user.aiMessagesUsedToday + 1,
      });
    }
  },
});

export const resetAiUsage = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split("T")[0];

    await ctx.db.patch(args.userId, {
      aiMessagesUsedToday: 0,
      lastAiResetDate: today,
    });
  },
});
