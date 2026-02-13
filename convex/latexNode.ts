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

    // 5. Create compilation record (with tier for rate-limiting)
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

    // 6. Mark as compiling
    await ctx.runMutation(internal.latex.updateCompilation, {
      compilationId,
      status: "compiling",
    });

    // 7. Call external LaTeX API
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
        body: JSON.stringify({ source: args.source, engine }),
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

    // 8. Handle error response
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

    // 9. Update compilation record (no PDF storage)
    await ctx.runMutation(internal.latex.updateCompilation, {
      compilationId,
      status: "success",
      logs: result.logs,
      durationMs,
    });

    // 10. Update document compile timestamp
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
