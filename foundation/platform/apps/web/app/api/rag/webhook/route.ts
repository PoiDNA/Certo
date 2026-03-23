import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Storage webhook endpoint for automatic document ingestion.
 *
 * When a file is uploaded to Supabase Storage (e.g. `rag-documents` bucket),
 * this webhook downloads it and triggers the ingestion pipeline.
 *
 * Expected webhook payload (Supabase Storage):
 * {
 *   type: "INSERT",
 *   table: "objects",
 *   record: { bucket_id, name, ... },
 *   ...
 * }
 *
 * Validates via WEBHOOK_SECRET header.
 */

const SUPPORTED_EXTENSIONS = [".docx", ".pdf", ".md", ".html", ".htm"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const authHeader =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("authorization");

  if (authHeader !== secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // Extract file info from Supabase Storage webhook payload
    const record = payload.record;
    if (!record || !record.name) {
      return NextResponse.json(
        { error: "Invalid payload: missing record.name" },
        { status: 400 }
      );
    }

    const bucketId: string = record.bucket_id || "rag-documents";
    const filePath: string = record.name;
    const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { message: `Unsupported file type: ${ext}, skipping` },
        { status: 200 }
      );
    }

    // Download file from Supabase Storage
    const sb = getSupabase();
    const { data, error } = await sb.storage.from(bucketId).download(filePath);

    if (error || !data) {
      return NextResponse.json(
        { error: `Failed to download file: ${error?.message || "unknown"}` },
        { status: 500 }
      );
    }

    // Write to a temp file for the ingestion pipeline
    const { writeFile, mkdtemp, unlink } = await import("fs/promises");
    const { join } = await import("path");
    const { tmpdir } = await import("os");

    const tmpDir = await mkdtemp(join(tmpdir(), "certo-webhook-"));
    const tmpFile = join(tmpDir, filePath.split("/").pop() || "document" + ext);

    const buffer = Buffer.from(await data.arrayBuffer());
    await writeFile(tmpFile, buffer);

    // Run ingestion inline (import pipeline modules)
    // We use dynamic imports since these are script modules
    const { parseDocx } = await import(
      "../../../../scripts/rag/parsers/docx.js"
    );
    const { parsePdf } = await import(
      "../../../../scripts/rag/parsers/pdf.js"
    );
    const { parseMarkdown } = await import(
      "../../../../scripts/rag/parsers/markdown.js"
    );
    const { parseHtml } = await import(
      "../../../../scripts/rag/parsers/html.js"
    );
    const { chunkSections } = await import(
      "../../../../scripts/rag/chunker.js"
    );
    const { embedTexts } = await import(
      "../../../../scripts/rag/embedder.js"
    );
    const { upsertDocument, insertChunks } = await import(
      "../../../../scripts/rag/store.js"
    );
    const crypto = await import("crypto");

    // Parse file based on extension
    let sections;
    switch (ext) {
      case ".docx":
        sections = await parseDocx(tmpFile);
        break;
      case ".pdf":
        sections = await parsePdf(tmpFile);
        break;
      case ".md":
        sections = await parseMarkdown(tmpFile);
        break;
      case ".html":
      case ".htm": {
        const { readFile } = await import("fs/promises");
        const htmlContent = await readFile(tmpFile, "utf-8");
        sections = parseHtml(htmlContent, filePath);
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unsupported: ${ext}` },
          { status: 400 }
        );
    }

    if (!sections || sections.length === 0) {
      await unlink(tmpFile).catch(() => {});
      return NextResponse.json(
        { message: "No content extracted from file" },
        { status: 200 }
      );
    }

    // Chunk
    const chunks = chunkSections(sections);

    // Embed
    const texts = chunks.map((c: { content: string }) => c.content);
    const embeddings = await embedTexts(texts);

    // Compute hash for dedup
    const fileHash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    // Extract title from filename
    const title = filePath
      .split("/")
      .pop()!
      .replace(/\.[^.]+$/, "")
      .replace(/_/g, " ")
      .trim();

    // Store document
    const documentId = await upsertDocument({
      title,
      sourceType: "internal",
      sector: [],
      language: "pl",
      filePath: `storage://${bucketId}/${filePath}`,
      fileHash,
      confidential: false,
      metadata: {
        source: "webhook",
        bucket: bucketId,
        originalPath: filePath,
        chunkCount: chunks.length,
        totalTokens: chunks.reduce(
          (sum: number, c: { tokenCount: number }) => sum + c.tokenCount,
          0
        ),
        ingestedAt: new Date().toISOString(),
      },
    });

    // Store chunks
    await insertChunks(
      chunks.map(
        (
          chunk: {
            chunkIndex: number;
            content: string;
            tokenCount: number;
            metadata: Record<string, unknown>;
          },
          i: number
        ) => ({
          documentId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          embedding: embeddings[i],
          metadata: chunk.metadata,
        })
      )
    );

    // Clean up temp file
    await unlink(tmpFile).catch(() => {});

    return NextResponse.json({
      success: true,
      documentId,
      chunks: chunks.length,
      title,
    });
  } catch (err) {
    console.error("Webhook ingestion error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
