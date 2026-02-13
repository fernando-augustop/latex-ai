"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type SegmentType = "command" | "brace" | "text";

interface Segment {
  text: string;
  type: SegmentType;
}

const lines: Segment[][] = [
  [
    { text: "\\documentclass", type: "command" },
    { text: "{", type: "brace" },
    { text: "article", type: "text" },
    { text: "}", type: "brace" },
  ],
  [
    { text: "\\usepackage", type: "command" },
    { text: "{", type: "brace" },
    { text: "amsmath", type: "text" },
    { text: "}", type: "brace" },
  ],
  [
    { text: "\\title", type: "command" },
    { text: "{", type: "brace" },
    { text: "Meu Artigo de Pesquisa", type: "text" },
    { text: "}", type: "brace" },
  ],
  [
    { text: "\\author", type: "command" },
    { text: "{", type: "brace" },
    { text: "Maria Silva", type: "text" },
    { text: "}", type: "brace" },
  ],
  [
    { text: "\\begin", type: "command" },
    { text: "{", type: "brace" },
    { text: "document", type: "text" },
    { text: "}", type: "brace" },
  ],
  [
    { text: "\\maketitle", type: "command" },
  ],
  [],
  [
    { text: "\\section", type: "command" },
    { text: "{", type: "brace" },
    { text: "Introdu\u00e7\u00e3o", type: "text" },
    { text: "}", type: "brace" },
  ],
  [
    { text: "A rela\u00e7\u00e3o entre energia e massa", type: "text" },
  ],
  [
    { text: "transformou nossa compreens\u00e3o da f\u00edsica moderna", type: "text" },
  ],
  [
    { text: "e estabeleceu as bases da relatividade especial.", type: "text" },
  ],
  [],
  [
    { text: "\\begin", type: "command" },
    { text: "{", type: "brace" },
    { text: "equation", type: "text" },
    { text: "}", type: "brace" },
  ],
  [
    { text: "  ", type: "text" },
    { text: "E", type: "text" },
    { text: " = ", type: "text" },
    { text: "mc^2", type: "text" },
  ],
  [
    { text: "\\end", type: "command" },
    { text: "{", type: "brace" },
    { text: "equation", type: "text" },
    { text: "}", type: "brace" },
  ],
];

const fullText = lines
  .map((segs) => segs.map((s) => s.text).join(""))
  .join("\n");

function getTotalChars(): number {
  let total = 0;
  for (let i = 0; i < lines.length; i++) {
    for (const seg of lines[i]) {
      total += seg.text.length;
    }
    if (i < lines.length - 1) total += 1; // newline
  }
  return total;
}

const TOTAL_CHARS = getTotalChars();

const colorMap: Record<SegmentType, string> = {
  command: "text-primary",
  brace: "text-[#b5d8ba]",
  text: "text-muted-foreground",
};

export function HeroTypewriter({ onTypingChange, onProgress }: { onTypingChange?: (typing: boolean) => void; onProgress?: (completedLines: number) => void }) {
  const [revealed, setRevealed] = useState(0);
  const lastTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const loopPausedRef = useRef(false);

  const getCharDelay = useCallback((charIndex: number): number => {
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      for (const seg of lines[i]) {
        for (let c = 0; c < seg.text.length; c++) {
          if (count === charIndex) {
            // First char of a new line gets a longer pause
            if (c === 0 && count > 0) {
              // Check if this is the first segment of the line
              const isFirstSeg = lines[i][0] === seg;
              if (isFirstSeg) return 180;
            }
            return seg.type === "command" ? 32 : 22;
          }
          count++;
        }
      }
      count++; // newline
    }
    return 40;
  }, []);

  useEffect(() => {
    let cancelled = false;

    function tick(time: number) {
      if (cancelled) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = time - lastTimeRef.current;

      setRevealed((prev) => {
        if (prev >= TOTAL_CHARS) return prev;
        const delay = getCharDelay(prev);
        if (elapsed >= delay) {
          lastTimeRef.current = time;
          return prev + 1;
        }
        return prev;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    // Initial delay before typing starts
    const startTimeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(startTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [getCharDelay]);

  // Report completed lines to parent
  useEffect(() => {
    let charCount = 0;
    let completed = 0;
    for (let i = 0; i < lines.length; i++) {
      for (const seg of lines[i]) {
        charCount += seg.text.length;
      }
      if (revealed >= charCount) {
        completed = i + 1;
      }
      if (i < lines.length - 1) charCount += 1; // newline
    }
    onProgress?.(completed);
  }, [revealed, onProgress]);

  // Detect completion and loop
  useEffect(() => {
    if (revealed >= TOTAL_CHARS && !loopPausedRef.current) {
      loopPausedRef.current = true;
      onTypingChange?.(false);
      const timeout = setTimeout(() => {
        setRevealed(0);
        lastTimeRef.current = 0;
        loopPausedRef.current = false;
        onTypingChange?.(true);
      }, 7000);
      return () => clearTimeout(timeout);
    } else if (revealed > 0 && !loopPausedRef.current) {
      onTypingChange?.(true);
    }
  }, [revealed, onTypingChange]);

  // Render visible lines
  function renderLines() {
    let charCount = 0;
    const elements: React.ReactNode[] = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineSegs = lines[lineIdx];
      const lineElements: React.ReactNode[] = [];

      for (let segIdx = 0; segIdx < lineSegs.length; segIdx++) {
        const seg = lineSegs[segIdx];
        const segStart = charCount;
        const segEnd = segStart + seg.text.length;

        if (revealed >= segStart) {
          const visibleLen = Math.min(revealed - segStart, seg.text.length);
          const visibleText = seg.text.slice(0, visibleLen);

          lineElements.push(
            <span key={`${lineIdx}-${segIdx}`} className={colorMap[seg.type]}>
              {visibleText}
            </span>
          );

          // Place cursor after the last revealed character
          if (revealed >= segStart && revealed < segEnd) {
            lineElements.push(
              <span
                key="cursor"
                className="animate-cursor-blink inline-block w-0 text-primary"
              >
                |
              </span>
            );
          }
        }

        charCount = segEnd;
      }

      // Cursor at end of empty line or end of last segment
      if (lineSegs.length === 0 && charCount <= revealed) {
        const isCurrentLine =
          charCount === revealed ||
          (lineIdx < lines.length - 1 && charCount + 1 > revealed);
        if (isCurrentLine) {
          lineElements.push(
            <span
              key="cursor"
              className="animate-cursor-blink inline-block w-0 text-primary"
            >
              |
            </span>
          );
        }
      }

      // Cursor at end of completed line
      if (
        lineSegs.length > 0 &&
        charCount <= revealed &&
        !lineElements.some(
          (el) => typeof el === "object" && el !== null && "key" in el && (el as React.ReactElement).key === "cursor"
        )
      ) {
        // Check if cursor should be at end of this line (revealed is at the newline)
        if (charCount === revealed) {
          lineElements.push(
            <span
              key="cursor"
              className="animate-cursor-blink inline-block w-0 text-primary"
            >
              |
            </span>
          );
        }
      }

      elements.push(
        <div key={lineIdx} className="min-h-[1.35em]">
          {lineElements}
        </div>
      );

      // Count the newline
      if (lineIdx < lines.length - 1) {
        charCount += 1;
      }
    }

    return elements;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div
        className="px-1 font-mono text-xs leading-relaxed break-words"
        aria-hidden="true"
      >
        {renderLines()}
      </div>
      <span className="sr-only">{fullText}</span>
    </div>
  );
}
