"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/editor/toolbar";
import { EditorLayout } from "@/components/editor/editor-layout";
import { preprocessForPreview } from "@/lib/latex/compiler";
import { useLatexCompiler } from "@/hooks/use-latex-compiler";
import { TIER_LIMITS, type Tier } from "@/lib/tier-limits";
import { toast } from "sonner";
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
  const [previewMode, setPreviewMode] = useState<"live" | "pdf">("live");
  const [engine, setEngine] = useState("tectonic");
  const [userTier, setUserTier] = useState<Tier>("free");

  const hasServerCompile = TIER_LIMITS[userTier].hasServerCompile;

  const compileRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAuthenticated } = useConvexAuth();
  const currentUser = useMutation(api.users.getOrCreateCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) return;
    currentUser().then((user) => {
      if (user) setUserTier(user.tier as Tier);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const {
    status: serverStatus,
    pdfBlobUrl: serverPdfBlobUrl,
    error: serverError,
    durationMs: serverDurationMs,
    compileServer,
  } = useLatexCompiler({
    documentId: activeDocId,
    hasServerCompile,
  });

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


  const compile = useCallback(async (source: string, showToast = false) => {
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
      const html = container.innerHTML;
      setHtmlContent(html);

      if (showToast) {
        toast.success("Compilado com sucesso");
      }

      return html;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro de compilação desconhecido";
      setCompilationError(message);
      setHtmlContent(null);
      if (showToast) {
        toast.error("Erro na compilação", { description: message });
      }
      return null;
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Initial compile once content is loaded (preview only, no PDF)
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

      // Debounced compile (preview only, no PDF generation)
      if (compileRef.current) clearTimeout(compileRef.current);
      compileRef.current = setTimeout(() => {
        compile(newValue);
      }, 1500);
    },
    [activeDocId, compile, updateContent]
  );

  async function handleCompile() {
    if (compileRef.current) clearTimeout(compileRef.current);

    // Client-side: generate preview
    await compile(value, true);

    // Server-side: higher quality compile (Pro/Enterprise)
    if (hasServerCompile) {
      compileServer(value, engine);
    }
  }

  async function handleDownload() {
    // Pro/Enterprise: download server-compiled PDF directly
    if (serverPdfBlobUrl) {
      const a = document.createElement("a");
      a.href = serverPdfBlobUrl;
      a.download = `${projectName || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Free tier: use browser print dialog (Save as PDF)
    const html = htmlContent ?? await compile(value);
    if (!html) {
      toast.error("Compile o documento primeiro para baixar o PDF");
      return;
    }

    const { downloadPdfViaPrint } = await import("@/lib/pdf-generator");
    downloadPdfViaPrint(html, projectName || "document");
  }

  function handleProjectNameChange(name: string) {
    setProjectName(name);
    updateProject({ projectId, name });
  }

  // Ctrl+S: save immediately + compile
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeDocId) {
          if (saveRef.current) clearTimeout(saveRef.current);
          updateContent({ documentId: activeDocId, content: value });
        }
        handleCompile();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocId, value, engine, hasServerCompile, compile, compileServer, updateContent]);

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
        serverStatus={serverStatus}
        serverDurationMs={serverDurationMs}
        serverError={serverError}
        hasServerCompile={hasServerCompile}
        engine={engine}
        onEngineChange={setEngine}
      />
      <div className="flex-1 overflow-hidden">
        <EditorLayout
          value={value}
          onChange={handleChange}
          htmlContent={htmlContent}
          isCompiling={isCompiling}
          compilationError={compilationError}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          serverPdfBlobUrl={serverPdfBlobUrl}
          serverCompiling={serverStatus === "compiling"}
          serverError={serverError}
          hasServerCompile={hasServerCompile}
        />
      </div>
    </div>
  );
}
