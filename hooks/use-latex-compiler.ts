"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

type CompilerStatus = "idle" | "compiling" | "success" | "error" | "offline" | "quota_exceeded";

interface UseLatexCompilerOptions {
  documentId: Id<"documents"> | null;
}

interface UseLatexCompilerReturn {
  status: CompilerStatus;
  pdfBlobUrl: string | null;
  compilationId: Id<"compilations"> | null;
  error: string | null;
  durationMs: number | null;
  remainingCompiles: number | null;
  compileServer: (source: string, engine?: string) => Promise<void>;
}

/** Hash source string using SHA-256 and return hex digest. */
async function hashSource(source: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(source);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function useLatexCompiler({
  documentId,
}: UseLatexCompilerOptions): UseLatexCompilerReturn {
  const [status, setStatus] = useState<CompilerStatus>("idle");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [compilationId, setCompilationId] = useState<Id<"compilations"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [remainingCompiles, setRemainingCompiles] = useState<number | null>(null);

  // Track current blob URL for revocation
  const currentBlobUrlRef = useRef<string | null>(null);
  // Client-side hash cache: sourceHash → blob URL (avoids re-compiling identical source)
  const cacheRef = useRef<Map<string, string>>(new Map());

  const compile = useAction(api.latexNode.compile);

  // Revoke old blob URL and set new one
  const setBlobUrl = useCallback((url: string | null) => {
    // Don't revoke cached URLs — they're managed by the cache
    setPdfBlobUrl(url);
    currentBlobUrlRef.current = url;
  }, []);

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of cacheRef.current.values()) {
        URL.revokeObjectURL(url);
      }
      cacheRef.current.clear();
    };
  }, []);

  const compileServer = useCallback(
    async (source: string, engine?: string) => {
      if (!documentId) {
        toast.error("Nenhum documento selecionado");
        return;
      }

      // Check client-side hash cache
      const sourceHash = await hashSource(source);
      const cachedUrl = cacheRef.current.get(sourceHash);
      if (cachedUrl) {
        setStatus("success");
        setBlobUrl(cachedUrl);
        setDurationMs(null);
        toast.success("Compilado (cache)");
        return;
      }

      setStatus("compiling");
      setError(null);
      const startTime = Date.now();

      try {
        const result = await compile({ documentId, source, engine });

        if (result.remainingCompiles !== undefined) {
          setRemainingCompiles(result.remainingCompiles ?? null);
        }

        if (result.status === "success" && result.pdfBase64) {
          // Decode base64 → blob URL
          const binaryString = atob(result.pdfBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);

          // Store in cache
          cacheRef.current.set(sourceHash, url);

          setStatus("success");
          setBlobUrl(url);
          setCompilationId(result.compilationId ?? null);
          setDurationMs(Date.now() - startTime);
          toast.success("Compilado com sucesso");
        } else if (result.status === "success") {
          // Success but no PDF data (shouldn't happen normally)
          setStatus("success");
          setCompilationId(result.compilationId ?? null);
          setDurationMs(Date.now() - startTime);
          toast.success("Compilado com sucesso");
        } else {
          const msg = result.errors ?? "Erro de compilacao desconhecido";
          setStatus("error");
          setError(msg);
          toast.error("Erro na compilacao", { description: msg });
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro inesperado na compilacao";

        if (msg.includes("Daily compilation limit")) {
          setStatus("quota_exceeded");
          setError("Limite diario de compilacoes atingido");
          toast.error("Limite diario atingido", {
            description: "Faca upgrade do plano para mais compilacoes.",
          });
        } else if (msg.includes("Rate limit exceeded")) {
          // Per-minute rate limit — keep status retryable
          setStatus("error");
          setError("Aguarde um momento antes de compilar novamente");
          toast.warning("Aguarde um momento", {
            description: "Muitas compilacoes em sequencia.",
          });
        } else if (
          msg.toLowerCase().includes("offline") ||
          msg.includes("ECONNREFUSED") ||
          msg.toLowerCase().includes("fetch failed")
        ) {
          setStatus("offline");
          setError("Servidor de compilacao indisponivel");
          toast.error("Servidor de compilacao offline");
        } else {
          setStatus("error");
          setError(msg);
          toast.error("Erro na compilacao", { description: msg });
        }
      }
    },
    [compile, documentId, setBlobUrl]
  );

  return { status, pdfBlobUrl, compilationId, error, durationMs, remainingCompiles, compileServer };
}

export type { CompilerStatus, UseLatexCompilerOptions, UseLatexCompilerReturn };
