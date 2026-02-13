"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Code2,
  Table,
  Bug,
  BookOpen,
  Sigma,
  ImagePlus,
  X,
} from "lucide-react";
import { LatexCodeBlock } from "./latex-code-block";
import { getAvailableModelsForTier } from "@/lib/ai/providers";
import type { Tier } from "@/lib/ai/types";

interface AiChatPanelProps {
  onApplyCode: (code: string) => void;
  documentContent: string;
  documentId: string;
  userId: string;
  tier: Tier;
}

const suggestions = [
  {
    label: "Adicionar tabela",
    icon: Table,
    prompt: "Adicione uma tabela com 3 colunas",
  },
  {
    label: "Corrigir erro",
    icon: Bug,
    prompt: "Corrija o erro no meu código LaTeX",
  },
  {
    label: "Explicar código",
    icon: BookOpen,
    prompt: "Explique este trecho de código LaTeX",
  },
  {
    label: "Criar fórmula",
    icon: Sigma,
    prompt: "Crie uma fórmula matemática",
  },
];

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 justify-start">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
        <Sparkles className="h-3 w-3 text-primary" />
      </div>
      <div className="rounded-lg bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
          <span
            className="typing-dot h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="typing-dot h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  );
}

function getMessageText(msg: { parts?: unknown[]; content?: string }): string {
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter(
        (p): p is { type: "text"; text: string } =>
          typeof p === "object" &&
          p !== null &&
          (p as Record<string, unknown>).type === "text"
      )
      .map((p) => p.text)
      .join("\n");
  }
  if (typeof msg.content === "string") {
    return msg.content;
  }
  return "";
}

function getMessageImages(msg: { parts?: unknown[] }): string[] {
  if (!Array.isArray(msg.parts)) return [];
  return msg.parts
    .filter(
      (p): p is { type: "file"; url: string; mediaType: string } =>
        typeof p === "object" &&
        p !== null &&
        (p as Record<string, unknown>).type === "file" &&
        typeof (p as Record<string, string>).mediaType === "string" &&
        ((p as Record<string, string>).mediaType ?? "").startsWith("image/")
    )
    .map((p) => p.url);
}

export function AiChatPanel({
  onApplyCode,
  documentContent,
  documentId,
  tier,
}: AiChatPanelProps) {
  const availableModels = useMemo(
    () => getAvailableModelsForTier(tier),
    [tier]
  );
  const [model, setModel] = useState(availableModels[0]?.id ?? "");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const isFree = tier === "free";

  // Load chat history from Convex
  const convexMessages = useQuery(
    api.chatMessages.getByDocument,
    documentId ? { documentId: documentId as Id<"documents"> } : "skip"
  );

  // Transport for useChat — recreated when key values change
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { modelId: model, documentContent, documentId, tier },
      }),
    [model, documentContent, documentId, tier]
  );

  const { messages, setMessages, sendMessage, status } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isWaiting = status === "submitted";

  // Update model when tier changes and current model is not available
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.find((m) => m.id === model)) {
      setModel(availableModels[0].id);
    }
  }, [availableModels, model]);

  // Load Convex history into useChat on first load
  useEffect(() => {
    if (convexMessages && !historyLoaded) {
      if (convexMessages.length > 0) {
        const uiMessages = convexMessages.map((msg) => ({
          id: msg._id,
          role: msg.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: msg.content }],
          createdAt: new Date(msg.createdAt),
        }));
        setMessages(uiMessages);
      }
      setHistoryLoaded(true);
    }
  }, [convexMessages, historyLoaded, setMessages]);

  // Reset history loaded state and clear stale messages when document changes
  useEffect(() => {
    setHistoryLoaded(false);
    setMessages([]);
  }, [documentId, setMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  function handleSend(text?: string) {
    const messageText = text || input;
    if (!messageText.trim() && !imageDataUrl) return;

    const parts: Array<
      | { type: "text"; text: string }
      | { type: "file"; mediaType: string; url: string }
    > = [];

    if (imageDataUrl) {
      parts.push({
        type: "file" as const,
        mediaType: imageMimeType,
        url: imageDataUrl,
      });
    }

    if (messageText.trim()) {
      parts.push({ type: "text" as const, text: messageText });
    }

    sendMessage({ role: "user", parts });
    setInput("");
    setImageDataUrl(null);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMimeType(file.type || "image/png");

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function renderContent(msg: { id: string; parts?: unknown[]; content?: string }) {
    const text = getMessageText(msg);
    const images = getMessageImages(msg as { parts?: unknown[] });
    const textParts = text.split(/(```latex[\s\S]*?```)/g);
    let blockIndex = 0;

    return (
      <>
        {images.map((url, i) => (
          <img
            key={`img-${i}`}
            src={url}
            alt="Attached"
            className="max-w-full rounded-lg mb-2"
          />
        ))}
        {textParts.map((part, i) => {
          if (part.startsWith("```latex")) {
            const code = part
              .replace(/```latex\n?/, "")
              .replace(/\n?```$/, "");
            const currentBlockIndex = blockIndex++;
            const blockId = `${msg.id}-${currentBlockIndex}`;

            return (
              <div
                key={i}
                className="my-3 overflow-hidden rounded-xl border border-border/50 bg-background/80"
              >
                <div className="flex items-center justify-between border-b border-border/45 px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      LaTeX
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleCopy(code, blockId)}
                    >
                      {copiedId === blockId ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedId === blockId ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-primary hover:text-primary/85"
                      onClick={() => onApplyCode(code)}
                    >
                      Aplicar no Editor
                    </Button>
                  </div>
                </div>
                <LatexCodeBlock code={code} />
              </div>
            );
          }
          return (
            <span key={i} className="whitespace-pre-wrap">
              {part}
            </span>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex h-full flex-col bg-card/35">
      {/* Model selector */}
      <div className="flex items-center gap-2 border-b border-border/45 bg-card/70 px-3 py-2">
        {isFree ? (
          <div className="text-xs text-muted-foreground">
            Faça upgrade para Pro para usar o Chat IA
          </div>
        ) : (
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {isFree ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-16">
            <Sparkles className="mb-3 h-8 w-8 text-primary/60" />
            <p className="text-sm text-muted-foreground">
              Chat IA disponível nos planos Pro e Enterprise
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Faça upgrade para acessar assistência inteligente para LaTeX
            </p>
          </div>
        ) : (
          <>
            {messages.length === 0 && !isLoading && (
              <div className="flex h-full flex-col items-center justify-center text-center py-16">
                <Sparkles className="mb-3 h-8 w-8 text-primary/60" />
                <p className="text-sm text-muted-foreground">
                  Peça ajuda à IA com seu LaTeX
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  ex. &quot;Adicione uma tabela com 3 colunas&quot;
                </p>

                {/* Suggestion chips */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.prompt)}
                      className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/45 hover:bg-primary/12 hover:text-primary"
                    >
                      <s.icon className="h-3 w-3" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-2.5 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary/15 text-foreground"
                          : "bg-muted/30 text-foreground"
                      }`}
                    >
                      {renderContent(msg)}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator — shown while waiting for first token */}
              <AnimatePresence>
                {isWaiting && (
                  <motion.div
                    key="typing-indicator"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Image preview */}
      {imageDataUrl && (
        <div className="border-t border-border/45 bg-card/60 px-3 py-2">
          <div className="relative inline-block">
            <img
              src={imageDataUrl}
              alt="Preview"
              className="h-16 rounded-lg border border-border/50"
            />
            <button
              onClick={() => setImageDataUrl(null)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/45 bg-card/75 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={isFree}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isFree
                ? "Upgrade para usar o Chat IA"
                : "Pergunte sobre LaTeX..."
            }
            className="h-9 text-sm"
            disabled={isFree || isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="btn-press h-9 w-9 shrink-0 rounded-full"
            disabled={isFree || isLoading || (!input.trim() && !imageDataUrl)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
