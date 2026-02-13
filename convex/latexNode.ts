"use node";

import crypto from "crypto";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { TIER_LIMITS, type Tier } from "./tierLimits";
import type { Id } from "./_generated/dataModel";

type CompileResult = {
  compilationId: Id<"compilations">;
  status: "success" | "error";
  pdfBase64?: string;
  logs?: string;
  errors?: string;
  cached: boolean;
  remainingCompiles?: number;
  durationMs?: number;
};

// ─── Compile Action ─────────────────────────────────────────────────

export const compile = action({
  args: {
    documentId: v.id("documents"),
    source: v.string(),
    engine: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CompileResult> => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated");
    }

    // 2. Look up user by email
    const user = await ctx.runQuery(api.users.getByEmail, {
      email: identity.email,
    });
    if (!user) {
      throw new Error("User not found");
    }

    const tier = user.tier as Tier;
    const tierLimits = TIER_LIMITS[tier];
    const engine = args.engine ?? "tectonic";
    const startTime = Date.now();

    // 3. Check daily quota (increment first — acts as reservation)
    const compilesUsedToday = await ctx.runMutation(
      internal.users.incrementCompiles,
      { userId: user._id }
    );

    const maxDaily = tierLimits.maxServerCompilesPerDay;
    if (maxDaily !== Infinity && compilesUsedToday > maxDaily) {
      // Rollback the reservation since we're rejecting the compile
      await ctx.runMutation(internal.users.decrementCompiles, { userId: user._id });
      throw new Error(
        `Daily compilation limit reached (${compilesUsedToday - 1}/${maxDaily}). Upgrade your plan for more compiles.`
      );
    }

    const remaining =
      maxDaily === Infinity
        ? undefined
        : Math.max(0, maxDaily - compilesUsedToday);

    // 4. Compute source hash
    const sourceHash = crypto
      .createHash("sha256")
      .update(args.source)
      .digest("hex");

    // 5. Check server-side cache (PDF in Convex storage)
    const cached = await ctx.runQuery(internal.latex.findCachedCompilation, {
      documentId: args.documentId,
      sourceHash,
    });

    if (cached?.pdfStorageId) {
      const pdfUrl = await ctx.storage.getUrl(cached.pdfStorageId);
      if (pdfUrl) {
        try {
          const pdfResponse = await fetch(pdfUrl);
          const pdfBuffer = await pdfResponse.arrayBuffer();
          const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
          // Rollback the compile count — cache hit doesn't count
          await ctx.runMutation(internal.users.decrementCompiles, { userId: user._id });
          return {
            compilationId: cached._id,
            status: "success" as const,
            pdfBase64,
            logs: cached.logs,
            cached: true,
            remainingCompiles: remaining !== undefined ? remaining + 1 : undefined,
            durationMs: 0,
          };
        } catch {
          // Storage fetch failed — fall through to recompile
        }
      }
    }

    // 6. Create compilation record (with tier for rate-limiting)
    const compilationId = await ctx.runMutation(
      internal.latex.createCompilation,
      {
        userId: user._id,
        documentId: args.documentId,
        sourceHash,
        engine,
        tier: user.tier,
      }
    );

    // 7. Mark as compiling
    await ctx.runMutation(internal.latex.updateCompilation, {
      compilationId,
      status: "compiling",
    });

    // 8. Call external LaTeX API
    const apiUrl = process.env.LATEX_API_URL;
    if (!apiUrl) {
      await ctx.runMutation(internal.users.decrementCompiles, { userId: user._id });
      await ctx.runMutation(internal.latex.updateCompilation, {
        compilationId,
        status: "error",
        errors: "LATEX_API_URL is not configured",
        durationMs: Date.now() - startTime,
      });
      throw new Error("LaTeX compilation service is not configured");
    }

    const apiSecret = process.env.LATEX_API_SECRET;
    if (!apiSecret) {
      await ctx.runMutation(internal.users.decrementCompiles, { userId: user._id });
      await ctx.runMutation(internal.latex.updateCompilation, {
        compilationId,
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
          engine,
          document_id: args.documentId,
        }),
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to reach LaTeX API";
      await ctx.runMutation(internal.users.decrementCompiles, { userId: user._id });
      await ctx.runMutation(internal.latex.updateCompilation, {
        compilationId,
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
      await ctx.runMutation(internal.users.decrementCompiles, { userId: user._id });
      await ctx.runMutation(internal.latex.updateCompilation, {
        compilationId,
        status: "error",
        errors: errorMsg,
        durationMs: Date.now() - startTime,
      });
      throw new Error(errorMsg);
    }

    const result = await response.json();
    const durationMs = Date.now() - startTime;

    // 9. Handle error response
    if (!response.ok || result.error) {
      await ctx.runMutation(internal.latex.updateCompilation, {
        compilationId,
        status: "error",
        logs: result.logs,
        errors: result.error ?? `HTTP ${response.status}`,
        durationMs,
      });
      return {
        compilationId,
        status: "error" as const,
        logs: result.logs,
        errors: result.error ?? `HTTP ${response.status}`,
        cached: false,
        remainingCompiles: remaining,
      };
    }

    // 10. Store PDF in Convex storage for caching
    let pdfStorageId: Id<"_storage"> | undefined;
    try {
      const pdfBytes = Buffer.from(result.pdf, "base64");
      pdfStorageId = await ctx.storage.store(
        new Blob([pdfBytes], { type: "application/pdf" })
      );
    } catch {
      // Storage failed — continue without caching
    }

    // 11. Update compilation record
    await ctx.runMutation(internal.latex.updateCompilation, {
      compilationId,
      status: "success",
      logs: result.logs,
      durationMs,
      ...(pdfStorageId ? { pdfStorageId } : {}),
    });

    // 12. Update document compile timestamp
    await ctx.runMutation(internal.latex.updateDocumentCompileTime, {
      documentId: args.documentId,
    });

    return {
      compilationId,
      status: "success" as const,
      pdfBase64: result.pdf,
      logs: result.logs,
      cached: false,
      remainingCompiles: remaining,
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
