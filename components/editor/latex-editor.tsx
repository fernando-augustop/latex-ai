"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { latex } from "codemirror-lang-latex";

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const darkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "transparent",
      color: "oklch(0.9 0 0)",
      fontSize: "14px",
    },
    ".cm-content": {
      fontFamily: "'JetBrains Mono', monospace",
      caretColor: "#10B981",
      padding: "8px 0",
    },
    ".cm-cursor": {
      borderLeftColor: "#10B981",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "oklch(0.4 0 0)",
      border: "none",
      paddingRight: "8px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "oklch(0.6 0 0)",
    },
    ".cm-activeLine": {
      backgroundColor: "oklch(1 0 0 / 3%)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "oklch(0.5 0.1 160 / 20%) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "oklch(0.5 0.1 160 / 30%) !important",
    },
    ".cm-matchingBracket": {
      backgroundColor: "oklch(0.5 0.1 160 / 20%)",
      outline: "1px solid oklch(0.5 0.1 160 / 40%)",
    },
  },
  { dark: true }
);

export function LatexEditor({ value, onChange }: LatexEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        bracketMatching(),
        highlightSelectionMatches(),
        history(),
        latex(),
        darkTheme,
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
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
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="h-full overflow-auto" />;
}
