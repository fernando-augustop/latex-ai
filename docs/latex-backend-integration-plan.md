# LaTeX Backend Compilation — Full Integration Plan

## Your Current Stack

- **Frontend**: Next.js + shadcn/ui (Vercel)
- **Backend/DB**: Convex (real-time)
- **Client-side Preview**: LaTeX.js (already installed)
- **Infrastructure**: Omarchy machine (local/office) + Tailscale network
- **Tunnel**: Cloudflare Tunnel (exposes LaTeX API to internet)
- **Dev Tooling**: Claude Code + Context7 MCP

---

## Architecture Overview

```
┌─────────────────────────────────┐
│  Next.js Frontend (Vercel)      │
│  ┌────────────┐  ┌───────────┐  │
│  │ LaTeX.js   │  │ Monaco/   │  │
│  │ (preview)  │  │ CodeMirror│  │
│  └────────────┘  └───────────┘  │
│         │                       │
│    Live Preview         Full Compile Request
│    (client-side)        (on save / on demand)
│         │                   │
└─────────────────────────────┼───┘
                              │
                              ▼
┌─────────────────────────────────┐
│  Convex Backend (Cloud)         │
│  ┌──────────────────────────┐   │
│  │ compilations table       │   │
│  │ - userId, source, status │   │
│  │ - pdfUrl, errors, logs   │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ HTTP Action              │   │
│  │ → POST to Cloudflare     │   │
│  │   Tunnel endpoint        │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
                              │
                     Cloudflare Tunnel
                     (auto HTTPS, zero-trust)
                              │
                              ▼
┌─────────────────────────────────┐
│  Omarchy Machine (Office)       │
│  ┌──────────────────────────┐   │
│  │ Tectonic / TeX Live      │   │
│  │ + FastAPI on :8787       │   │
│  │ + systemd service        │   │
│  └──────────────────────────┘   │
│         │                       │
│    Returns PDF buffer           │
│    + compilation logs           │
└─────────────────────────────────┘
```

### Why This Architecture Works

- **LaTeX.js** handles instant client-side preview (no network round-trip)
- **Tectonic on your Omarchy** handles full compilation with 100% LaTeX fidelity
- **Cloudflare Tunnel** exposes your local machine securely — no port forwarding, no static IP needed
- **Convex** orchestrates everything with real-time status updates
- **Convex Storage** stores compiled PDFs so they're served from CDN, not your office connection

---

## Phase 1: LaTeX Compilation API on Omarchy

### 1.1 Install Tectonic (Recommended) or TeX Live

**Option A — Tectonic** (lean, ~50MB, auto-downloads packages):
```bash
curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh

# Verify
tectonic --version

# Pre-cache common packages (optional, avoids first-compile delay)
echo '\documentclass{article}\usepackage{amsmath,graphicx,hyperref}\begin{document}Hello\end{document}' > /tmp/test.tex
tectonic /tmp/test.tex
```

**Option B — TeX Live** (full, ~5GB, all packages):
```bash
sudo apt update && sudo apt install -y texlive-full
```

**Recommendation**: Start with **Tectonic**. Fall back to TeX Live only if you need exotic packages not in Tectonic's bundle.

### 1.2 FastAPI Compilation Service

```python
# /opt/latex-api/main.py
import os
import uuid
import subprocess
import tempfile
import base64
import hmac
import hashlib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="LaTeX Compilation API")

API_SECRET = os.environ.get("LATEX_API_SECRET", "change-me")

class CompileRequest(BaseModel):
    source: str
    engine: str = "tectonic"  # or "pdflatex", "lualatex", "xelatex"
    token: str  # HMAC auth token

class CompileResponse(BaseModel):
    success: bool
    pdf_base64: str | None = None
    logs: str = ""
    errors: str = ""

def verify_token(source: str, token: str) -> bool:
    expected = hmac.new(
        API_SECRET.encode(), source.encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, token)

@app.post("/compile", response_model=CompileResponse)
async def compile_latex(req: CompileRequest):
    if not verify_token(req.source, req.token):
        raise HTTPException(status_code=401, detail="Invalid token")

    # Source size limit
    if len(req.source) > 500_000:
        raise HTTPException(status_code=413, detail="Source too large (max 500KB)")

    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "document.tex")
        pdf_path = os.path.join(tmpdir, "document.pdf")

        with open(tex_path, "w") as f:
            f.write(req.source)

        try:
            if req.engine == "tectonic":
                result = subprocess.run(
                    ["tectonic", tex_path, "--outdir", tmpdir],
                    capture_output=True, text=True, timeout=30
                )
            else:
                result = subprocess.run(
                    [req.engine, "-interaction=nonstopmode",
                     f"-output-directory={tmpdir}", tex_path],
                    capture_output=True, text=True, timeout=30
                )

            if os.path.exists(pdf_path):
                with open(pdf_path, "rb") as f:
                    pdf_b64 = base64.b64encode(f.read()).decode()
                return CompileResponse(
                    success=True,
                    pdf_base64=pdf_b64,
                    logs=result.stdout[-2000:] if result.stdout else ""
                )
            else:
                return CompileResponse(
                    success=False,
                    logs=result.stdout[-2000:] if result.stdout else "",
                    errors=result.stderr[-2000:] if result.stderr else "No PDF generated"
                )
        except subprocess.TimeoutExpired:
            return CompileResponse(
                success=False,
                errors="Compilation timed out (30s limit)"
            )

@app.get("/health")
async def health():
    return {"status": "ok", "machine": "omarchy"}
```

### 1.3 Deploy as Systemd Service

```bash
# Install dependencies
pip install fastapi uvicorn --break-system-packages

# Create the service
sudo tee /etc/systemd/system/latex-api.service << 'EOF'
[Unit]
Description=LaTeX Compilation API
After=network.target

[Service]
Type=simple
User=$USER
Environment=LATEX_API_SECRET=your-secret-here
WorkingDirectory=/opt/latex-api
ExecStart=/usr/local/bin/uvicorn main:app --host 127.0.0.1 --port 8787
Restart=always
RestartSec=5

# Sandboxing
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now latex-api

# Verify it's running
curl http://localhost:8787/health
```

---

## Phase 2: Cloudflare Tunnel (Expose to Internet)

This is what lets Convex (running in the cloud) reach your Omarchy machine in the office. No port forwarding, no static IP, automatic HTTPS.

### 2.1 Install Cloudflared

```bash
# Debian/Ubuntu
curl -fsSL https://pkg.cloudflare.com/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Or Arch-based
yay -S cloudflared
```

### 2.2 Authenticate & Create Tunnel

```bash
# Login (opens browser)
cloudflared tunnel login

# Create a named tunnel
cloudflared tunnel create latex-api

# Note the tunnel ID (e.g., a1b2c3d4-...) and credentials file path
```

### 2.3 Configure Tunnel

```bash
mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: latex-api
credentials-file: /home/YOUR_USER/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: latex.yourdomain.com
    service: http://localhost:8787
    originRequest:
      noTLSVerify: true
  - service: http_status:404
EOF
```

### 2.4 Route DNS & Run

```bash
# Point your subdomain to the tunnel
cloudflared tunnel route dns latex-api latex.yourdomain.com

# Test run
cloudflared tunnel run latex-api
```

### 2.5 Run as Systemd Service (Persistent)

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared

# Verify tunnel is live
curl https://latex.yourdomain.com/health
# Should return: {"status":"ok","machine":"omarchy"}
```

### 2.6 Optional: Cloudflare Access (Zero-Trust)

For extra security, add Cloudflare Access policies so only your Convex backend can reach the API:

1. Go to Cloudflare Zero Trust dashboard
2. Create an Access Application for `latex.yourdomain.com`
3. Add a Service Token policy (Convex will send the token in headers)
4. Update your Convex action to include the `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers

This prevents anyone else from hitting your compilation endpoint even though it's public.

---

## Phase 3: Convex Backend Integration

### 3.1 Schema

```typescript
// convex/schema.ts — add to your existing schema
import { defineTable } from "convex/server";
import { v } from "convex/values";

// Add these tables to your existing defineSchema({})
compilations: defineTable({
  userId: v.id("users"),
  documentId: v.id("documents"),
  source: v.string(),
  sourceHash: v.string(),  // for caching
  status: v.union(
    v.literal("pending"),
    v.literal("compiling"),
    v.literal("success"),
    v.literal("error")
  ),
  engine: v.optional(v.string()),
  pdfStorageId: v.optional(v.id("_storage")),
  logs: v.optional(v.string()),
  errors: v.optional(v.string()),
  compiledAt: v.optional(v.number()),
  durationMs: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_document", ["documentId"])
  .index("by_document_hash", ["documentId", "sourceHash"])
  .index("by_status", ["status"]),

documents: defineTable({
  userId: v.id("users"),
  title: v.string(),
  source: v.string(),
  lastCompiledAt: v.optional(v.number()),
  lastPdfStorageId: v.optional(v.id("_storage")),
  templateId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_updated", ["userId", "updatedAt"]),
```

### 3.2 HTTP Action — Compile Endpoint

```typescript
// convex/latex.ts
import { v } from "convex/values";
import { action, mutation, query, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import crypto from "crypto";

const LATEX_API_URL = process.env.LATEX_API_URL!;       // https://latex.yourdomain.com
const LATEX_API_SECRET = process.env.LATEX_API_SECRET!;

function generateToken(source: string): string {
  return crypto
    .createHmac("sha256", LATEX_API_SECRET)
    .update(source)
    .digest("hex");
}

function hashSource(source: string): string {
  return crypto.createHash("sha256").update(source).digest("hex");
}

// Main compile action
export const compile = action({
  args: {
    documentId: v.id("documents"),
    source: v.string(),
    engine: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check compilation cache (same source = same PDF)
    const sourceHash = hashSource(args.source);
    const cached = await ctx.runQuery(api.latex.findCachedCompilation, {
      documentId: args.documentId,
      sourceHash,
    });

    if (cached?.pdfStorageId) {
      await ctx.runMutation(api.latex.updateDocumentPdf, {
        documentId: args.documentId,
        pdfStorageId: cached.pdfStorageId,
      });
      return {
        success: true,
        cached: true,
        compilationId: cached._id,
        storageId: cached.pdfStorageId,
      };
    }

    // Create compilation record
    const compilationId = await ctx.runMutation(
      api.latex.createCompilation,
      {
        documentId: args.documentId,
        source: args.source,
        sourceHash,
        engine: args.engine ?? "tectonic",
      }
    );

    await ctx.runMutation(api.latex.updateCompilation, {
      compilationId,
      status: "compiling",
    });

    const startTime = Date.now();

    try {
      // Call Omarchy LaTeX API via Cloudflare Tunnel
      const token = generateToken(args.source);
      const response = await fetch(`${LATEX_API_URL}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: args.source,
          engine: args.engine ?? "tectonic",
          token,
        }),
      });

      if (!response.ok) {
        throw new Error(`LaTeX API returned ${response.status}`);
      }

      const result = await response.json();
      const durationMs = Date.now() - startTime;

      if (result.success && result.pdf_base64) {
        // Store PDF in Convex storage (served from CDN, not your office)
        const pdfBuffer = Buffer.from(result.pdf_base64, "base64");
        const blob = new Blob([pdfBuffer], { type: "application/pdf" });
        const storageId = await ctx.storage.store(blob);

        await ctx.runMutation(api.latex.updateCompilation, {
          compilationId,
          status: "success",
          pdfStorageId: storageId,
          logs: result.logs,
          durationMs,
        });

        await ctx.runMutation(api.latex.updateDocumentPdf, {
          documentId: args.documentId,
          pdfStorageId: storageId,
        });

        return { success: true, compilationId, storageId };
      } else {
        await ctx.runMutation(api.latex.updateCompilation, {
          compilationId,
          status: "error",
          errors: result.errors,
          logs: result.logs,
          durationMs,
        });
        return { success: false, compilationId, errors: result.errors };
      }
    } catch (error: any) {
      const durationMs = Date.now() - startTime;

      // Detect if it's a connectivity issue (machine offline)
      const isOffline =
        error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("502") ||
        error.message.includes("503");

      await ctx.runMutation(api.latex.updateCompilation, {
        compilationId,
        status: "error",
        errors: isOffline
          ? "Compilation server is offline. Please try again later."
          : error.message,
        durationMs,
      });

      return {
        success: false,
        compilationId,
        errors: isOffline
          ? "Compilation server is offline"
          : error.message,
      };
    }
  },
});

// --- Mutations ---

export const createCompilation = mutation({
  args: {
    documentId: v.id("documents"),
    source: v.string(),
    sourceHash: v.string(),
    engine: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    // Rate limit: max 10 compilations per minute per user
    const oneMinuteAgo = Date.now() - 60_000;
    const recent = await ctx.db
      .query("compilations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(11);
    const recentCount = recent.filter(
      (c) => c._creationTime > oneMinuteAgo
    ).length;
    if (recentCount >= 10) {
      throw new Error("Rate limit: max 10 compilations per minute");
    }

    return await ctx.db.insert("compilations", {
      userId: user._id,
      documentId: args.documentId,
      source: args.source,
      sourceHash: args.sourceHash,
      status: "pending",
      engine: args.engine,
    });
  },
});

export const updateCompilation = mutation({
  args: {
    compilationId: v.id("compilations"),
    status: v.union(
      v.literal("pending"),
      v.literal("compiling"),
      v.literal("success"),
      v.literal("error")
    ),
    pdfStorageId: v.optional(v.id("_storage")),
    logs: v.optional(v.string()),
    errors: v.optional(v.string()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { compilationId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    if (args.status === "success") {
      (filtered as any).compiledAt = Date.now();
    }
    await ctx.db.patch(compilationId, filtered);
  },
});

export const updateDocumentPdf = mutation({
  args: {
    documentId: v.id("documents"),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      lastPdfStorageId: args.pdfStorageId,
      lastCompiledAt: Date.now(),
    });
  },
});

// --- Queries ---

export const getCompilation = query({
  args: { compilationId: v.id("compilations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.compilationId);
  },
});

export const getPdfUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getDocumentCompilations = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("compilations")
      .withIndex("by_document", (q) =>
        q.eq("documentId", args.documentId)
      )
      .order("desc")
      .take(10);
  },
});

export const findCachedCompilation = query({
  args: {
    documentId: v.id("documents"),
    sourceHash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("compilations")
      .withIndex("by_document_hash", (q) =>
        q.eq("documentId", args.documentId).eq("sourceHash", args.sourceHash)
      )
      .filter((q) => q.eq(q.field("status"), "success"))
      .first();
  },
});
```

### 3.3 Environment Variables in Convex

```bash
npx convex env set LATEX_API_URL https://latex.yourdomain.com
npx convex env set LATEX_API_SECRET your-secret-here
```

---

## Phase 4: Frontend Integration

### 4.1 Compile Hook

```typescript
// hooks/use-latex-compiler.ts
"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export function useLatexCompiler(documentId: Id<"documents">) {
  const compileAction = useAction(api.latex.compile);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCompilationId, setLastCompilationId] =
    useState<Id<"compilations"> | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const compile = useCallback(
    async (source: string, engine?: string) => {
      setIsCompiling(true);
      setError(null);

      try {
        const result = await compileAction({
          documentId,
          source,
          engine,
        });

        if (result.success) {
          setLastCompilationId(result.compilationId);
          if (result.cached) {
            toast.success("PDF loaded from cache");
          } else {
            toast.success("Compilation successful");
          }
        } else {
          setError(result.errors ?? "Compilation failed");
          toast.error(result.errors ?? "Compilation failed");
        }

        return result;
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
        return { success: false, errors: err.message };
      } finally {
        setIsCompiling(false);
      }
    },
    [compileAction, documentId]
  );

  // Auto-compile with debounce
  const autoCompile = useCallback(
    (source: string, delayMs = 2000) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => compile(source), delayMs);
    },
    [compile]
  );

  const cancelAutoCompile = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return {
    compile,
    autoCompile,
    cancelAutoCompile,
    isCompiling,
    error,
    lastCompilationId,
  };
}
```

### 4.2 PDF Viewer Component

```tsx
// components/pdf-viewer.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, FileWarning } from "lucide-react";

interface PdfViewerProps {
  storageId: Id<"_storage"> | null | undefined;
  className?: string;
}

export function PdfViewer({ storageId, className }: PdfViewerProps) {
  const pdfUrl = useQuery(
    api.latex.getPdfUrl,
    storageId ? { storageId } : "skip"
  );

  if (!storageId) {
    return (
      <div className="flex flex-col items-center justify-center h-full
                      text-muted-foreground gap-2">
        <FileWarning className="h-8 w-8" />
        <p>No PDF compiled yet.</p>
        <p className="text-xs">Press Ctrl+S or click Compile.</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <iframe
      src={`${pdfUrl}#toolbar=1&navpanes=0`}
      className={className ?? "w-full h-full border-0"}
      title="Compiled PDF"
    />
  );
}
```

### 4.3 Compilation Status Component

```tsx
// components/compilation-status.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Loader2, WifiOff } from "lucide-react";

export function CompilationStatus({
  documentId,
}: {
  documentId: Id<"documents">;
}) {
  const compilations = useQuery(api.latex.getDocumentCompilations, {
    documentId,
  });

  const latest = compilations?.[0];
  if (!latest) return null;

  const isOffline = latest.errors?.includes("offline");

  return (
    <div className="flex items-center gap-2 text-xs">
      {latest.status === "success" && (
        <Badge variant="outline" className="text-green-600 gap-1">
          <CheckCircle className="h-3 w-3" />
          Compiled {latest.durationMs ? `(${latest.durationMs}ms)` : ""}
        </Badge>
      )}
      {latest.status === "compiling" && (
        <Badge variant="outline" className="text-blue-600 gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Compiling...
        </Badge>
      )}
      {latest.status === "error" && (
        <Badge variant="destructive" className="gap-1">
          {isOffline ? (
            <WifiOff className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {isOffline ? "Server offline" : "Error"}
        </Badge>
      )}
      {latest.status === "pending" && (
        <Badge variant="outline" className="text-yellow-600 gap-1">
          <Clock className="h-3 w-3" />
          Queued
        </Badge>
      )}
    </div>
  );
}
```

### 4.4 Editor Page (Full Assembly)

```tsx
// app/editor/[documentId]/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLatexCompiler } from "@/hooks/use-latex-compiler";
import { PdfViewer } from "@/components/pdf-viewer";
import { CompilationStatus } from "@/components/compilation-status";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Loader2, Play, Eye, Code } from "lucide-react";

export default function EditorPage({
  params,
}: {
  params: { documentId: string };
}) {
  const documentId = params.documentId as Id<"documents">;
  const document = useQuery(api.documents.get, { id: documentId });
  const updateDocument = useMutation(api.documents.update);

  const [source, setSource] = useState("");
  const [previewMode, setPreviewMode] = useState<"latex.js" | "pdf">("pdf");

  const { compile, autoCompile, cancelAutoCompile, isCompiling, error } =
    useLatexCompiler(documentId);

  useEffect(() => {
    if (document?.source && !source) {
      setSource(document.source);
    }
  }, [document?.source]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleCompile();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [source]);

  const handleCompile = useCallback(async () => {
    cancelAutoCompile();
    await updateDocument({
      id: documentId,
      source,
      updatedAt: Date.now(),
    });
    await compile(source);
  }, [source, documentId]);

  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    autoCompile(newSource, 3000);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="border-b px-4 py-2 flex items-center gap-3">
        <h1 className="font-semibold truncate">
          {document?.title ?? "Loading..."}
        </h1>

        <CompilationStatus documentId={documentId} />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPreviewMode(previewMode === "pdf" ? "latex.js" : "pdf")
            }
          >
            {previewMode === "pdf" ? (
              <>
                <Eye className="h-4 w-4 mr-1" /> Live Preview
              </>
            ) : (
              <>
                <Code className="h-4 w-4 mr-1" /> PDF View
              </>
            )}
          </Button>

          <Button size="sm" onClick={handleCompile} disabled={isCompiling}>
            {isCompiling ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Compile (Ctrl+S)
          </Button>
        </div>
      </div>

      {/* Editor + Preview */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          {/* Replace textarea with CodeMirror/Monaco + LaTeX syntax */}
          <textarea
            value={source}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none
                       focus:outline-none bg-background"
            spellCheck={false}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          {previewMode === "pdf" ? (
            <PdfViewer storageId={document?.lastPdfStorageId} />
          ) : (
            <div className="p-4 overflow-auto h-full">
              <LatexJsPreview source={source} />
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Error panel */}
      {error && (
        <div className="border-t bg-destructive/10 p-3 text-sm
                        text-destructive font-mono max-h-32 overflow-auto">
          {error}
        </div>
      )}
    </div>
  );
}

function LatexJsPreview({ source }: { source: string }) {
  // Your existing LaTeX.js integration
  return <div id="latex-preview">{/* LaTeX.js rendered output */}</div>;
}
```

---

## Phase 5: Production Hardening

### 5.1 Handle Machine Offline Gracefully

Since your Omarchy is in your office, it could go offline (power, internet, reboot). The Convex action already detects this and returns a friendly error. On the frontend, the `CompilationStatus` component shows a wifi-off icon.

**Optional: Health check cron in Convex**

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check-latex-api-health",
  { minutes: 5 },
  internal.latex.checkHealth
);

export default crons;
```

```typescript
// Add to convex/latex.ts
export const checkHealth = internalAction({
  handler: async (ctx) => {
    try {
      const res = await fetch(`${LATEX_API_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      const ok = res.ok;
      await ctx.runMutation(internal.latex.setApiStatus, { online: ok });
    } catch {
      await ctx.runMutation(internal.latex.setApiStatus, { online: false });
    }
  },
});
```

### 5.2 Sandboxing (Security for Multi-User SaaS)

If untrusted users submit LaTeX, sandbox compilation:

```bash
sudo apt install bubblewrap

# Wrap tectonic in a sandbox (no network, isolated /tmp)
bwrap --ro-bind / / \
      --tmpfs /tmp \
      --dev /dev \
      --proc /proc \
      --unshare-net \
      --die-with-parent \
      tectonic /tmp/document.tex
```

Update the FastAPI subprocess call to use `bwrap`.

### 5.3 Cleanup Cron on Omarchy

```bash
# /etc/cron.daily/latex-cleanup
#!/bin/bash
find /tmp -name "*.tex" -mtime +1 -delete
find /tmp -name "*.pdf" -mtime +1 -delete
find /tmp -name "*.aux" -mtime +1 -delete
find /tmp -name "*.log" -mtime +1 -delete
```

---

## Phase 6: Optional Enhancements

### 6.1 Multi-file Projects (BibTeX, images, custom .sty)

```python
# Add to FastAPI
@app.post("/compile-project")
async def compile_project(file: UploadFile, token: str = Form(...)):
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = os.path.join(tmpdir, "project.zip")
        with open(zip_path, "wb") as f:
            f.write(await file.read())

        import zipfile
        with zipfile.ZipFile(zip_path) as z:
            z.extractall(tmpdir)

        main_tex = os.path.join(tmpdir, "main.tex")
        if not os.path.exists(main_tex):
            raise HTTPException(400, "No main.tex found in archive")

        # compile as before...
```

### 6.2 Template Library

```typescript
// Add to schema
templates: defineTable({
  name: v.string(),
  description: v.string(),
  source: v.string(),
  category: v.string(),  // "academic", "report", "letter", "resume", "actuarial"
  thumbnailStorageId: v.optional(v.id("_storage")),
  isPublic: v.boolean(),
  createdBy: v.optional(v.id("users")),
}).index("by_category", ["category"]),
```

### 6.3 Engine Selection Per Document

| Engine | Best For | Speed |
|--------|----------|-------|
| Tectonic | General purpose, auto packages | Fast |
| pdflatex | Legacy documents, PSTricks | Fast |
| lualatex | Unicode-heavy, custom fonts | Slower |
| xelatex | System fonts, multilingual | Medium |

---

## Implementation Order

| Step | What | Time Est. | Priority |
|------|------|-----------|----------|
| 1 | Install Tectonic on Omarchy | 15 min | 🔴 |
| 2 | Deploy FastAPI service + systemd | 1.5 hrs | 🔴 |
| 3 | Set up Cloudflare Tunnel + DNS | 1 hr | 🔴 |
| 4 | Add Convex schema + compile action | 2 hrs | 🔴 |
| 5 | Build frontend hook + PDF viewer | 2 hrs | 🔴 |
| 6 | Wire up editor page with split view | 3 hrs | 🔴 |
| 7 | Rate limiting + caching | 1 hr | 🟡 |
| 8 | Health check cron + offline handling | 1 hr | 🟡 |
| 9 | Bubblewrap sandboxing | 1.5 hrs | 🟡 |
| 10 | Multi-file project support | 3 hrs | 🟢 |
| 11 | Template library | 4 hrs | 🟢 |
| 12 | Engine selection UI | 1 hr | 🟢 |

**Total estimated: ~22 hours of development**

---

## Cost Estimate

| Service | Monthly Cost |
|---------|-------------|
| Omarchy machine (already owned) | $0 (electricity) |
| Cloudflare Tunnel (free tier) | $0 |
| Convex (free tier → Pro) | $0–$25 |
| Vercel (free tier → Pro) | $0–$20 |
| Domain (if needed) | ~$1/month |
| **Total** | **~$0–$46/month** |

---

## Key Decisions Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| LaTeX engine | Tectonic | Lightweight, auto packages, fast |
| API framework | FastAPI (Python) | Simple, async, reliable |
| Tunnel | Cloudflare Tunnel | Free, auto HTTPS, zero-trust option |
| PDF storage | Convex Storage | CDN-served, integrated with DB |
| Client preview | LaTeX.js (existing) | Instant, no round-trip |
| Full compile | Omarchy (local) | Already owned, no monthly cost |
| Auth between services | HMAC token | Simple, no external deps |
| Caching | Source hash in Convex | Skip recompilation for identical input |

---

## Network Flow Summary

```
User types LaTeX in browser
        │
        ▼
  LaTeX.js renders instant preview (client-side)
        │
  User hits Ctrl+S
        │
        ▼
  Convex Action (cloud)
    ├── Checks cache (same hash? → return cached PDF)
    ├── Creates compilation record (status: pending → compiling)
    └── POST https://latex.yourdomain.com/compile
              │
              │  Cloudflare Tunnel
              ▼
        Omarchy (office)
          └── Tectonic compiles → returns PDF base64
              │
              │  Cloudflare Tunnel
              ▼
  Convex Action receives PDF
    ├── Stores in Convex Storage (CDN)
    ├── Updates compilation record (status: success)
    └── Updates document.lastPdfStorageId
              │
              ▼
  Frontend reactively updates (Convex real-time)
    └── PDF viewer shows new PDF from CDN
```
