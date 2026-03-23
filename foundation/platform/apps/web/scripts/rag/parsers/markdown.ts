import fs from "fs";
import type { ParsedSection } from "./docx.js";

export function parseMarkdown(filePath: string): ParsedSection[] {
  const content = fs.readFileSync(filePath, "utf-8");
  return splitByHeadings(content);
}

function splitByHeadings(markdown: string): ParsedSection[] {
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];
  let currentHeading = "Introduction";
  let currentLevel = 0;
  const headingStack: string[] = [];
  let contentLines: string[] = [];

  function flush() {
    const content = contentLines.join("\n").trim();
    if (content) {
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
    // Skip frontmatter
    if (line === "---" && sections.length === 0 && contentLines.length === 0) {
      const fmEnd = lines.indexOf("---", lines.indexOf(line) + 1);
      if (fmEnd > 0) continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentHeading = title;
      currentLevel = level;

      while (headingStack.length >= level) {
        headingStack.pop();
      }
      headingStack.push(title);
    } else {
      contentLines.push(line);
    }
  }
  flush();

  return sections;
}
