import { v } from "convex/values";
import {
  query,
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

// ─── Internal Mutations ─────────────────────────────────────────────

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
