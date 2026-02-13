import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { TIER_LIMITS } from "./tierLimits";

/** Get byte length of a string (UTF-8) */
function byteLength(str: string): number {
  return new TextEncoder().encode(str).byteLength;
}

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    filename: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check storage limit
    const user = await ctx.db.get(project.userId);
    if (!user) throw new Error("User not found");

    const contentBytes = byteLength(args.content);
    const limits = TIER_LIMITS[user.tier];
    if (limits.storageLimitMB !== Infinity) {
      const limitBytes = limits.storageLimitMB * 1024 * 1024;
      const currentBytes = user.storageUsedBytes ?? 0;
      if (currentBytes + contentBytes > limitBytes) {
        throw new Error(
          `Limite de armazenamento atingido (${limits.storageLimitMB}MB no plano ${user.tier}). Exclua arquivos ou faça upgrade.`
        );
      }
    }

    const existing = await ctx.db
      .query("documents")
      .withIndex("by_project_filename", (q) =>
        q.eq("projectId", args.projectId).eq("filename", args.filename)
      )
      .first();

    if (existing) {
      throw new Error(
        `Document "${args.filename}" already exists in this project`
      );
    }

    const docId = await ctx.db.insert("documents", {
      projectId: args.projectId,
      filename: args.filename,
      content: args.content,
      version: 1,
    });

    // Update storage usage
    await ctx.db.patch(user._id, {
      storageUsedBytes: (user.storageUsedBytes ?? 0) + contentBytes,
    });

    await ctx.db.patch(args.projectId, { updatedAt: Date.now() });

    return docId;
  },
});

export const updateContent = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    const project = await ctx.db.get(doc.projectId);
    if (!project) throw new Error("Project not found");

    const user = await ctx.db.get(project.userId);
    if (!user) throw new Error("User not found");

    const oldBytes = byteLength(doc.content);
    const newBytes = byteLength(args.content);
    const deltaBytes = newBytes - oldBytes;

    // Only check limit if content is growing
    if (deltaBytes > 0) {
      const limits = TIER_LIMITS[user.tier];
      if (limits.storageLimitMB !== Infinity) {
        const limitBytes = limits.storageLimitMB * 1024 * 1024;
        const currentBytes = user.storageUsedBytes ?? 0;
        if (currentBytes + deltaBytes > limitBytes) {
          throw new Error(
            `Limite de armazenamento atingido (${limits.storageLimitMB}MB no plano ${user.tier}). Exclua arquivos ou faça upgrade.`
          );
        }
      }
    }

    await ctx.db.patch(args.documentId, {
      content: args.content,
      version: doc.version + 1,
    });

    // Update storage delta
    if (deltaBytes !== 0) {
      const currentBytes = user.storageUsedBytes ?? 0;
      await ctx.db.patch(user._id, {
        storageUsedBytes: Math.max(0, currentBytes + deltaBytes),
      });
    }

    await ctx.db.patch(doc.projectId, { updatedAt: Date.now() });
  },
});
