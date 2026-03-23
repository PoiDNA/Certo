import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key);
}

export async function GET() {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("rag_documents")
      .select("id, title, source_type, sector, language, confidential, version, ingested_at, metadata")
      .order("ingested_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get chunk counts per document
    const { data: chunkCounts } = await sb
      .from("rag_chunks")
      .select("document_id")
      .then(async (res) => {
        // Count chunks per document
        const counts = new Map<string, number>();
        for (const row of res.data || []) {
          counts.set(
            row.document_id,
            (counts.get(row.document_id) || 0) + 1
          );
        }
        return { data: counts };
      });

    const documents = (data || []).map((doc) => ({
      ...doc,
      chunkCount: chunkCounts?.get(doc.id) || 0,
    }));

    return NextResponse.json({ documents, total: documents.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list documents" },
      { status: 500 }
    );
  }
}
