import { NextRequest, NextResponse } from "next/server";
import { validateLatexSource } from "@/lib/latex/compiler";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { source?: string };

    if (!body.source || typeof body.source !== "string") {
      return NextResponse.json(
        { success: false, errors: ["Missing or invalid 'source' field"] },
        { status: 400 }
      );
    }

    const source = body.source;

    // Validate basic LaTeX structure
    const validationErrors = validateLatexSource(source);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 422 }
      );
    }

    // For now, return a success response indicating client-side compilation
    // should be used. Server-side compilation requires LATEX_COMPILE_API_URL.
    return NextResponse.json({
      success: true,
      mode: "client",
      message:
        "LaTeX validated successfully. Use client-side latex.js for preview rendering.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, errors: [message] },
      { status: 500 }
    );
  }
}
