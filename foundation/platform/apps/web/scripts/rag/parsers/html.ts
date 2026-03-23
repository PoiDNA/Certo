import type { ParsedSection } from "./docx.js";

/**
 * Parse HTML content (e.g., from EUR-Lex, OECD, legislation.gov.pl)
 * Strips tags, preserves structure via headings and articles.
 */
export function parseHtml(html: string, sourceUrl?: string): ParsedSection[] {
  // Strip script/style tags
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  // Convert headings to markdown-style markers
  text = text.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, level, content) => {
    const clean = stripTags(content).trim();
    return `\n${"#".repeat(parseInt(level))} ${clean}\n`;
  });

  // Convert <article> and <section> boundaries
  text = text.replace(/<(?:article|section)[^>]*>/gi, "\n---SECTION---\n");
  text = text.replace(/<\/(?:article|section)>/gi, "\n");

  // Convert paragraphs and list items
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "• ");
  text = text.replace(/<\/li>/gi, "\n");

  // Strip all remaining tags
  text = stripTags(text);

  // Decode entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  // Split by headings (markdown-style)
  return splitByHeadings(text, sourceUrl);
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function splitByHeadings(text: string, sourceUrl?: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let currentHeading = sourceUrl ? `Source: ${sourceUrl}` : "Document";
  let currentLevel = 0;
  const headingStack: string[] = [];
  let contentLines: string[] = [];

  function flush() {
    const content = contentLines.join("\n").trim();
    if (content && content.length > 20) {
      sections.push({
        heading: currentHeading,
        headingLevel: currentLevel,
        headingHierarchy: [...headingStack],
        content,
      });
    }
    contentLines = [];
  }

  for (const line of lines) {
    if (line.startsWith("---SECTION---")) {
      flush();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentHeading = title;
      currentLevel = level;

      while (headingStack.length >= level) headingStack.pop();
      headingStack.push(title);
    } else {
      contentLines.push(line);
    }
  }
  flush();

  return sections;
}
