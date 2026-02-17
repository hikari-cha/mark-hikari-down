import { renderMarkdownToSafeHtml } from "./markdown";

describe("renderMarkdownToSafeHtml", () => {
  it("renders headings and paragraphs", () => {
    const html = renderMarkdownToSafeHtml("# Title\n\nhello");

    expect(html).toMatch(/<h1[^>]*>Title<\/h1>/);
    expect(html).toMatch(/<p[^>]*>hello<\/p>/);
  });

  it("renders italic emphasis", () => {
    const html = renderMarkdownToSafeHtml("*italic*");

    expect(html).toMatch(/<em[^>]*>italic<\/em>/);
  });

  it("keeps plain line breaks as rendered breaks", () => {
    const html = renderMarkdownToSafeHtml("line1\nline2");

    expect(html).toMatch(/<p[^>]*>line1<br>\nline2<\/p>/);
  });

  it("preserves repeated blank lines for plain text", () => {
    const html = renderMarkdownToSafeHtml("line1\n\n\nline2");

    expect(html).toMatch(/<p[^>]*>line1<\/p>/);
    expect(html).toMatch(/<p[^>]*>line2<\/p>/);
  });

  it("renders list after three or more blank lines", () => {
    const html = renderMarkdownToSafeHtml("before\n\n\n- item");

    expect(html).toContain("<ul");
    expect(html).toMatch(/<li[^>]*>item<\/li>/);
  });

  it("renders KaTeX output", () => {
    const html = renderMarkdownToSafeHtml("$E=mc^2$");

    expect(html).toContain("katex");
  });

  it("sanitizes XSS payloads", () => {
    const html = renderMarkdownToSafeHtml(
      `<img src="x" onerror="alert('xss')"><script>alert('xss')</script>[x](javascript:alert('xss'))`,
    );

    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:alert");
  });
});
