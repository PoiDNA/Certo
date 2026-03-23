import type { ParsedSection } from "./parsers/docx.js";

const CHUNK_SIZE = 512; // tokens
const CHUNK_OVERLAP = 64; // tokens

export interface Chunk {
  content: string;
  tokenCount: number;
  chunkIndex: number;
  metadata: {
    heading: string;
    headingLevel: number;
    headingHierarchy: string[];
  };
}

// Simple token estimation: ~4 chars per token for Polish/English text
// More accurate than word count for mixed-language governance documents
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries, preserving the delimiter
  return text
    .split(/(?<=[.!?;])\s+/)
    .filter((s) => s.trim().length > 0);
}

export function chunkSections(sections: ParsedSection[]): Chunk[] {
  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  for (const section of sections) {
    const sectionTokens = estimateTokens(section.content);

    // If section fits in one chunk, keep it whole
    if (sectionTokens <= CHUNK_SIZE) {
      if (section.content.trim()) {
        chunks.push({
          content: section.content.trim(),
          tokenCount: sectionTokens,
          chunkIndex: chunkIndex++,
          metadata: {
            heading: section.heading,
            headingLevel: section.headingLevel,
            headingHierarchy: section.headingHierarchy,
          },
        });
      }
      continue;
    }

    // Split large sections by paragraphs first, then sentences
    const paragraphs = section.content.split(/\n{2,}/);
    let currentChunkParts: string[] = [];
    let currentTokens = 0;

    for (const para of paragraphs) {
      const paraTokens = estimateTokens(para);

      // If adding this paragraph exceeds limit, flush current chunk
      if (currentTokens + paraTokens > CHUNK_SIZE && currentChunkParts.length > 0) {
        const chunkContent = currentChunkParts.join("\n\n").trim();
        if (chunkContent) {
          chunks.push({
            content: chunkContent,
            tokenCount: estimateTokens(chunkContent),
            chunkIndex: chunkIndex++,
            metadata: {
              heading: section.heading,
              headingLevel: section.headingLevel,
              headingHierarchy: section.headingHierarchy,
            },
          });
        }

        // Overlap: keep last part for context continuity
        const overlapText = currentChunkParts[currentChunkParts.length - 1];
        if (estimateTokens(overlapText) <= CHUNK_OVERLAP * 2) {
          currentChunkParts = [overlapText];
          currentTokens = estimateTokens(overlapText);
        } else {
          currentChunkParts = [];
          currentTokens = 0;
        }
      }

      // If a single paragraph is too large, split by sentences
      if (paraTokens > CHUNK_SIZE) {
        // Flush what we have
        if (currentChunkParts.length > 0) {
          const chunkContent = currentChunkParts.join("\n\n").trim();
          if (chunkContent) {
            chunks.push({
              content: chunkContent,
              tokenCount: estimateTokens(chunkContent),
              chunkIndex: chunkIndex++,
              metadata: {
                heading: section.heading,
                headingLevel: section.headingLevel,
                headingHierarchy: section.headingHierarchy,
              },
            });
          }
          currentChunkParts = [];
          currentTokens = 0;
        }

        const sentences = splitIntoSentences(para);
        let sentenceGroup: string[] = [];
        let groupTokens = 0;

        for (const sentence of sentences) {
          const sentTokens = estimateTokens(sentence);
          if (groupTokens + sentTokens > CHUNK_SIZE && sentenceGroup.length > 0) {
            chunks.push({
              content: sentenceGroup.join(" ").trim(),
              tokenCount: groupTokens,
              chunkIndex: chunkIndex++,
              metadata: {
                heading: section.heading,
                headingLevel: section.headingLevel,
                headingHierarchy: section.headingHierarchy,
              },
            });
            // Overlap from last sentence
            sentenceGroup = [sentenceGroup[sentenceGroup.length - 1]];
            groupTokens = estimateTokens(sentenceGroup[0]);
          }
          sentenceGroup.push(sentence);
          groupTokens += sentTokens;
        }

        if (sentenceGroup.length > 0) {
          currentChunkParts = [sentenceGroup.join(" ")];
          currentTokens = groupTokens;
        }
      } else {
        currentChunkParts.push(para);
        currentTokens += paraTokens;
      }
    }

    // Flush remaining
    if (currentChunkParts.length > 0) {
      const chunkContent = currentChunkParts.join("\n\n").trim();
      if (chunkContent) {
        chunks.push({
          content: chunkContent,
          tokenCount: estimateTokens(chunkContent),
          chunkIndex: chunkIndex++,
          metadata: {
            heading: section.heading,
            headingLevel: section.headingLevel,
            headingHierarchy: section.headingHierarchy,
          },
        });
      }
    }
  }

  return chunks;
}
