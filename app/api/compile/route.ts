import { createHash, createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Parse and validate body
    const body = await request.json();
    const { source, documentId, engine = "pdflatex-fast" } = body;

    if (!source || typeof source !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'source' field" },
        { status: 400 }
      );
    }

    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'documentId' field" },
        { status: 400 }
      );
    }

    // 3. Check env vars
    const apiUrl = process.env.LATEX_API_URL;
    const apiSecret = process.env.LATEX_API_SECRET;

    if (!apiUrl || !apiSecret) {
      return NextResponse.json(
        { error: "LaTeX compilation service is not configured" },
        { status: 500 }
      );
    }

    // 4. Compute source hash and HMAC
    const sourceHash = createHash("sha256").update(source).digest("hex");
    const hmac = createHmac("sha256", apiSecret).update(source).digest("hex");

    // 5. Call LaTeX API directly (bypass Convex)
    const startTime = Date.now();
    let response: Response;
    try {
      response = await fetch(`${apiUrl}/compile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Secret": hmac,
        },
        body: JSON.stringify({
          source,
          engine,
          document_id: documentId,
        }),
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to reach LaTeX API";
      return NextResponse.json(
        { error: `LaTeX API unreachable: ${msg}` },
        { status: 502 }
      );
    }

    const durationMs = Date.now() - startTime;

    // 6. Validate response format
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: `LaTeX API returned non-JSON (HTTP ${response.status}): ${text.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const result = await response.json();

    // 7. Handle compilation error
    if (!response.ok || result.error) {
      return NextResponse.json(
        {
          error:
            result.error ?? `Compilation failed (HTTP ${response.status})`,
          logs: result.logs,
        },
        { status: 422 }
      );
    }

    // 8. Return PDF as binary response (no base64 round-trip to client)
    const pdfBuffer = Buffer.from(result.pdf, "base64");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.length),
        "X-Compile-Duration": String(result.duration_ms ?? durationMs),
        "X-Source-Hash": sourceHash,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
