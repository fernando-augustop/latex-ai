import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { TIER_LIMITS } from "./tierLimits";

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
      compilesUsedToday: 0,
      lastCompileResetDate: today,
      storageUsedBytes: 0,
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
      compilesUsedToday: 0,
      lastCompileResetDate: today,
      storageUsedBytes: 0,
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const trimmed = args.name.trim();
    if (trimmed.length === 0) throw new Error("Name cannot be empty");

    await ctx.db.patch(args.userId, { name: trimmed });
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

// ─── Compile Quota ─────────────────────────────────────────────────

export const getCompilesToday = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split("T")[0];

    if ((user.lastCompileResetDate ?? "") !== today) {
      return 0;
    }

    return user.compilesUsedToday ?? 0;
  },
});

export const decrementCompiles = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const current = user.compilesUsedToday ?? 0;
    if (current > 0) {
      await ctx.db.patch(args.userId, {
        compilesUsedToday: current - 1,
      });
    }
  },
});

export const incrementCompiles = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split("T")[0];

    if ((user.lastCompileResetDate ?? "") !== today) {
      await ctx.db.patch(args.userId, {
        compilesUsedToday: 1,
        lastCompileResetDate: today,
      });
      return 1;
    } else {
      const newCount = (user.compilesUsedToday ?? 0) + 1;
      await ctx.db.patch(args.userId, {
        compilesUsedToday: newCount,
      });
      return newCount;
    }
  },
});

// ─── Storage Quota ────────────────────────────────────────────────

export const getStorageUsage = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const usedBytes = user.storageUsedBytes ?? 0;
    const limits = TIER_LIMITS[user.tier];
    const limitBytes = limits.storageLimitMB === Infinity
      ? Infinity
      : limits.storageLimitMB * 1024 * 1024;

    return {
      usedBytes,
      limitBytes,
      usedMB: Math.round(usedBytes / (1024 * 1024) * 100) / 100,
      limitMB: limits.storageLimitMB,
    };
  },
});

export const adjustStorageUsage = internalMutation({
  args: { userId: v.id("users"), deltaBytes: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const current = user.storageUsedBytes ?? 0;
    const newValue = Math.max(0, current + args.deltaBytes);
    await ctx.db.patch(args.userId, { storageUsedBytes: newValue });
    return newValue;
  },
});

export const checkStorageLimit = internalQuery({
  args: { userId: v.id("users"), additionalBytes: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const limits = TIER_LIMITS[user.tier];
    if (limits.storageLimitMB === Infinity) return { allowed: true };

    const limitBytes = limits.storageLimitMB * 1024 * 1024;
    const currentBytes = user.storageUsedBytes ?? 0;

    return {
      allowed: (currentBytes + args.additionalBytes) <= limitBytes,
      currentBytes,
      limitBytes,
    };
  },
});
