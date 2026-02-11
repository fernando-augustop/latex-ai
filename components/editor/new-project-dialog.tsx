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
} from "lucide-react";
import { toast } from "sonner";

const templateOptions = [
  { id: "article", label: "Artigo", icon: FileText },
  { id: "report", label: "Relatório", icon: BookOpen },
  { id: "resume", label: "Currículo", icon: Briefcase },
  { id: "presentation", label: "Apresentação", icon: Presentation },
  { id: "blank", label: "Em Branco", icon: File },
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
        <Button className="btn-press gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input
              id="project-name"
              placeholder="Meu Artigo de Pesquisa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Modelo</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {templateOptions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${
                    template === t.id
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground hover:shadow-sm"
                  }`}
                >
                  <t.icon className="h-5 w-5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="btn-press w-full bg-emerald-500 text-white hover:bg-emerald-600"
            disabled={!name.trim() || creating}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Projeto"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
