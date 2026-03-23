import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hybridSearch } from "@/lib/rag/retrieval";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "q parameter required" }, { status: 400 });
  }

  const sectors = searchParams.get("sectors")?.split(",").filter(Boolean);
  const sourceTypes = searchParams.get("types")?.split(",").filter(Boolean);
  const topK = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

  try {
    const results = await hybridSearch(query, { sectors, sourceTypes }, topK);

    return NextResponse.json({
      query,
      count: results.length,
      results: results.map((r) => ({
        id: r.id,
        docTitle: r.docTitle,
        heading: (r.metadata as { heading?: string }).heading,
        content: r.content.slice(0, 500),
        docSourceType: r.docSourceType,
        docSector: r.docSector,
        score: r.score,
      })),
    });
  } catch (err) {
    console.error("RAG search error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
