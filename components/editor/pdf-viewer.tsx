"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, FileText } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { type PageFormat, PAGE_FORMATS } from "@/lib/latex/page-formats";

interface PdfViewerProps {
  serverPdfBlobUrl: string | null;
  serverCompiling: boolean;
  serverError: string | null;
  remainingCompiles: number | null;
  maxCompilesPerDay: number | null;
  pageFormat?: PageFormat;
}

export function PdfViewer({
  serverPdfBlobUrl,
  serverCompiling,
  serverError,
  remainingCompiles,
  maxCompilesPerDay,
  pageFormat,
}: PdfViewerProps) {
  const fmt = pageFormat ?? PAGE_FORMATS.a4;

  const [zoom, setZoom] = useState(100);
  const [baseScale, setBaseScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute scale so the page fits the panel width at 100% zoom
  const updateBaseScale = useCallback(() => {
    if (!containerRef.current) return;
    const availableWidth = containerRef.current.clientWidth - 32; // minus p-4 padding
    setBaseScale(Math.min(1, availableWidth / fmt.widthPx));
  }, [fmt.widthPx]);

  useEffect(() => {
    updateBaseScale();
    const ro = new ResizeObserver(updateBaseScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateBaseScale]);

  // Format label shown as a small badge
  const formatLabel = fmt.isSlide ? fmt.label : fmt.label.split(" ")[0];

  const showQuotaBadge =
    remainingCompiles != null &&
    maxCompilesPerDay != null &&
    maxCompilesPerDay !== Infinity;

  return (
    <div className="flex h-full flex-col bg-card/45">
      {/* Header: format badge + quota + zoom controls */}
      <div className="flex h-9 items-center justify-between border-b border-border/45 bg-card/75 px-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border/40 bg-card/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {formatLabel}
          </span>
          {showQuotaBadge && (
            <span className="rounded-md border border-border/40 bg-card/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {remainingCompiles}/{maxCompilesPerDay}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
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
            className="h-7 w-7 rounded-full"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => setZoom(100)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="relative flex-1 overflow-auto p-4">
        {/* Compiling overlay — shown on top of last PDF without unmounting */}
        {serverCompiling && serverPdfBlobUrl && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <p className="text-sm text-muted-foreground">Compilando...</p>
            </div>
          </div>
        )}

        {/* First compile — no PDF yet, centered spinner */}
        {serverCompiling && !serverPdfBlobUrl && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <p className="text-sm text-muted-foreground">Compilando PDF...</p>
            </div>
          </div>
        )}

        {/* Server error */}
        {serverError && !serverCompiling && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="font-medium text-destructive">
                  Erro de Compilação
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Ocorreu um erro ao compilar o PDF no servidor.
              </p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono rounded bg-destructive/5 p-3 border border-destructive/10">
                {serverError}
              </pre>
            </div>
          </div>
        )}

        {/* PDF iframe — always mounted when URL exists */}
        {serverPdfBlobUrl && !serverError && (
          <div
            style={{
              transform: `scale(${baseScale * zoom / 100})`,
              transformOrigin: "0 0",
              width: `${100 / (baseScale * zoom / 100)}%`,
              height: `${100 / (baseScale * zoom / 100)}%`,
            }}
          >
            <iframe
              src={serverPdfBlobUrl + "#toolbar=1&navpanes=0"}
              className="h-full w-full border-0"
            />
          </div>
        )}

        {/* Empty state — no PDF yet, not compiling, no error */}
        {!serverPdfBlobUrl && !serverCompiling && !serverError && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/35 bg-primary/12">
                <FileText className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhum PDF disponível
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Clique em Compilar para gerar o PDF
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
