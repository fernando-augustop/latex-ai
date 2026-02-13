"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LatexEditor } from "./latex-editor";
import { PdfViewer } from "./pdf-viewer";
import { AiChatPanel } from "./ai-chat-panel";
import { Code2, Sparkles } from "lucide-react";
import { type PageFormat } from "@/lib/latex/page-formats";
import type { Tier } from "@/lib/ai/types";

interface EditorLayoutProps {
  value: string;
  onChange: (value: string) => void;
  serverPdfBlobUrl: string | null;
  serverCompiling: boolean;
  serverError: string | null;
  remainingCompiles: number | null;
  maxCompilesPerDay: number | null;
  pageFormat?: PageFormat;
  documentId: string;
  userId: string;
  tier: Tier;
}

export function EditorLayout({
  value,
  onChange,
  serverPdfBlobUrl,
  serverCompiling,
  serverError,
  remainingCompiles,
  maxCompilesPerDay,
  pageFormat,
  documentId,
  userId,
  tier,
}: EditorLayoutProps) {
  function handleApplyCode(code: string) {
    // Append code to the editor before \end{document} or at the end
    const endDocIndex = value.lastIndexOf("\\end{document}");
    if (endDocIndex !== -1) {
      const before = value.substring(0, endDocIndex);
      const after = value.substring(endDocIndex);
      onChange(before + "\n" + code + "\n\n" + after);
    } else {
      onChange(value + "\n" + code);
    }
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full bg-background/70">
      {/* Left panel: Editor + Chat tabs */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <Tabs defaultValue="editor" className="flex h-full min-h-0 flex-col">
          <TabsList className="h-10 w-full justify-start rounded-none border-b border-border/45 bg-card/70 px-2 backdrop-blur-sm">
            <TabsTrigger
              value="editor"
              className="gap-1.5 rounded-md border border-transparent text-xs data-[state=active]:border-primary/35 data-[state=active]:bg-primary/12 data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Code2 className="h-3.5 w-3.5" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="gap-1.5 rounded-md border border-transparent text-xs data-[state=active]:border-primary/35 data-[state=active]:bg-primary/12 data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Chat IA
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 min-h-0 mt-0 overflow-hidden">
            <LatexEditor value={value} onChange={onChange} />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 min-h-0 mt-0 overflow-hidden">
            <AiChatPanel
              onApplyCode={handleApplyCode}
              documentContent={value}
              documentId={documentId}
              userId={userId}
              tier={tier}
            />
          </TabsContent>
        </Tabs>
      </ResizablePanel>

      <ResizableHandle withHandle className="bg-border/45" />

      {/* Right panel: PDF viewer */}
      <ResizablePanel defaultSize={50} minSize={25}>
        <PdfViewer
          serverPdfBlobUrl={serverPdfBlobUrl}
          serverCompiling={serverCompiling}
          serverError={serverError}
          remainingCompiles={remainingCompiles}
          maxCompilesPerDay={maxCompilesPerDay}
          pageFormat={pageFormat}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
