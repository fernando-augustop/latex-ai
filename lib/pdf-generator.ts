/**
 * Generates a PDF download from HTML content rendered by latex.js.
 * Opens a hidden iframe with the full latex.js stylesheet and triggers
 * the browser's native print dialog (Save as PDF).
 *
 * Note: htmlContent is produced locally by latex.js from the user's own
 * LaTeX source — it is NOT untrusted external input.
 */
export function downloadPdfViaPrint(
  htmlContent: string,
  filename?: string
): void {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("Could not access iframe document");
  }

  // Chrome uses <title> as the default PDF filename
  const title = filename ? filename.replace(/\.pdf$/i, "") : "document";

  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page {
    size: A4;
    margin: 0;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
    font-family: "Computer Modern Serif", "Times New Roman", serif;
    font-size: 10pt;
    line-height: 1.2;
    text-align: justify;
  }
  body {
    padding: 25mm;
  }
  h1, h2, h3, h4 {
    font-family: "Computer Modern Serif", "Times New Roman", serif;
    font-style: normal;
    text-align: left;
  }
  h2 { font-size: 1.4rem; font-weight: bold; margin-top: 3.5ex; margin-bottom: 2.3ex; }
  h3 { font-size: 1.2rem; font-weight: bold; margin-top: 3.25ex; margin-bottom: 1.5ex; }
  h4 { font-size: 1rem; font-weight: bold; margin-top: 3.25ex; margin-bottom: 1.5ex; }
  p { margin: 0; text-indent: 1.5em; }
  h1 + p, h2 + p, h3 + p, h4 + p { text-indent: 0; }
  code { white-space: pre; font-family: "Computer Modern Typewriter", "Courier New", monospace; }
  pre { font-family: "Computer Modern Typewriter", "Courier New", monospace; font-size: 0.85em; }
  img { max-width: 100%; }
  .title { font-size: 1.7rem; text-align: center; }
  .author, .date { font-size: 1.2rem; text-align: center; }
  .centering { text-align: center; text-indent: 0; }
  .raggedright { text-align: left; text-indent: 0; }
  .raggedleft { text-align: right; text-indent: 0; }
  .bf { font-weight: bold; }
  .it { font-style: italic; }
  .tt { font-family: "Computer Modern Typewriter", "Courier New", monospace; }
  .sc { font-variant-caps: small-caps; }
  .tiny { font-size: .5rem; }
  .scriptsize { font-size: .7rem; }
  .footnotesize { font-size: .82rem; }
  .small { font-size: .91rem; }
  .normalsize { font-size: 1rem; }
  .large { font-size: 1.2rem; }
  .Large { font-size: 1.4rem; }
  .LARGE { font-size: 1.7rem; }
  .huge { font-size: 2rem; }
  .Huge { font-size: 2.5rem; }
  .underline { border-bottom: 0.4pt solid; }
  ul, ol, dl { margin: 0; padding: 0; }
  li { list-style: none; }
  .list { margin-left: 2.5em; }
  .quote, .quotation, .verse { margin-left: 2.5em; margin-right: 2.5em; }
  .abstract { margin: 1em 2em; }
  /* Hide grid layout artifacts — flatten for print */
  .body { display: block; }
  .margin-left, .margin-right { display: none; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>${htmlContent}</body>
</html>`);
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Clean up after a delay to let the print dialog open
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };
}
