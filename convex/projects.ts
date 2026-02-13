import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { TIER_LIMITS } from "./tierLimits";

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("isArchived", false)
      )
      .collect();

    const sorted = projects.sort((a, b) => b.updatedAt - a.updatedAt);

    const projectsWithPreview = await Promise.all(
      sorted.map(async (project) => {
        const mainDoc = await ctx.db
          .query("documents")
          .withIndex("by_project_filename", (q) =>
            q.eq("projectId", project._id).eq("filename", "main.tex")
          )
          .first();

        const fallbackDoc = mainDoc
          ? null
          : await ctx.db
              .query("documents")
              .withIndex("by_project", (q) => q.eq("projectId", project._id))
              .first();

        const doc = mainDoc ?? fallbackDoc;

        // Get the latest successful compilation PDF URL
        let pdfUrl: string | null = null;
        if (doc) {
          const latestCompilation = await ctx.db
            .query("compilations")
            .withIndex("by_document", (q) => q.eq("documentId", doc._id))
            .filter((q) =>
              q.and(
                q.eq(q.field("status"), "success"),
                q.neq(q.field("pdfStorageId"), undefined)
              )
            )
            .order("desc")
            .first();

          if (latestCompilation?.pdfStorageId) {
            pdfUrl = await ctx.storage.getUrl(latestCompilation.pdfStorageId);
          }
        }

        return {
          ...project,
          previewContent: doc?.content ?? "",
          previewFilename: doc?.filename ?? null,
          pdfUrl,
        };
      })
    );

    return projectsWithPreview;
  },
});

export const getById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    template: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("isArchived", false)
      )
      .collect();

    const limits = TIER_LIMITS[user.tier];
    if (existingProjects.length >= limits.maxProjects) {
      throw new Error(
        `Project limit reached for ${user.tier} tier. Maximum ${limits.maxProjects} projects allowed.`
      );
    }

    const now = Date.now();
    return await ctx.db.insert("projects", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      template: args.template,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.projectId, updates);
  },
});

export const archive = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    await ctx.db.patch(args.projectId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});
