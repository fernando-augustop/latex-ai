"use node";

import crypto from "crypto";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

type CompileResult = {
  compilationId: Id<"compilations">;
  status: "success" | "error";
  pdfUrl?: string;
  logs?: string;
  errors?: string;
  cached: boolean;
  remainingCompiles?: number;
  durationMs?: number;
};

// ─── Compile Action (Optimized: 8→4 DB round-trips) ────────────────

export const compile = action({
  args: {
    documentId: v.id("documents"),
    source: v.string(),
    engine: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CompileResult> => {
    const startTime = Date.now();

    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated");
    }

    // 2. Compute source hash
    const sourceHash = crypto
      .createHash("sha256")
      .update(args.source)
      .digest("hex");

    // 3. Combined: user lookup + quota + cache check + rate limit + create compilation
    const prep = await ctx.runMutation(
      internal.latex.authorizeAndPrepareCompile,
      {
        email: identity.email,
        documentId: args.documentId,
        sourceHash,
        engine: args.engine,
      }
    );

    // 4. Cache hit — return storage URL directly (no base64 conversion)
    if (prep.cached && prep.pdfStorageId) {
      const pdfUrl = await ctx.storage.getUrl(prep.pdfStorageId);
      if (pdfUrl) {
        return {
          compilationId: prep.compilationId,
          status: "success" as const,
          pdfUrl,
          logs: prep.logs,
          cached: true,
          remainingCompiles: prep.remaining,
          durationMs: 0,
        };
      }
      // Storage URL failed — fall through to recompile
    }

    // 5. Call external LaTeX API
    const apiUrl = process.env.LATEX_API_URL;
    if (!apiUrl) {
      await ctx.runMutation(internal.users.decrementCompiles, { userId: prep.userId });
      await ctx.runMutation(internal.latex.finalizeCompilation, {
        compilationId: prep.compilationId,
        documentId: args.documentId,
        status: "error",
        errors: "LATEX_API_URL is not configured",
        durationMs: Date.now() - startTime,
      });
      throw new Error("LaTeX compilation service is not configured");
    }

    const apiSecret = process.env.LATEX_API_SECRET;
    if (!apiSecret) {
      await ctx.runMutation(internal.users.decrementCompiles, { userId: prep.userId });
      await ctx.runMutation(internal.latex.finalizeCompilation, {
        compilationId: prep.compilationId,
        documentId: args.documentId,
        status: "error",
        errors: "LATEX_API_SECRET is not configured",
        durationMs: Date.now() - startTime,
      });
      throw new Error("LaTeX compilation service is not configured");
    }

    const hmac = crypto
      .createHmac("sha256", apiSecret)
      .update(args.source)
      .digest("hex");

    let response: Response;
    try {
      response = await fetch(`${apiUrl}/compile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Secret": hmac,
        },
        body: JSON.stringify({
          source: args.source,
          engine: args.engine ?? "tectonic",
          document_id: args.documentId,
        }),
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to reach LaTeX API";
      await ctx.runMutation(internal.users.decrementCompiles, { userId: prep.userId });
      await ctx.runMutation(internal.latex.finalizeCompilation, {
        compilationId: prep.compilationId,
        documentId: args.documentId,
        status: "error",
        errors: errorMsg,
        durationMs: Date.now() - startTime,
      });
      throw new Error(`LaTeX API request failed: ${errorMsg}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const body = await response.text();
      const errorMsg = `LaTeX API returned non-JSON response (HTTP ${response.status}): ${body.slice(0, 200)}`;
      await ctx.runMutation(internal.users.decrementCompiles, { userId: prep.userId });
      await ctx.runMutation(internal.latex.finalizeCompilation, {
        compilationId: prep.compilationId,
        documentId: args.documentId,
        status: "error",
        errors: errorMsg,
        durationMs: Date.now() - startTime,
      });
      throw new Error(errorMsg);
    }

    const result = await response.json();
    const durationMs = Date.now() - startTime;

    // 6. Handle error response
    if (!response.ok || result.error) {
      await ctx.runMutation(internal.latex.finalizeCompilation, {
        compilationId: prep.compilationId,
        documentId: args.documentId,
        status: "error",
        logs: result.logs,
        errors: result.error ?? `HTTP ${response.status}`,
        durationMs,
      });
      return {
        compilationId: prep.compilationId,
        status: "error" as const,
        logs: result.logs,
        errors: result.error ?? `HTTP ${response.status}`,
        cached: false,
        remainingCompiles: prep.remaining,
      };
    }

    // 7. Store PDF in Convex storage
    let pdfStorageId: Id<"_storage"> | undefined;
    try {
      const pdfBytes = Buffer.from(result.pdf, "base64");
      pdfStorageId = await ctx.storage.store(
        new Blob([pdfBytes], { type: "application/pdf" })
      );
    } catch {
      // Storage failed — continue without caching
    }

    // 8. Combined: update compilation record + document compile timestamp
    await ctx.runMutation(internal.latex.finalizeCompilation, {
      compilationId: prep.compilationId,
      documentId: args.documentId,
      status: "success",
      logs: result.logs,
      durationMs,
      ...(pdfStorageId ? { pdfStorageId } : {}),
    });

    // 9. Return storage URL instead of base64 (saves ~33% transfer)
    let pdfUrl: string | undefined;
    if (pdfStorageId) {
      pdfUrl = (await ctx.storage.getUrl(pdfStorageId)) ?? undefined;
    }

    return {
      compilationId: prep.compilationId,
      status: "success" as const,
      pdfUrl,
      logs: result.logs,
      cached: false,
      remainingCompiles: prep.remaining,
      durationMs: result.duration_ms,
    };
  },
});

// ─── Health Check ───────────────────────────────────────────────────

export const checkHealth = internalAction({
  args: {},
  handler: async () => {
    const apiUrl = process.env.LATEX_API_URL;
    if (!apiUrl) {
      console.warn("[latex] LATEX_API_URL is not configured, skipping health check");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      console.log(
        `[latex] Health check: status=${response.status}`,
        JSON.stringify(data)
      );
    } catch (err) {
      console.error(
        "[latex] Health check failed:",
        err instanceof Error ? err.message : err
      );
    }
  },
});
