import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  _supabase = createClient(url, key);
  return _supabase;
}

export interface DocumentRecord {
  title: string;
  sourceType: string;
  sector: string[];
  language: string;
  filePath: string;
  fileHash: string;
  confidential: boolean;
  version?: string;
  metadata?: Record<string, unknown>;
}

export interface ChunkRecord {
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export async function upsertDocument(doc: DocumentRecord): Promise<string> {
  const sb = getSupabase();

  // Check if document with same hash already exists
  const { data: existing } = await sb
    .from("rag_documents")
    .select("id")
    .eq("file_hash", doc.fileHash)
    .maybeSingle();

  if (existing) {
    console.log(`  Document already exists (hash match): ${doc.title}`);
    // Delete old chunks for re-ingestion
    await sb.from("rag_chunks").delete().eq("document_id", existing.id);
    console.log(`  Cleared old chunks for re-ingestion`);
    return existing.id;
  }

  // Insert new document
  const { data, error } = await sb
    .from("rag_documents")
    .insert({
      title: doc.title,
      source_type: doc.sourceType,
      sector: doc.sector,
      language: doc.language,
      file_path: doc.filePath,
      file_hash: doc.fileHash,
      confidential: doc.confidential,
      version: doc.version,
      metadata: doc.metadata || {},
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to insert document: ${error.message}`);
  return data.id;
}

export async function insertChunks(chunks: ChunkRecord[]): Promise<void> {
  const sb = getSupabase();
  const BATCH_SIZE = 50;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const rows = batch.map((c) => ({
      document_id: c.documentId,
      chunk_index: c.chunkIndex,
      content: c.content,
      token_count: c.tokenCount,
      embedding: JSON.stringify(c.embedding),
      metadata: c.metadata,
    }));

    const { error } = await sb.from("rag_chunks").insert(rows);
    if (error) throw new Error(`Failed to insert chunks: ${error.message}`);

    console.log(
      `  Inserted chunks ${i + 1}–${Math.min(i + BATCH_SIZE, chunks.length)} of ${chunks.length}`
    );
  }
}

export async function getDocumentByHash(
  hash: string
): Promise<{ id: string } | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("rag_documents")
    .select("id")
    .eq("file_hash", hash)
    .maybeSingle();
  return data;
}

export async function listDocuments(): Promise<
  Array<{
    id: string;
    title: string;
    source_type: string;
    sector: string[];
    ingested_at: string;
  }>
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("rag_documents")
    .select("id, title, source_type, sector, ingested_at")
    .order("ingested_at", { ascending: false });
  if (error) throw new Error(`Failed to list documents: ${error.message}`);
  return data || [];
}
