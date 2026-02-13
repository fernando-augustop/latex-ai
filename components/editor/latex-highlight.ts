import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/**
 * Custom dark highlight style for LaTeX, matching the project's oklch palette.
 * Used by both the main editor and read-only code blocks in chat.
 */
const latexHighlightStyle = HighlightStyle.define([
  // Commands: \begin, \end, \usepackage, \documentclass, etc.
  { tag: t.keyword, color: "oklch(0.75 0.18 165)" },           // emerald green
  { tag: t.definitionKeyword, color: "oklch(0.75 0.18 165)" }, // \documentclass

  // Environment names: document, tabular, figure, etc.
  { tag: t.className, color: "oklch(0.78 0.14 200)" },         // teal/cyan

  // Section headings: \section, \title, \author
  { tag: t.heading, color: "oklch(0.82 0.12 80)" },            // warm gold

  // Comments: % ...
  { tag: t.comment, color: "oklch(0.50 0.02 240)" },           // muted blue-gray

  // Brackets: { } [ ]
  { tag: t.bracket, color: "oklch(0.72 0.06 60)" },            // warm neutral

  // Operators: &, ~, math operators
  { tag: t.operator, color: "oklch(0.72 0.15 30)" },           // coral/orange

  // Math $ delimiters
  { tag: t.processingInstruction, color: "oklch(0.78 0.16 300)" }, // purple/violet

  // Math variables
  { tag: t.variableName, color: "oklch(0.80 0.12 270)" },      // light blue-violet

  // Numbers
  { tag: t.number, color: "oklch(0.78 0.14 55)" },             // amber

  // String arguments (literal args)
  { tag: t.string, color: "oklch(0.75 0.12 145)" },            // sage green

  // Label/ref names
  { tag: t.labelName, color: "oklch(0.72 0.10 220)" },         // soft blue

  // Citations
  { tag: t.quote, color: "oklch(0.70 0.10 190)" },             // teal

  // Bold/italic markers
  { tag: t.strong, color: "oklch(0.75 0.18 165)", fontWeight: "bold" },
  { tag: t.emphasis, color: "oklch(0.75 0.18 165)", fontStyle: "italic" },

  // Monospace
  { tag: t.monospace, color: "oklch(0.72 0.08 200)" },

  // Verbatim/meta content
  { tag: t.meta, color: "oklch(0.65 0.06 200)" },

  // Invalid/trailing content
  { tag: t.invalid, color: "oklch(0.65 0.20 25)" },            // reddish warning

  // Normal text (default)
  { tag: t.content, color: "oklch(0.90 0.01 105)" },
]);

export const latexSyntaxHighlighting = syntaxHighlighting(latexHighlightStyle);
