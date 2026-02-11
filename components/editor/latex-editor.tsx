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
      backgroundColor: "oklch(0.17 0.015 235 / 72%)",
      color: "oklch(0.94 0.01 105)",
      fontSize: "14px",
    },
    ".cm-content": {
      fontFamily: "var(--font-ibm-plex-mono), monospace",
      caretColor: "oklch(0.69 0.18 158)",
      padding: "14px 0",
    },
    ".cm-cursor": {
      borderLeftColor: "oklch(0.69 0.18 158)",
    },
    ".cm-gutters": {
      backgroundColor: "oklch(0.15 0.015 235 / 65%)",
      color: "oklch(0.62 0.016 215)",
      border: "none",
      paddingRight: "12px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "oklch(0.78 0.05 155)",
    },
    ".cm-activeLine": {
      backgroundColor: "oklch(0.31 0.03 156 / 22%)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "oklch(0.64 0.18 156 / 24%) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "oklch(0.64 0.18 156 / 34%) !important",
    },
    ".cm-matchingBracket": {
      backgroundColor: "oklch(0.64 0.18 156 / 18%)",
      outline: "1px solid oklch(0.64 0.18 156 / 45%)",
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

  return <div ref={containerRef} className="h-full overflow-auto bg-card/35" />;
}
