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

interface EditorLayoutProps {
  value: string;
  onChange: (value: string) => void;
  htmlContent: string | null;
  isCompiling: boolean;
  compilationError: string | null;
}

export function EditorLayout({
  value,
  onChange,
  htmlContent,
  isCompiling,
  compilationError,
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
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      {/* Left panel: Editor + Chat tabs */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <Tabs defaultValue="editor" className="flex h-full flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border/40 bg-transparent px-2 h-9">
            <TabsTrigger
              value="editor"
              className="gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
            >
              <Code2 className="h-3.5 w-3.5" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Chat IA
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 mt-0 overflow-hidden">
            <LatexEditor value={value} onChange={onChange} />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
            <AiChatPanel onApplyCode={handleApplyCode} />
          </TabsContent>
        </Tabs>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right panel: PDF viewer */}
      <ResizablePanel defaultSize={50} minSize={25}>
        <PdfViewer
          htmlContent={htmlContent}
          isCompiling={isCompiling}
          error={compilationError}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
