"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Play,
  Download,
  Settings,
  Loader2,
  Check,
  Pencil,
} from "lucide-react";

interface ToolbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onCompile: () => void;
  onDownload: () => void;
  isCompiling: boolean;
}

export function Toolbar({
  projectName,
  onProjectNameChange,
  onCompile,
  onDownload,
  isCompiling,
}: ToolbarProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(projectName);

  function handleSave() {
    onProjectNameChange(name);
    setEditing(false);
  }

  return (
    <TooltipProvider>
      <div className="flex h-12 items-center justify-between border-b border-border/40 bg-background px-3">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="btn-press h-8 w-8" asChild>
                <Link href="/projects">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voltar aos Projetos</TooltipContent>
          </Tooltip>

          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-7 w-48 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") {
                    setName(projectName);
                    setEditing(false);
                  }
                }}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="btn-press h-7 w-7"
                onClick={handleSave}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm font-medium hover:text-emerald-400 transition-colors"
                >
                  {projectName}
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Renomear projeto</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="btn-press gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600 h-8"
                onClick={onCompile}
                disabled={isCompiling}
              >
                {isCompiling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Compilar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compilar documento (Ctrl+Enter)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="btn-press gap-1.5 h-8"
                onClick={onDownload}
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>Baixar PDF (Ctrl+Shift+S)</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="btn-press h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Configurações</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Configurações do Editor</DropdownMenuItem>
              <DropdownMenuItem>Atalhos de Teclado</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
