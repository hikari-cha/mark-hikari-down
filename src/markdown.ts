import DOMPurify, { type Config } from "dompurify";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { visit } from "unist-util-visit";
import { unified } from "unified";

type HastElement = {
  type: "element";
  position?: { start?: { line?: number } };
  properties?: Record<string, unknown>;
};

export const DOM_PURIFY_CONFIG: Config = {
  USE_PROFILES: { html: true, mathMl: true, svg: false },
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

function rehypeSourceLineAttribute() {
  return (tree: unknown) => {
    visit(tree as any, "element", (node: HastElement) => {
      const line = node.position?.start?.line;
      if (!line) {
        return;
      }

      node.properties = node.properties ?? {};
      node.properties["data-source-line"] = String(line);
    });
  };
}

export function renderMarkdownToSafeHtml(markdown: string): string {
  const unsafeHtml = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkBreaks)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeSourceLineAttribute)
      .use(rehypeStringify)
      .processSync(markdown),
  );

  return String(DOMPurify.sanitize(unsafeHtml, DOM_PURIFY_CONFIG));
}
