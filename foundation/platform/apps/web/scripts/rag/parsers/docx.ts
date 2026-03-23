import * as mammoth from "mammoth";
import fs from "fs";

export interface ParsedSection {
  heading: string;
  headingLevel: number;
  headingHierarchy: string[];
  content: string;
}

export async function parseDocx(filePath: string): Promise<ParsedSection[]> {
  const buffer = fs.readFileSync(filePath);
  const result = await (mammoth as any).convertToMarkdown({ buffer });
  return splitByHeadings(result.value);
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
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentHeading = title;
      currentLevel = level;

      // Maintain heading hierarchy
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
