"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, FileText } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

// A4 dimensions in px at 96 DPI
const A4_WIDTH_PX = 794;
const A4_PADDING_PX = 94; // ~25mm

interface PdfViewerProps {
  htmlContent: string | null;
  isCompiling: boolean;
  error: string | null;
}

export function PdfViewer({ htmlContent, isCompiling, error }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [baseScale, setBaseScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Compute scale so the A4 page fits the panel width at 100% zoom
  const updateBaseScale = useCallback(() => {
    if (!containerRef.current) return;
    const availableWidth = containerRef.current.clientWidth - 32; // minus p-4 padding
    setBaseScale(Math.min(1, availableWidth / A4_WIDTH_PX));
  }, []);

  useEffect(() => {
    updateBaseScale();
    const ro = new ResizeObserver(updateBaseScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateBaseScale]);

  // Render HTML content in a sandboxed iframe.
  // Content is user-generated LaTeX rendered by latex.js (not untrusted external input).
  // The sandbox attribute prevents script execution for extra isolation.
  useEffect(() => {
    if (!previewRef.current || !htmlContent) return;

    const iframe = document.createElement("iframe");
    iframe.sandbox.add("allow-same-origin");
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.minHeight = "100%";

    iframe.srcdoc = [
      "<!DOCTYPE html><html><head><style>",
      "body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; color: #000; line-height: 1.6; }",
      "h1, h2, h3 { font-family: 'Times New Roman', serif; }",
      "pre, code { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }",
      "img { max-width: 100%; }",
      "</style></head><body>",
      htmlContent,
      "</body></html>",
    ].join("");

    // Clear previous content safely
    while (previewRef.current.firstChild) {
      previewRef.current.removeChild(previewRef.current.firstChild);
    }
    previewRef.current.appendChild(iframe);

    iframe.onload = () => {
      try {
        const height = iframe.contentDocument?.documentElement?.scrollHeight;
        if (height) iframe.style.height = height + "px";
      } catch {
        // Sandboxed iframe may restrict access
      }
    };
  }, [htmlContent]);

  const effectiveScale = baseScale * (zoom / 100);

  return (
    <div className="flex h-full flex-col bg-zinc-900/50">
      {/* Zoom controls */}
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">Visualização</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center text-xs text-muted-foreground">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(100)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        {isCompiling && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <p className="text-sm text-muted-foreground">Compilando...</p>
            </div>
          </div>
        )}

        {error && !isCompiling && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="font-medium text-destructive">
                  Erro de Compilação
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Ocorreu um erro ao compilar seu documento. Verifique a sintaxe do seu código LaTeX.
              </p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono rounded bg-destructive/5 p-3 border border-destructive/10">
                {error}
              </pre>
            </div>
          </div>
        )}

        {htmlContent && !isCompiling && !error && (
          <div
            className="mx-auto overflow-hidden"
            style={{
              width: `${Math.round(A4_WIDTH_PX * effectiveScale)}px`,
              minHeight: `${Math.round(A4_WIDTH_PX * (297 / 210) * effectiveScale)}px`,
            }}
          >
            <div
              className="origin-top-left"
              style={{ transform: `scale(${effectiveScale})` }}
            >
              <div
                className="bg-white rounded shadow-lg shadow-black/20 ring-1 ring-black/5 overflow-hidden"
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  minHeight: `${Math.round(A4_WIDTH_PX * (297 / 210))}px`,
                  padding: `${A4_PADDING_PX}px`,
                }}
                ref={previewRef}
              />
            </div>
          </div>
        )}

        {!htmlContent && !isCompiling && !error && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/20 border border-border/20">
                <FileText className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhuma visualização disponível
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Clique em Compilar para gerar a visualização do documento
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
