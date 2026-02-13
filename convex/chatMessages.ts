import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("asc")
      .collect();
  },
});

export const getRecentByDocument = query({
  args: {
    documentId: v.id("documents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .take(limit);
    return messages.reverse();
  },
});

export const sendMessage = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      documentId: args.documentId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      model: args.model,
      createdAt: Date.now(),
    });
  },
});

export const deleteByDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
