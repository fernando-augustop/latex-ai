import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

    await ctx.db.patch(args.documentId, {
      content: args.content,
      version: doc.version + 1,
    });

    await ctx.db.patch(doc.projectId, { updatedAt: Date.now() });
  },
});


