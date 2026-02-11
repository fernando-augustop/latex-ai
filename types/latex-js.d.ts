declare module "latex.js" {
  export interface HtmlGeneratorOptions {
    hyphenate?: boolean;
  }

  export class HtmlGenerator {
    constructor(options?: HtmlGeneratorOptions);
  }

  export interface ParsedDocument {
    domFragment(): DocumentFragment;
    htmlDocument(): Document;
  }

  export function parse(
    input: string,
    options?: { generator: HtmlGenerator }
  ): ParsedDocument;
}
