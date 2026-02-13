"use client";

import { Loader2, CheckCircle2, XCircle, WifiOff, Ban } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { CompilerStatus } from "@/hooks/use-latex-compiler";

interface CompilationStatusProps {
  status: CompilerStatus;
  durationMs: number | null;
  error: string | null;
  remainingCompiles?: number | null;
  maxCompilesPerDay?: number | null;
}

export function CompilationStatus({
  status,
  durationMs,
  error,
  remainingCompiles,
  maxCompilesPerDay,
}: CompilationStatusProps) {
  if (status === "idle") return null;

  if (status === "compiling") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-primary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Compilando...</span>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-xs text-primary">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>
            Compilado{durationMs != null ? ` (${durationMs}ms)` : ""}
          </span>
        </div>
        {remainingCompiles != null && maxCompilesPerDay != null && maxCompilesPerDay !== Infinity && (
          <span className="rounded-md border border-border/40 bg-card/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {remainingCompiles}/{maxCompilesPerDay}
          </span>
        )}
      </div>
    );
  }

  if (status === "quota_exceeded") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 cursor-default">
              <Ban className="h-3.5 w-3.5" />
              <span>Limite diário atingido</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            Faça upgrade para Pro para compilações ilimitadas
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "error") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-xs text-destructive cursor-default">
              <XCircle className="h-3.5 w-3.5" />
              <span>Erro</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {error ?? "Erro desconhecido"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "offline") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Servidor offline</span>
      </div>
    );
  }

  return null;
}
