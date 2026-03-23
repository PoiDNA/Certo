import fs from "fs";
import type { ParsedSection } from "./docx.js";

export async function parsePdf(filePath: string): Promise<ParsedSection[]> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  // PDF text is flat — split by paragraph breaks and group into sections
  const text = data.text;
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  const sections: ParsedSection[] = [];
  let currentSection: string[] = [];
  let currentHeading = "Document";
  let sectionIndex = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();

    // Heuristic: short uppercase or numbered lines are likely headings
    const isHeading =
      (trimmed.length < 120 &&
        (trimmed === trimmed.toUpperCase() ||
          /^(?:Article|Art\.|§|Rozdział|Sekcja|Część|ROZDZIAŁ|SEKCJA)\s/i.test(
            trimmed
          ) ||
          /^\d+\.\s+[A-ZĄĆĘŁŃÓŚŹŻ]/.test(trimmed)));

    if (isHeading && currentSection.length > 0) {
      sections.push({
        heading: currentHeading,
        headingLevel: 1,
        headingHierarchy: [currentHeading],
        content: currentSection.join("\n\n"),
      });
      currentSection = [];
      sectionIndex++;
    }

    if (isHeading) {
      currentHeading = trimmed;
    } else {
      currentSection.push(trimmed);
    }
  }

  // Flush last section
  if (currentSection.length > 0) {
    sections.push({
      heading: currentHeading,
      headingLevel: 1,
      headingHierarchy: [currentHeading],
      content: currentSection.join("\n\n"),
    });
  }

  return sections;
}
