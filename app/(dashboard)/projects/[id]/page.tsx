"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/editor/toolbar";
import { EditorLayout } from "@/components/editor/editor-layout";
import { useLatexCompiler } from "@/hooks/use-latex-compiler";
import { TIER_LIMITS, type Tier } from "@/lib/tier-limits";
import { detectPageFormat } from "@/lib/latex/page-formats";
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
  const [initialized, setInitialized] = useState(false);
  const [activeDocId, setActiveDocId] = useState<Id<"documents"> | null>(null);
  const [engine, setEngine] = useState("pdflatex-fast");
  const [userTier, setUserTier] = useState<Tier>("free");
  const [userId, setUserId] = useState<string>("");

  const tierLimits = TIER_LIMITS[userTier];
  const maxCompilesPerDay = tierLimits.maxServerCompilesPerDay;
  const pageFormat = useMemo(() => detectPageFormat(value), [value]);

  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAuthenticated } = useConvexAuth();
  const currentUser = useMutation(api.users.getOrCreateCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) return;
    currentUser().then((user) => {
      if (user) {
        setUserTier(user.tier as Tier);
        setUserId(user._id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const {
    status: serverStatus,
    pdfBlobUrl: serverPdfBlobUrl,
    error: serverError,
    durationMs: serverDurationMs,
    remainingCompiles,
    compileServer,
    scheduleAutoCompile,
    autoCompileEnabled,
    setAutoCompileEnabled,
  } = useLatexCompiler({
    documentId: activeDocId,
    autoCompileDebounceMs: tierLimits.autoCompileDebounceMs,
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

  // Initial server compile once content AND user data are loaded
  useEffect(() => {
    if (initialized && value && activeDocId && userId) {
      compileServer(value, engine);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, userId]);

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

      // Schedule auto-compile after debounce (only if enabled + hash changed)
      scheduleAutoCompile(newValue, engine);
    },
    [activeDocId, updateContent, scheduleAutoCompile, engine]
  );

  async function handleCompile() {
    compileServer(value, engine);
  }

  async function handleDownload() {
    if (serverPdfBlobUrl) {
      const a = document.createElement("a");
      a.href = serverPdfBlobUrl;
      a.download = `${projectName || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // No PDF yet — trigger compile and let user know
    toast.info("Compilando PDF...", { description: "O download iniciara apos a compilacao." });
    compileServer(value, engine);
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
        compileServer(value, engine);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocId, value, engine, compileServer, updateContent]);

  // Loading state
  if (!initialized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/70">
      <Toolbar
        projectName={projectName}
        onProjectNameChange={handleProjectNameChange}
        onCompile={handleCompile}
        onDownload={handleDownload}
        isCompiling={serverStatus === "compiling"}
        serverStatus={serverStatus}
        serverDurationMs={serverDurationMs}
        serverError={serverError}
        remainingCompiles={remainingCompiles}
        maxCompilesPerDay={maxCompilesPerDay === Infinity ? null : maxCompilesPerDay}
        autoCompileEnabled={autoCompileEnabled}
        onAutoCompileToggle={setAutoCompileEnabled}
      />
      <div className="flex-1 overflow-hidden">
        <EditorLayout
          value={value}
          onChange={handleChange}
          serverPdfBlobUrl={serverPdfBlobUrl}
          serverCompiling={serverStatus === "compiling"}
          serverError={serverError}
          remainingCompiles={remainingCompiles}
          maxCompilesPerDay={maxCompilesPerDay === Infinity ? null : maxCompilesPerDay}
          pageFormat={pageFormat}
          documentId={activeDocId ?? ""}
          userId={userId}
          tier={userTier}
        />
      </div>
    </div>
  );
}
