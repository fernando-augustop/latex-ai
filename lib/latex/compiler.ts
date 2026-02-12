export interface CompileResult {
  success: boolean;
  html?: string;
  errors?: string[];
}

/** Packages that latex.js v0.12.6 cannot load (dist/packages/ is empty). */
const unsupportedPackages = [
  "inputenc", "fontenc", "babel", "geometry", "natbib", "fancyhdr",
  "setspace", "booktabs", "caption", "subcaption", "listings", "xcolor",
  "titlesec", "enumitem", "fontawesome5", "tikz", "pgfplots", "graphicx",
  "hyperref", "float", "microtype", "cleveref", "tcolorbox", "multirow",
  "tabularx", "parskip",
];

const pkgPattern = new RegExp(
  `^\\s*\\\\usepackage(?:\\[[^\\]]*\\])?\\{(?:${unsupportedPackages.join("|")})\\}.*$`,
  "gm"
);

/** Find the index of a closing brace, handling nesting and escaped chars. */
function findClosingBrace(s: string, start: number): number {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) {
      i++;
      continue;
    }
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Remove a command and its brace-delimited arguments (handles multi-line). */
function stripBracedCmd(source: string, cmd: string, groups = 1): string {
  let s = source;
  const needle = `\\${cmd}`;
  let searchFrom = 0;

  while (true) {
    const idx = s.indexOf(needle, searchFrom);
    if (idx === -1) break;

    // Make sure it's the actual command (not a substring of another)
    const after = idx + needle.length;
    if (after < s.length && /[a-zA-Z]/.test(s[after])) {
      searchFrom = after;
      continue;
    }

    let lineStart = idx;
    while (lineStart > 0 && s[lineStart - 1] !== "\n") lineStart--;

    let pos = after;

    // Skip optional [...] args
    while (pos < s.length && /\s/.test(s[pos])) pos++;
    while (pos < s.length && s[pos] === "[") {
      let depth = 0;
      for (let i = pos; i < s.length; i++) {
        if (s[i] === "[") depth++;
        else if (s[i] === "]") {
          depth--;
          if (depth === 0) {
            pos = i + 1;
            break;
          }
        }
      }
      while (pos < s.length && /\s/.test(s[pos])) pos++;
    }

    // Skip required {..} groups
    let ok = true;
    for (let g = 0; g < groups; g++) {
      while (pos < s.length && /\s/.test(s[pos])) pos++;
      if (pos < s.length && s[pos] === "{") {
        const close = findClosingBrace(s, pos);
        if (close === -1) {
          ok = false;
          break;
        }
        pos = close + 1;
      } else {
        ok = false;
        break;
      }
    }

    if (ok) {
      if (pos < s.length && s[pos] === "\n") pos++;
      s = s.slice(0, lineStart) + s.slice(pos);
      searchFrom = lineStart;
    } else {
      searchFrom = after;
    }
  }
  return s;
}

/** Remove a LaTeX environment and its contents. */
function stripEnvironment(source: string, env: string): string {
  const re = new RegExp(
    `^[ \\t]*\\\\begin\\{${env}\\}[\\s\\S]*?\\\\end\\{${env}\\}[ \\t]*\\n?`,
    "gm"
  );
  return source.replace(re, "");
}

/** Strip packages and commands that latex.js cannot handle. */
export function preprocessForPreview(source: string): string {
  let s = source;

  // 1. Strip \usepackage lines for known unsupported packages
  s = s.replace(pkgPattern, "");

  // 2. geometry
  s = stripBracedCmd(s, "geometry");

  // 3. fancyhdr commands
  s = stripBracedCmd(s, "pagestyle");
  s = s.replace(/^[ \t]*\\fancyhf\{[^}]*\}.*$/gm, "");
  s = stripBracedCmd(s, "rhead");
  s = stripBracedCmd(s, "lhead");
  s = stripBracedCmd(s, "rfoot");
  s = stripBracedCmd(s, "lfoot");
  s = s.replace(/^[ \t]*\\renewcommand\{\\headrulewidth\}.*$/gm, "");

  // 4. setspace commands
  s = s.replace(
    /^[ \t]*\\(?:onehalfspacing|doublespacing|singlespacing).*$/gm,
    ""
  );

  // 5. listings commands & environments
  s = stripBracedCmd(s, "lstdefinestyle", 2);
  s = stripBracedCmd(s, "lstset");
  s = stripEnvironment(s, "lstlisting");

  // 6. xcolor commands
  s = stripBracedCmd(s, "definecolor", 3);
  s = s.replace(/\\textcolor\{[^}]*\}/g, "");
  s = s.replace(/\\color\{[^}]*\}/g, "");

  // 7. hyperref commands
  s = stripBracedCmd(s, "hypersetup");
  s = s.replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1");

  // 8. titlesec commands
  s = s.replace(/^[ \t]*\\titleformat\b.*$/gm, "");
  s = s.replace(/^[ \t]*\\titlespacing\*?\b.*$/gm, "");

  // 9. bibliography
  s = stripBracedCmd(s, "bibliographystyle");
  s = stripBracedCmd(s, "bibliography");

  // 10. tableofcontents
  s = s.replace(/^[ \t]*\\tableofcontents.*$/gm, "");

  // 11. graphicx
  s = s.replace(/\\includegraphics(?:\[[^\]]*\])?\{[^}]*\}/g, "");

  // 12. fontawesome5
  s = s.replace(/\\faIcon\{[^}]*\}/g, "");

  // 13. tikz environments
  s = stripEnvironment(s, "tikzpicture");

  // 13b. tabular (not supported by latex.js 0.12.6)
  s = stripEnvironment(s, "tabular\\*?");
  s = s.replace(/^[ \t]*\\hline.*$/gm, "");

  // 14. beamer commands
  s = stripBracedCmd(s, "usetheme");
  s = stripBracedCmd(s, "usecolortheme");
  s = s.replace(/^[ \t]*\\setbeamertemplate\b.*$/gm, "");

  // 15. Catch-all: strip any remaining \usepackage lines
  s = s.replace(/^[ \t]*\\usepackage(?:\[[^\]]*\])?\{[^}]*\}.*$/gm, "");

  // Clean up excessive blank lines
  s = s.replace(/\n{3,}/g, "\n\n");

  return s;
}

/**
 * Compile LaTeX source to HTML for client-side preview using latex.js.
 */
export async function compileLatexToHtml(source: string): Promise<CompileResult> {
  try {
    const { parse, HtmlGenerator } = await import("latex.js");

    const preprocessed = preprocessForPreview(source);
    const generator = new HtmlGenerator({ hyphenate: false });
    const doc = parse(preprocessed, { generator });
    const htmlDocument = doc.htmlDocument();

    const serializer = new XMLSerializer();
    const html = serializer.serializeToString(htmlDocument);

    return { success: true, html };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown compilation error";
    return {
      success: false,
      errors: [message],
    };
  }
}

/**
 * Validate LaTeX source for common errors before compilation.
 */
export function validateLatexSource(source: string): string[] {
  const errors: string[] = [];

  if (!source.trim()) {
    errors.push("Empty document");
    return errors;
  }

  if (!source.includes("\\documentclass")) {
    errors.push("Missing \\documentclass declaration");
  }

  if (!source.includes("\\begin{document}")) {
    errors.push("Missing \\begin{document}");
  }

  if (!source.includes("\\end{document}")) {
    errors.push("Missing \\end{document}");
  }

  let braceDepth = 0;
  for (const char of source) {
    if (char === "{") braceDepth++;
    if (char === "}") braceDepth--;
    if (braceDepth < 0) {
      errors.push("Mismatched braces: extra closing brace found");
      break;
    }
  }
  if (braceDepth > 0) {
    errors.push(`Mismatched braces: ${braceDepth} unclosed brace(s)`);
  }

  const beginRegex = /\\begin\{(\w+)\}/g;
  const endRegex = /\\end\{(\w+)\}/g;
  const envStack: string[] = [];
  let match: RegExpExecArray | null;

  const tokens: Array<{ type: "begin" | "end"; env: string; index: number }> =
    [];

  while ((match = beginRegex.exec(source)) !== null) {
    tokens.push({ type: "begin", env: match[1], index: match.index });
  }
  while ((match = endRegex.exec(source)) !== null) {
    tokens.push({ type: "end", env: match[1], index: match.index });
  }

  tokens.sort((a, b) => a.index - b.index);

  for (const token of tokens) {
    if (token.type === "begin") {
      envStack.push(token.env);
    } else {
      const expected = envStack.pop();
      if (expected !== token.env) {
        errors.push(
          `Mismatched environment: expected \\end{${expected ?? "?"}}, found \\end{${token.env}}`
        );
      }
    }
  }

  if (envStack.length > 0) {
    errors.push(
      `Unclosed environment(s): ${envStack.map((e) => `\\begin{${e}}`).join(", ")}`
    );
  }

  return errors;
}
