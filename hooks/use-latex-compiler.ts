"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

type CompilerStatus = "idle" | "compiling" | "success" | "error" | "offline" | "quota_exceeded";

interface UseLatexCompilerOptions {
  documentId: Id<"documents"> | null;
  autoCompileEnabled?: boolean;
  autoCompileDebounceMs?: number;
}

interface UseLatexCompilerReturn {
  status: CompilerStatus;
  pdfBlobUrl: string | null;
  error: string | null;
  durationMs: number | null;
  remainingCompiles: number | null;
  compileServer: (source: string, engine?: string, options?: { silent?: boolean }) => Promise<void>;
  /** Schedule an auto-compile after debounce. Call on every editor change. */
  scheduleAutoCompile: (source: string, engine?: string) => void;
  autoCompileEnabled: boolean;
  setAutoCompileEnabled: (enabled: boolean) => void;
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
  autoCompileEnabled: initialAutoCompile = true,
  autoCompileDebounceMs = 2000,
}: UseLatexCompilerOptions): UseLatexCompilerReturn {
  const [status, setStatus] = useState<CompilerStatus>("idle");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [autoCompileEnabled, setAutoCompileEnabled] = useState(initialAutoCompile);

  // Track current blob URL for revocation
  const currentBlobUrlRef = useRef<string | null>(null);
  // Client-side hash cache: sourceHash → blob URL (avoids re-compiling identical source)
  const cacheRef = useRef<Map<string, string>>(new Map());
  // Track the hash of the last successfully compiled source
  const lastCompiledHashRef = useRef<string | null>(null);
  // Auto-compile debounce timer
  const autoCompileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if a compile is currently in progress (to prevent overlapping)
  const compilingRef = useRef(false);

  // Fire-and-forget tracking mutation (does NOT block PDF display)
  const trackCompile = useMutation(api.latex.trackDirectCompile);

  // Revoke old blob URL and set new one
  const setBlobUrl = useCallback((url: string | null) => {
    const oldUrl = currentBlobUrlRef.current;
    if (oldUrl && oldUrl !== url) {
      const isInCache = Array.from(cacheRef.current.values()).includes(oldUrl);
      if (!isInCache) URL.revokeObjectURL(oldUrl);
    }
    setPdfBlobUrl(url);
    currentBlobUrlRef.current = url;
  }, []);

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    const cache = cacheRef.current;
    const timer = autoCompileTimerRef;
    return () => {
      for (const url of cache.values()) {
        URL.revokeObjectURL(url);
      }
      cache.clear();
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const compileServer = useCallback(
    async (source: string, engine?: string, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      if (!documentId) {
        if (!silent) toast.error("Nenhum documento selecionado");
        return;
      }

      // Check client-side hash cache first (before setting status)
      const sourceHash = await hashSource(source);
      const cachedUrl = cacheRef.current.get(sourceHash);
      if (cachedUrl) {
        setStatus("success");
        setBlobUrl(cachedUrl);
        setDurationMs(null);
        lastCompiledHashRef.current = sourceHash;
        if (!silent) toast.success("Compilado (cache)");
        return;
      }

      // Prevent overlapping compiles
      if (compilingRef.current) return;

      // Optimistic UI: set compiling status immediately
      setStatus("compiling");
      setError(null);
      compilingRef.current = true;

      try {
        // Direct fetch to Next.js API route (bypasses Convex)
        const response = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source,
            engine: engine ?? "tectonic",
            documentId,
          }),
        });

        if (response.ok) {
          // Success: response is PDF binary
          const pdfBlob = await response.blob();
          const url = URL.createObjectURL(pdfBlob);
          const compileDuration = parseInt(
            response.headers.get("X-Compile-Duration") ?? "0",
            10
          );

          // Store in cache
          cacheRef.current.set(sourceHash, url);
          lastCompiledHashRef.current = sourceHash;

          setStatus("success");
          setBlobUrl(url);
          setDurationMs(compileDuration || null);

          if (!silent) toast.success("Compilado com sucesso");

          // Fire-and-forget: track compile usage in Convex (does NOT block PDF)
          trackCompile({
            documentId,
            sourceHash,
            engine,
            durationMs: compileDuration || undefined,
          }).catch(() => {});
        } else {
          // Error: response is JSON
          const errorData = await response.json();
          const msg = errorData.error ?? "Erro de compilacao desconhecido";

          if (response.status === 401) {
            setStatus("error");
            setError("Nao autenticado");
            if (!silent)
              toast.error("Sessao expirada", {
                description: "Faca login novamente.",
              });
          } else if (
            response.status === 429 ||
            msg.includes("Rate limit")
          ) {
            setStatus("error");
            setError("Aguarde um momento antes de compilar novamente");
            if (!silent)
              toast.warning("Aguarde um momento", {
                description: "Muitas compilacoes em sequencia.",
              });
          } else {
            setStatus("error");
            setError(msg);
            if (!silent)
              toast.error("Erro na compilacao", { description: msg });
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro inesperado na compilacao";

        if (
          msg.toLowerCase().includes("offline") ||
          msg.includes("ECONNREFUSED") ||
          msg.toLowerCase().includes("fetch failed") ||
          msg.toLowerCase().includes("failed to fetch")
        ) {
          setStatus("offline");
          setError("Servidor de compilacao indisponivel");
          if (!silent) toast.error("Servidor de compilacao offline");
        } else {
          setStatus("error");
          setError(msg);
          if (!silent)
            toast.error("Erro na compilacao", { description: msg });
        }
      } finally {
        compilingRef.current = false;
      }
    },
    [documentId, setBlobUrl, trackCompile]
  );

  // Auto-compile: schedule a compile after debounce, only if hash changed
  const scheduleAutoCompile = useCallback(
    (source: string, engine?: string) => {
      if (autoCompileTimerRef.current) {
        clearTimeout(autoCompileTimerRef.current);
      }

      if (!autoCompileEnabled || !documentId) return;

      autoCompileTimerRef.current = setTimeout(async () => {
        // Check if source actually changed since last compile
        const sourceHash = await hashSource(source);
        if (sourceHash === lastCompiledHashRef.current) return;
        if (cacheRef.current.has(sourceHash)) return;
        if (compilingRef.current) return;

        // Silent auto-compile (no toasts)
        compileServer(source, engine, { silent: true });
      }, autoCompileDebounceMs);
    },
    [autoCompileEnabled, autoCompileDebounceMs, documentId, compileServer]
  );

  return {
    status,
    pdfBlobUrl,
    error,
    durationMs,
    remainingCompiles: null,
    compileServer,
    scheduleAutoCompile,
    autoCompileEnabled,
    setAutoCompileEnabled,
  };
}

export type { CompilerStatus, UseLatexCompilerOptions, UseLatexCompilerReturn };
