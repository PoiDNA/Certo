#!/usr/bin/env npx tsx
/**
 * RAG Document Ingestion Pipeline
 *
 * Usage:
 *   npx tsx scripts/rag/ingest.ts --source <path> --type <source_type> [--sector <sectors>] [--force]
 *
 * Examples:
 *   npx tsx scripts/rag/ingest.ts --source "/Users/lk/_PS/DNAHC ALL/Certo" --type internal
 *   npx tsx scripts/rag/ingest.ts --source external/regulations/ --type regulation --sector admin,corporate
 *   npx tsx scripts/rag/ingest.ts --source document.docx --type internal --force
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseDocx } from "./parsers/docx.js";
import { parsePdf } from "./parsers/pdf.js";
import { parseMarkdown } from "./parsers/markdown.js";
import { parseHtml } from "./parsers/html.js";
import { chunkSections } from "./chunker.js";
import { embedTexts } from "./embedder.js";
import { upsertDocument, insertChunks, getDocumentByHash } from "./store.js";
import type { ParsedSection } from "./parsers/docx.js";

// CLI args
const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const sourcePath = getArg("source");
const sourceType = getArg("type") || "internal";
const sectors = (getArg("sector") || "").split(",").filter(Boolean);
const force = hasFlag("force");
const confidential = hasFlag("confidential");
const language = getArg("language") || "pl";

if (!sourcePath) {
  console.error("Usage: npx tsx scripts/rag/ingest.ts --source <path> --type <type>");
  process.exit(1);
}

const SUPPORTED_EXTENSIONS = [".docx", ".pdf", ".md", ".html", ".htm"];

async function findFiles(dir: string): Promise<string[]> {
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    const ext = path.extname(dir).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext) ? [dir] : [];
  }

  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    // Skip temp files, hidden files, and 'inne' (old versions) folders
    if (entry.name.startsWith("~$") || entry.name.startsWith(".")) continue;
    if (entry.name === "inne" || entry.name === "node_modules") continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findFiles(fullPath)));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function computeHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function extractTitle(filePath: string): string {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/_/g, " ")
    .replace(/\s+v\d+[\._]\d+.*$/, "")
    .replace(/\s+DRUK$/, "")
    .replace(/\s+FINAL$/, "")
    .trim();
}

async function parseFile(filePath: string): Promise<ParsedSection[]> {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".docx":
      return parseDocx(filePath);
    case ".pdf":
      return parsePdf(filePath);
    case ".md":
      return parseMarkdown(filePath);
    case ".html":
    case ".htm": {
      const htmlContent = fs.readFileSync(filePath, "utf-8");
      return parseHtml(htmlContent, filePath);
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

async function ingestFile(filePath: string): Promise<void> {
  const fileHash = computeHash(filePath);
  const title = extractTitle(filePath);

  console.log(`\n📄 ${title}`);
  console.log(`   ${filePath}`);

  // Check for existing document (skip if hash matches and not forced)
  if (!force) {
    const existing = await getDocumentByHash(fileHash);
    if (existing) {
      console.log(`   ⏭️  Skipped (already ingested, use --force to re-ingest)`);
      return;
    }
  }

  // Parse
  console.log("   Parsing...");
  const sections = await parseFile(filePath);
  console.log(`   Found ${sections.length} sections`);

  if (sections.length === 0) {
    console.log("   ⚠️  No content extracted, skipping");
    return;
  }

  // Chunk
  console.log("   Chunking...");
  const chunks = chunkSections(sections);
  console.log(`   Created ${chunks.length} chunks`);

  // Embed
  console.log("   Embedding...");
  const texts = chunks.map((c) => c.content);
  const embeddings = await embedTexts(texts);

  // Store document
  console.log("   Storing...");
  const documentId = await upsertDocument({
    title,
    sourceType,
    sector: sectors,
    language,
    filePath,
    fileHash,
    confidential,
    metadata: {
      originalFilename: path.basename(filePath),
      chunkCount: chunks.length,
      totalTokens: chunks.reduce((sum, c) => sum + c.tokenCount, 0),
    },
  });

  // Store chunks
  await insertChunks(
    chunks.map((chunk, i) => ({
      documentId,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      tokenCount: chunk.tokenCount,
      embedding: embeddings[i],
      metadata: chunk.metadata,
    }))
  );

  console.log(`   ✅ Done (${chunks.length} chunks, document ID: ${documentId})`);
}

async function main() {
  console.log("🧠 Certo RAG Ingestion Pipeline");
  console.log(`   Source: ${sourcePath}`);
  console.log(`   Type: ${sourceType}`);
  if (sectors.length) console.log(`   Sectors: ${sectors.join(", ")}`);
  if (force) console.log(`   Force: re-ingest all`);

  const files = await findFiles(sourcePath!);
  console.log(`\nFound ${files.length} files to process\n`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      await ingestFile(file);
      success++;
    } catch (err) {
      console.error(`   ❌ Error: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  console.log(`\n📊 Summary: ${success} ingested, ${skipped} skipped, ${errors} errors`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
