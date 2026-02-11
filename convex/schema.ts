import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    createdAt: v.number(),
    aiMessagesUsedToday: v.number(),
    lastAiResetDate: v.string(),
  }).index("by_email", ["email"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    template: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isArchived"]),

  documents: defineTable({
    projectId: v.id("projects"),
    filename: v.string(),
    content: v.string(),
    compiledPdfUrl: v.optional(v.string()),
    lastCompiledAt: v.optional(v.number()),
    version: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_filename", ["projectId", "filename"]),

  chatMessages: defineTable({
    documentId: v.id("documents"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    model: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_user", ["userId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    currentPeriodEnd: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
