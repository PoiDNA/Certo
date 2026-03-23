import { createClient } from "@supabase/supabase-js";

// Supabase client for RAG operations
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  _supabase = createClient(url, key);
  return _supabase;
}

// Voyage AI embedding for queries
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";

async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: [text],
      input_type: "query",
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage AI error: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return data.data[0].embedding;
}

// Voyage AI reranker
const RERANK_API_URL = "https://api.voyageai.com/v1/rerank";

async function rerank(
  query: string,
  documents: string[],
  topK: number
): Promise<Array<{ index: number; relevance_score: number }>> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");

  const response = await fetch(RERANK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "rerank-2",
      query,
      documents,
      top_k: topK,
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage AI Rerank error: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: Array<{ index: number; relevance_score: number }>;
  };
  return data.data;
}

// Types
export interface RetrievedChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata: Record<string, unknown>;
  docTitle: string;
  docSourceType: string;
  docSector: string[];
  score: number;
}

export interface SearchFilters {
  sectors?: string[];
  sourceTypes?: string[];
  includeConfidential?: boolean;
}

/**
 * Sector relevance detection: infer which sectors a query relates to
 * based on keyword matching. Used for automatic sector boosting.
 */
const SECTOR_KEYWORDS: Record<string, string[]> = {
  jst: [
    "jst", "samorząd", "gmina", "powiat", "województwo", "burmistrz",
    "wójt", "starosta", "marszałek", "rada gminy", "rada powiatu",
    "sejmik", "budżet obywatelski", "administracja publiczna", "urzad",
    "jednostka samorządu", "fundusz sołecki", "obywatelski",
  ],
  corporate: [
    "korporacja", "spółka", "zarząd", "rada nadzorcza", "akcjonariusz",
    "ksh", "corporate governance", "compliance", "esg", "audyt",
    "sprawozdanie finansowe", "giełda", "notowana", "ład korporacyjny",
    "komitet audytu", "walne zgromadzenie", "dobre praktyki",
  ],
  ngo: [
    "ngo", "fundacja", "stowarzyszenie", "organizacja pozarządowa",
    "pożytku publicznego", "wolontariat", "darczyńca", "dotacja",
    "trzeci sektor", "społeczeństwo obywatelskie", "non-profit",
  ],
  medical: [
    "medyczny", "szpital", "klinika", "pacjent", "lekarz", "nfz",
    "ochrona zdrowia", "podmiot leczniczy", "akredytacja szpitalna",
    "who", "zdrowie publiczne", "farmaceutyczny", "bioetyka",
  ],
  defense: [
    "obronny", "wojskowy", "nato", "bezpieczeństwo narodowe",
    "siły zbrojne", "mon", "cyberbezpieczeństwo", "nis2",
    "infrastruktura krytyczna", "obronność", "militarny",
  ],
};

function detectQuerySectors(query: string): string[] {
  const normalized = query.toLowerCase();
  const detected: string[] = [];

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        detected.push(sector);
        break;
      }
    }
  }

  return detected;
}

// Reciprocal Rank Fusion with optional sector boost
function rrfFuse(
  semanticResults: Array<{ id: string; score: number }>,
  keywordResults: Array<{ id: string; score: number }>,
  k: number = 60,
  sectorBoost?: { chunkSectors: Map<string, string[]>; querySectors: string[] }
): Map<string, number> {
  const scores = new Map<string, number>();

  semanticResults.forEach((r, rank) => {
    const current = scores.get(r.id) || 0;
    scores.set(r.id, current + 1 / (k + rank + 1));
  });

  keywordResults.forEach((r, rank) => {
    const current = scores.get(r.id) || 0;
    scores.set(r.id, current + 1 / (k + rank + 1));
  });

  // Apply sector boost: +25% for chunks whose document sector matches the query
  if (sectorBoost && sectorBoost.querySectors.length > 0) {
    const BOOST_FACTOR = 1.25;
    for (const [id, score] of scores) {
      const chunkSectors = sectorBoost.chunkSectors.get(id) || [];
      const hasOverlap = chunkSectors.some((s) =>
        sectorBoost.querySectors.includes(s)
      );
      if (hasOverlap) {
        scores.set(id, score * BOOST_FACTOR);
      }
    }
  }

  return scores;
}

/**
 * Multi-query hybrid search: runs hybrid search for multiple query variants
 * and deduplicates results before reranking.
 */
export async function multiQueryHybridSearch(
  queries: string[],
  filters: SearchFilters = {},
  topK: number = 8
): Promise<RetrievedChunk[]> {
  if (queries.length <= 1) {
    return hybridSearch(queries[0] || "", filters, topK);
  }

  const sb = getSupabase();

  // Run semantic + keyword for ALL queries in parallel
  const allEmbeddings = await Promise.all(queries.map((q) => embedQuery(q)));

  const searchPromises = queries.flatMap((q, qi) => [
    (sb.rpc as any)("match_rag_chunks", {
      query_embedding: JSON.stringify(allEmbeddings[qi]),
      match_threshold: 0.3,
      match_count: 15, // fewer per query since we merge
      filter_sectors: filters.sectors || null,
      filter_source_types: filters.sourceTypes || null,
      filter_confidential: filters.includeConfidential || false,
    }),
    (sb.rpc as any)("search_rag_chunks", {
      query_text: q,
      match_count: 15,
      filter_sectors: filters.sectors || null,
      filter_source_types: filters.sourceTypes || null,
      filter_confidential: filters.includeConfidential || false,
    }),
  ]);

  const results = await Promise.all(searchPromises);

  // Collect all chunks into a unified map
  const chunkMap = new Map<string, {
    id: string; document_id: string; chunk_index: number;
    content: string; token_count: number; metadata: Record<string, unknown>;
    doc_title: string; doc_source_type: string; doc_sector: string[];
  }>();
  const semanticHits: Array<{ id: string; score: number }> = [];
  const keywordHits: Array<{ id: string; score: number }> = [];

  for (let i = 0; i < results.length; i++) {
    const data = (results[i].data || []) as any[];
    const isSemantic = i % 2 === 0;

    for (const r of data) {
      if (!chunkMap.has(r.id)) {
        chunkMap.set(r.id, r);
      }
      if (isSemantic) {
        semanticHits.push({ id: r.id, score: r.similarity });
      } else {
        keywordHits.push({ id: r.id, score: r.rank });
      }
    }
  }

  // Detect sectors from query for automatic boosting
  const querySectors = detectQuerySectors(queries[0]);
  const chunkSectors = new Map<string, string[]>();
  for (const [id, chunk] of chunkMap) {
    chunkSectors.set(id, chunk.doc_sector);
  }

  // RRF fusion across all queries with sector boost
  const rrfScores = rrfFuse(semanticHits, keywordHits, 60, {
    chunkSectors,
    querySectors,
  });

  // Sort by RRF score, take top 40 for reranking
  const fusedIds = [...rrfScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([id]) => id);

  const fusedChunks = fusedIds
    .map((id) => chunkMap.get(id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  if (fusedChunks.length === 0) return [];

  // Rerank against the ORIGINAL query (first one)
  const reranked = await rerank(
    queries[0],
    fusedChunks.map((c) => c.content),
    topK
  );

  return reranked.map((r) => {
    const chunk = fusedChunks[r.index];
    return {
      id: chunk.id,
      documentId: chunk.document_id,
      chunkIndex: chunk.chunk_index,
      content: chunk.content,
      tokenCount: chunk.token_count,
      metadata: chunk.metadata,
      docTitle: chunk.doc_title,
      docSourceType: chunk.doc_source_type,
      docSector: chunk.doc_sector,
      score: r.relevance_score,
    };
  });
}

/**
 * Hybrid search: semantic + BM25 + RRF fusion + Voyage reranker
 */
export async function hybridSearch(
  query: string,
  filters: SearchFilters = {},
  topK: number = 8
): Promise<RetrievedChunk[]> {
  const sb = getSupabase();

  // Step 1: Parallel semantic + keyword search
  const queryEmbedding = await embedQuery(query);

  const [semanticRes, keywordRes] = await Promise.all([
    // Semantic search via Supabase RPC
    (sb.rpc as any)("match_rag_chunks", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.3,
      match_count: 20,
      filter_sectors: filters.sectors || null,
      filter_source_types: filters.sourceTypes || null,
      filter_confidential: filters.includeConfidential || false,
    }),
    // Full-text search via Supabase RPC
    (sb.rpc as any)("search_rag_chunks", {
      query_text: query,
      match_count: 20,
      filter_sectors: filters.sectors || null,
      filter_source_types: filters.sourceTypes || null,
      filter_confidential: filters.includeConfidential || false,
    }),
  ]);

  const semanticData = (semanticRes.data || []) as Array<{
    id: string;
    document_id: string;
    chunk_index: number;
    content: string;
    token_count: number;
    metadata: Record<string, unknown>;
    similarity: number;
    doc_title: string;
    doc_source_type: string;
    doc_sector: string[];
  }>;

  const keywordData = (keywordRes.data || []) as Array<{
    id: string;
    document_id: string;
    chunk_index: number;
    content: string;
    token_count: number;
    metadata: Record<string, unknown>;
    rank: number;
    doc_title: string;
    doc_source_type: string;
    doc_sector: string[];
  }>;

  // Step 2: RRF fusion
  const rrfScores = rrfFuse(
    semanticData.map((r) => ({ id: r.id, score: r.similarity })),
    keywordData.map((r) => ({ id: r.id, score: r.rank }))
  );

  // Build lookup map for chunk data
  const chunkMap = new Map<string, typeof semanticData[0] | typeof keywordData[0]>();
  for (const r of semanticData) chunkMap.set(r.id, r);
  for (const r of keywordData) {
    if (!chunkMap.has(r.id)) chunkMap.set(r.id, r);
  }

  // Sort by RRF score, take top 40 for reranking
  const fusedIds = [...rrfScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([id]) => id);

  const fusedChunks = fusedIds
    .map((id) => chunkMap.get(id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  if (fusedChunks.length === 0) {
    return [];
  }

  // Step 3: Rerank with Voyage AI
  const reranked = await rerank(
    query,
    fusedChunks.map((c) => c.content),
    topK
  );

  // Build final results
  return reranked.map((r) => {
    const chunk = fusedChunks[r.index];
    return {
      id: chunk.id,
      documentId: chunk.document_id,
      chunkIndex: chunk.chunk_index,
      content: chunk.content,
      tokenCount: chunk.token_count,
      metadata: chunk.metadata,
      docTitle: chunk.doc_title,
      docSourceType: chunk.doc_source_type,
      docSector: chunk.doc_sector,
      score: r.relevance_score,
    };
  });
}
