"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/editor/toolbar";
import { EditorLayout } from "@/components/editor/editor-layout";
import { preprocessForPreview } from "@/lib/latex/compiler";
import { Loader2 } from "lucide-react";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.getById, { projectId });
  const documents = useQuery(api.documents.getByProject, { projectId });
  const updateContent = useMutation(api.documents.updateContent);
  const updateProject = useMutation(api.projects.update);

  const [projectName, setProjectName] = useState("");
  const [value, setValue] = useState("");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [activeDocId, setActiveDocId] = useState<Id<"documents"> | null>(null);

  const compileRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if project not found
  useEffect(() => {
    if (project === null) {
      router.push("/projects");
    }
  }, [project, router]);

  // Sync project name
  useEffect(() => {
    if (project && !initialized) {
      setProjectName(project.name);
    }
  }, [project, initialized]);

  // Initialize editor content from Convex
  useEffect(() => {
    if (documents && documents.length > 0 && !initialized) {
      const mainDoc =
        documents.find((d) => d.filename === "main.tex") ?? documents[0];
      setValue(mainDoc.content);
      setActiveDocId(mainDoc._id);
      setInitialized(true);
    }
  }, [documents, initialized]);

  const compile = useCallback(async (source: string) => {
    setIsCompiling(true);
    setCompilationError(null);
    try {
      const { parse, HtmlGenerator } = await import("latex.js");
      const preprocessed = preprocessForPreview(source);
      const generator = new HtmlGenerator({ hyphenate: false });
      const doc = parse(preprocessed, { generator });
      const domFragment = doc.domFragment();

      const container = document.createElement("div");
      container.appendChild(domFragment);
      setHtmlContent(container.innerHTML);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro de compilação desconhecido";
      setCompilationError(message);
      setHtmlContent(null);
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Initial compile once content is loaded
  useEffect(() => {
    if (initialized && value) {
      compile(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);

      // Debounced save to Convex
      if (saveRef.current) clearTimeout(saveRef.current);
      if (activeDocId) {
        saveRef.current = setTimeout(() => {
          updateContent({ documentId: activeDocId, content: newValue });
        }, 2000);
      }

      // Debounced compile
      if (compileRef.current) clearTimeout(compileRef.current);
      compileRef.current = setTimeout(() => {
        compile(newValue);
      }, 1500);
    },
    [activeDocId, compile, updateContent]
  );

  function handleCompile() {
    if (compileRef.current) clearTimeout(compileRef.current);
    compile(value);
  }

  function handleDownload() {
    // TODO: implement server-side PDF compilation and download
  }

  function handleProjectNameChange(name: string) {
    setProjectName(name);
    updateProject({ projectId, name });
  }

  // Loading state
  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background/70">
      <Toolbar
        projectName={projectName}
        onProjectNameChange={handleProjectNameChange}
        onCompile={handleCompile}
        onDownload={handleDownload}
        isCompiling={isCompiling}
      />
      <div className="flex-1 overflow-hidden">
        <EditorLayout
          value={value}
          onChange={handleChange}
          htmlContent={htmlContent}
          isCompiling={isCompiling}
          compilationError={compilationError}
        />
      </div>
    </div>
  );
}
