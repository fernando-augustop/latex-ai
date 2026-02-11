"use client";

import { useState, useRef, useEffect } from "react";
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
import { Send, Sparkles, User, Copy, Check, Code2, Table, Bug, BookOpen, Sigma } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlocks?: string[];
}

interface AiChatPanelProps {
  onApplyCode: (code: string) => void;
}

const mockMessages: ChatMessage[] = [];

const models = [
  { id: "claude-haiku", label: "Claude Haiku" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
];

const suggestions = [
  { label: "Adicionar tabela", icon: Table, prompt: "Adicione uma tabela com 3 colunas" },
  { label: "Corrigir erro", icon: Bug, prompt: "Corrija o erro no meu código LaTeX" },
  { label: "Explicar código", icon: BookOpen, prompt: "Explique este trecho de código LaTeX" },
  { label: "Criar fórmula", icon: Sigma, prompt: "Crie uma fórmula matemática" },
];

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 justify-start">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
        <Sparkles className="h-3 w-3 text-emerald-400" />
      </div>
      <div className="rounded-lg bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animationDelay: "0.15s" }} />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}

export function AiChatPanel({ onApplyCode }: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("claude-haiku");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function handleSend(text?: string) {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI response with delay
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          'Aqui está um exemplo de tabela LaTeX com 3 colunas:\n\n```latex\n\\begin{table}[h]\n  \\centering\n  \\begin{tabular}{|l|c|r|}\n    \\hline\n    Nome & Valor & Unidade \\\\\n    \\hline\n    Temperatura & 25 & \\textdegree C \\\\\n    Pressão & 1.0 & atm \\\\\n    Volume & 22.4 & L \\\\\n    \\hline\n  \\end{tabular}\n  \\caption{Tabela de dados}\n  \\label{tab:dados}\n\\end{table}\n```\n\nVocê pode colocar isso dentro da seção `\\begin{document}`.',
        codeBlocks: [
          '\\begin{table}[h]\n  \\centering\n  \\begin{tabular}{|l|c|r|}\n    \\hline\n    Nome & Valor & Unidade \\\\\n    \\hline\n    Temperatura & 25 & \\textdegree C \\\\\n    Pressão & 1.0 & atm \\\\\n    Volume & 22.4 & L \\\\\n    \\hline\n  \\end{tabular}\n  \\caption{Tabela de dados}\n  \\label{tab:dados}\n\\end{table}',
        ],
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMsg]);
    }, 1500);
  }

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function renderContent(msg: ChatMessage) {
    const parts = msg.content.split(/(```latex[\s\S]*?```)/g);
    let blockIndex = 0;

    return parts.map((part, i) => {
      if (part.startsWith("```latex")) {
        const code = part.replace(/```latex\n?/, "").replace(/\n?```$/, "");
        const currentBlockIndex = blockIndex++;
        const blockId = `${msg.id}-${currentBlockIndex}`;

        return (
          <div key={i} className="my-3 rounded-md border border-border/40 bg-zinc-950 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5">
              <div className="flex items-center gap-1.5">
                <Code2 className="h-3 w-3 text-emerald-400" />
                <span className="text-xs text-muted-foreground">LaTeX</span>
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
                  className="h-6 px-2 text-xs text-emerald-400 hover:text-emerald-300"
                  onClick={() => onApplyCode(code)}
                >
                  Aplicar no Editor
                </Button>
              </div>
            </div>
            <pre className="p-3 text-xs font-mono text-muted-foreground overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <span key={i} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Model selector */}
      <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="h-7 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-xs">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length === 0 && !isTyping && (
          <div className="flex h-full flex-col items-center justify-center text-center py-16">
            <Sparkles className="h-8 w-8 text-emerald-400/50 mb-3" />
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
                  className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400"
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
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-emerald-500/10 text-foreground"
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

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/40 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre LaTeX..."
            className="h-9 text-sm focus-visible:ring-emerald-500/50"
          />
          <Button
            type="submit"
            size="icon"
            className="btn-press h-9 w-9 shrink-0 bg-emerald-500 text-white hover:bg-emerald-600"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
