/**
 * Standard page format dimensions for LaTeX document classes.
 * All pixel values computed at 96 DPI.
 *
 * Sources:
 *  - A4: 210 × 297 mm  (ISO 216)
 *  - Letter: 215.9 × 279.4 mm  (ANSI)
 *  - A5: 148 × 210 mm  (ISO 216)
 *  - B5: 176 × 250 mm  (ISO 216)
 *  - Beamer 4:3: 128 × 96 mm  (default beamer)
 *  - Beamer 16:9: 160 × 90 mm  (beamer aspectratio=169)
 */

export type PageFormatId =
  | "a4"
  | "letter"
  | "a5"
  | "b5"
  | "beamer-4-3"
  | "beamer-16-9";

export interface PageFormat {
  id: PageFormatId;
  label: string;
  /** Width in px at 96 DPI (or normalized reference width for slides) */
  widthPx: number;
  /** Height in px at 96 DPI (or proportional height for slides) */
  heightPx: number;
  /** Content padding in px */
  paddingPx: number;
  /** Whether this is a slide/presentation format */
  isSlide: boolean;
}

export const PAGE_FORMATS: Record<PageFormatId, PageFormat> = {
  a4: {
    id: "a4",
    label: "A4 (210 × 297 mm)",
    widthPx: 794,   // 210mm at 96 DPI
    heightPx: 1123,  // 297mm at 96 DPI
    paddingPx: 94,   // ~25mm
    isSlide: false,
  },
  letter: {
    id: "letter",
    label: "Letter (8.5 × 11 in)",
    widthPx: 816,   // 215.9mm at 96 DPI
    heightPx: 1056,  // 279.4mm at 96 DPI
    paddingPx: 94,   // ~25mm
    isSlide: false,
  },
  a5: {
    id: "a5",
    label: "A5 (148 × 210 mm)",
    widthPx: 559,   // 148mm at 96 DPI
    heightPx: 794,   // 210mm at 96 DPI
    paddingPx: 67,   // ~18mm
    isSlide: false,
  },
  b5: {
    id: "b5",
    label: "B5 (176 × 250 mm)",
    widthPx: 665,   // 176mm at 96 DPI
    heightPx: 945,   // 250mm at 96 DPI
    paddingPx: 75,   // ~20mm
    isSlide: false,
  },
  "beamer-4-3": {
    id: "beamer-4-3",
    label: "Slides 4:3",
    widthPx: 794,    // normalized to fill panel
    heightPx: 596,   // 794 × 3/4
    paddingPx: 38,   // slides have smaller margins
    isSlide: true,
  },
  "beamer-16-9": {
    id: "beamer-16-9",
    label: "Slides 16:9",
    widthPx: 794,    // normalized to fill panel
    heightPx: 447,   // 794 × 9/16
    paddingPx: 38,
    isSlide: true,
  },
};

/**
 * Detects the page format from LaTeX source by parsing \documentclass.
 *
 * Checks document class (beamer → slides) and paper size options
 * (a4paper, letterpaper, a5paper, b5paper). Defaults to A4.
 */
export function detectPageFormat(source: string): PageFormat {
  // Match \documentclass[options]{class}
  const match = source.match(
    /\\documentclass\s*(?:\[([^\]]*)\])?\s*\{(\w+)\}/
  );

  if (!match) return PAGE_FORMATS.a4;

  const options = match[1] || "";
  const docClass = match[2];

  // Beamer → slides
  if (docClass === "beamer") {
    // Check for 16:9 aspect ratio
    if (/aspectratio\s*=\s*169/.test(options)) {
      return PAGE_FORMATS["beamer-16-9"];
    }
    return PAGE_FORMATS["beamer-4-3"];
  }

  // Paper size from options
  if (/letterpaper/.test(options)) return PAGE_FORMATS.letter;
  if (/a5paper/.test(options)) return PAGE_FORMATS.a5;
  if (/b5paper/.test(options)) return PAGE_FORMATS.b5;
  if (/a4paper/.test(options)) return PAGE_FORMATS.a4;

  // Default: A4 for article/report/book/letter
  return PAGE_FORMATS.a4;
}
