import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { TIER_LIMITS, type Tier } from "./tierLimits";

// ─── Internal Queries ───────────────────────────────────────────────

export const findCachedCompilation = internalQuery({
  args: {
    documentId: v.id("documents"),
    sourceHash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("compilations")
      .withIndex("by_document_hash", (q) =>
        q.eq("documentId", args.documentId).eq("sourceHash", args.sourceHash)
      )
      .filter((q) => q.eq(q.field("status"), "success"))
      .order("desc")
      .first();
  },
});

// ─── Combined Mutations (Optimized) ─────────────────────────────────

/**
 * Combines: user lookup + quota check + increment compiles + cache check + rate limit + create compilation
 * Reduces 5-6 separate DB calls into a single transaction.
 */
export const authorizeAndPrepareCompile = internalMutation({
  args: {
    email: v.string(),
    documentId: v.id("documents"),
    sourceHash: v.string(),
    engine: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!user) throw new Error("User not found");

    const tier = user.tier as Tier;
    const tierLimits = TIER_LIMITS[tier];

    // 2. Check & increment daily quota
    const today = new Date().toISOString().split("T")[0];
    let compilesUsedToday: number;
    if ((user.lastCompileResetDate ?? "") !== today) {
      await ctx.db.patch(user._id, { compilesUsedToday: 1, lastCompileResetDate: today });
      compilesUsedToday = 1;
    } else {
      compilesUsedToday = (user.compilesUsedToday ?? 0) + 1;
      await ctx.db.patch(user._id, { compilesUsedToday });
    }

    const maxDaily = tierLimits.maxServerCompilesPerDay;
    if (maxDaily !== Infinity && compilesUsedToday > maxDaily) {
      // Rollback
      await ctx.db.patch(user._id, { compilesUsedToday: compilesUsedToday - 1 });
      throw new Error(
        `Daily compilation limit reached (${compilesUsedToday - 1}/${maxDaily}). Upgrade your plan for more compiles.`
      );
    }

    const remaining =
      maxDaily === Infinity
        ? undefined
        : Math.max(0, maxDaily - compilesUsedToday);

    // 3. Check server-side cache
    const cached = await ctx.db
      .query("compilations")
      .withIndex("by_document_hash", (q) =>
        q.eq("documentId", args.documentId).eq("sourceHash", args.sourceHash)
      )
      .filter((q) => q.eq(q.field("status"), "success"))
      .order("desc")
      .first();

    if (cached?.pdfStorageId) {
      // Rollback compile count — cache hit doesn't count
      await ctx.db.patch(user._id, { compilesUsedToday: compilesUsedToday - 1 });
      return {
        userId: user._id,
        tier: user.tier,
        compilationId: cached._id,
        cached: true as const,
        pdfStorageId: cached.pdfStorageId,
        logs: cached.logs,
        remaining: remaining !== undefined ? remaining + 1 : undefined,
      };
    }

    // 4. Rate limit: max N compilations per user in last 60 seconds
    const maxPerMinute = tierLimits.maxCompilesPerMinute ?? 5;
    if (maxPerMinute !== Infinity) {
      const oneMinuteAgo = Date.now() - 60_000;
      const recentCompilations = await ctx.db
        .query("compilations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.gte(q.field("_creationTime"), oneMinuteAgo))
        .collect();

      if (recentCompilations.length >= maxPerMinute) {
        // Rollback
        await ctx.db.patch(user._id, { compilesUsedToday: compilesUsedToday - 1 });
        throw new Error("Rate limit exceeded: too many compilations. Please wait a moment.");
      }
    }

    // 5. Create compilation record directly as "compiling"
    const compilationId = await ctx.db.insert("compilations", {
      userId: user._id,
      documentId: args.documentId,
      sourceHash: args.sourceHash,
      status: "compiling",
      engine: args.engine ?? "tectonic",
    });

    return {
      userId: user._id,
      tier: user.tier,
      compilationId,
      cached: false as const,
      remaining,
    };
  },
});

/**
 * Combines: updateCompilation + updateDocumentCompileTime
 * Reduces 2 separate mutations into 1.
 */
export const finalizeCompilation = internalMutation({
  args: {
    compilationId: v.id("compilations"),
    documentId: v.id("documents"),
    status: v.union(v.literal("success"), v.literal("error")),
    logs: v.optional(v.string()),
    errors: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    pdfStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { compilationId, documentId, status, ...rest } = args;

    const patch: Record<string, unknown> = { status, compiledAt: Date.now() };
    if (rest.logs !== undefined) patch.logs = rest.logs;
    if (rest.errors !== undefined) patch.errors = rest.errors;
    if (rest.durationMs !== undefined) patch.durationMs = rest.durationMs;
    if (rest.pdfStorageId !== undefined) patch.pdfStorageId = rest.pdfStorageId;

    await ctx.db.patch(compilationId, patch);

    // Update document compile time on success
    if (status === "success") {
      await ctx.db.patch(documentId, { lastCompiledAt: Date.now() });
    }
  },
});

// ─── Internal Mutations (Legacy — kept for compatibility) ───────────

export const createCompilation = internalMutation({
  args: {
    userId: v.id("users"),
    documentId: v.id("documents"),
    sourceHash: v.string(),
    engine: v.optional(v.string()),
    tier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tier = (args.tier ?? "free") as Tier;
    const maxPerMinute = TIER_LIMITS[tier]?.maxCompilesPerMinute ?? 5;

    // Rate limit: max N compilations per user in last 60 seconds (tier-specific)
    const oneMinuteAgo = Date.now() - 60_000;
    const recentCompilations = await ctx.db
      .query("compilations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("_creationTime"), oneMinuteAgo))
      .collect();

    if (recentCompilations.length >= maxPerMinute) {
      throw new Error("Rate limit exceeded: too many compilations. Please wait a moment.");
    }

    return await ctx.db.insert("compilations", {
      userId: args.userId,
      documentId: args.documentId,
      sourceHash: args.sourceHash,
      status: "pending",
      engine: args.engine ?? "tectonic",
    });
  },
});

export const updateCompilation = internalMutation({
  args: {
    compilationId: v.id("compilations"),
    status: v.union(
      v.literal("pending"),
      v.literal("compiling"),
      v.literal("success"),
      v.literal("error")
    ),
    logs: v.optional(v.string()),
    errors: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    pdfStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { compilationId, status, ...rest } = args;

    const patch: Record<string, unknown> = { status };
    if (rest.logs !== undefined) patch.logs = rest.logs;
    if (rest.errors !== undefined) patch.errors = rest.errors;
    if (rest.durationMs !== undefined) patch.durationMs = rest.durationMs;
    if (rest.pdfStorageId !== undefined) patch.pdfStorageId = rest.pdfStorageId;
    if (status === "success" || status === "error") {
      patch.compiledAt = Date.now();
    }

    await ctx.db.patch(compilationId, patch);
  },
});

export const updateDocumentCompileTime = internalMutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      lastCompiledAt: Date.now(),
    });
  },
});

// ─── Public Mutations ───────────────────────────────────────────────

/**
 * Fire-and-forget tracking for direct API route compiles.
 * Called by the client after receiving a successful PDF response.
 * Does NOT block the PDF display — purely for usage accounting.
 */
export const trackDirectCompile = mutation({
  args: {
    documentId: v.id("documents"),
    sourceHash: v.string(),
    engine: v.optional(v.string()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) return;

    // Increment daily compile count
    const today = new Date().toISOString().split("T")[0];
    if ((user.lastCompileResetDate ?? "") !== today) {
      await ctx.db.patch(user._id, {
        compilesUsedToday: 1,
        lastCompileResetDate: today,
      });
    } else {
      await ctx.db.patch(user._id, {
        compilesUsedToday: (user.compilesUsedToday ?? 0) + 1,
      });
    }

    // Update document lastCompiledAt
    await ctx.db.patch(args.documentId, { lastCompiledAt: Date.now() });
  },
});

// ─── Public Queries ─────────────────────────────────────────────────

export const getCompilation = query({
  args: { compilationId: v.id("compilations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.compilationId);
  },
});

export const getDocumentCompilations = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("compilations")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .take(10);
  },
});

// ─── Cleanup ────────────────────────────────────────────────────────

export const cleanupOldPdfStorage = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Find compilations older than 7 days that have stored PDFs
    const oldCompilations = await ctx.db
      .query("compilations")
      .filter((q) =>
        q.and(
          q.lt(q.field("_creationTime"), sevenDaysAgo),
          q.neq(q.field("pdfStorageId"), undefined)
        )
      )
      .take(100);

    let deleted = 0;
    for (const compilation of oldCompilations) {
      if (compilation.pdfStorageId) {
        await ctx.storage.delete(compilation.pdfStorageId);
        await ctx.db.patch(compilation._id, { pdfStorageId: undefined });
        deleted++;
      }
    }

    if (deleted > 0) {
      console.log(`[latex] Cleaned up ${deleted} old PDF storage entries`);
    }
  },
});
