"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { latex } from "codemirror-lang-latex";
import { latexSyntaxHighlighting } from "./latex-highlight";

const codeBlockTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "transparent",
      fontSize: "12px",
    },
    ".cm-content": {
      fontFamily: "var(--font-ibm-plex-mono), monospace",
      padding: "12px",
      caretColor: "transparent",
    },
    ".cm-cursor": {
      display: "none",
    },
    ".cm-line": {
      padding: "0",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-selectionBackground": {
      backgroundColor: "oklch(0.64 0.18 156 / 20%) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "oklch(0.64 0.18 156 / 30%) !important",
    },
    ".cm-gutters": {
      display: "none",
    },
  },
  { dark: true }
);

interface LatexCodeBlockProps {
  code: string;
}

export function LatexCodeBlock({ code }: LatexCodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        latex(),
        latexSyntaxHighlighting,
        codeBlockTheme,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [code]);

  return <div ref={containerRef} className="overflow-x-auto" />;
}
