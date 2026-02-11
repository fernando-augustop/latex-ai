"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getTemplateById, getDefaultTemplate } from "@/lib/latex/templates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  BookOpen,
  Briefcase,
  Presentation,
  File,
  Plus,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const templateOptions = [
  { id: "article", label: "Artigo", description: "Paper acadêmico com seções e referências", icon: FileText },
  { id: "report", label: "Relatório", description: "Documento técnico com capítulos", icon: BookOpen },
  { id: "resume", label: "Currículo", description: "CV profissional formatado", icon: Briefcase },
  { id: "presentation", label: "Apresentação", description: "Slides para defesa ou palestra", icon: Presentation },
  { id: "blank", label: "Em Branco", description: "Documento vazio para começar do zero", icon: File },
];

interface NewProjectDialogProps {
  userId: Id<"users">;
}

export function NewProjectDialog({ userId }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("article");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const createProject = useMutation(api.projects.create);
  const createDocument = useMutation(api.documents.create);

  async function handleCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);

    try {
      const projectId = await createProject({
        userId,
        name: name.trim(),
        template,
      });

      const tmpl = getTemplateById(template) ?? getDefaultTemplate();
      await createDocument({
        projectId,
        filename: "main.tex",
        content: tmpl.content,
      });

      setOpen(false);
      setName("");
      router.push(`/projects/${projectId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar projeto";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-press gap-2 rounded-full px-5">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden border-border/55 bg-popover/95 p-0 backdrop-blur-xl sm:max-w-lg">
        {/* Header */}
        <div className="border-b border-border/40 px-6 pb-5 pt-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Novo Projeto</DialogTitle>
            <DialogDescription>
              Escolha um modelo e dê um nome ao seu projeto.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Nome do Projeto
            </Label>
            <Input
              id="project-name"
              placeholder="Meu Artigo de Pesquisa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              autoFocus
              className="h-11"
            />
          </div>

          {/* Template picker */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Modelo
            </Label>
            <div className="space-y-1.5">
              {templateOptions.map((t) => {
                const isSelected = template === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150 ${
                      isSelected
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_oklch(0.72_0.17_162/0.15)]"
                        : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/60"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <t.icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 bg-card/30 px-6 py-4">
          <Button
            onClick={handleCreate}
            className="btn-press w-full gap-2 rounded-full"
            size="lg"
            disabled={!name.trim() || creating}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando projeto...
              </>
            ) : (
              <>
                Criar Projeto
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
