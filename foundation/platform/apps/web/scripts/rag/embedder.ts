const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";
const BATCH_SIZE = 128;
const MAX_CONCURRENT = 3;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");

  const allEmbeddings: number[][] = [];
  const batches: string[][] = [];

  // Split into batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    batches.push(texts.slice(i, i + BATCH_SIZE));
  }

  // Process batches with concurrency limit
  for (let i = 0; i < batches.length; i += MAX_CONCURRENT) {
    const concurrentBatches = batches.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.all(
      concurrentBatches.map((batch) => embedBatch(batch, apiKey))
    );
    for (const result of results) {
      allEmbeddings.push(...result);
    }
    if (i + MAX_CONCURRENT < batches.length) {
      // Brief pause between concurrent groups to avoid rate limits
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return allEmbeddings;
}

export async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");

  const result = await embedBatch([text], apiKey, "query");
  return result[0];
}

async function embedBatch(
  texts: string[],
  apiKey: string,
  inputType: "document" | "query" = "document"
): Promise<number[][]> {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: texts,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI API error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
    usage: { total_tokens: number };
  };

  console.log(`  Embedded ${texts.length} texts (${data.usage.total_tokens} tokens)`);

  return data.data.map((d) => d.embedding);
}

// Reranker for retrieval
const RERANK_API_URL = "https://api.voyageai.com/v1/rerank";
const RERANK_MODEL = "rerank-2";

export interface RerankResult {
  index: number;
  relevance_score: number;
}

export async function rerankDocuments(
  query: string,
  documents: string[],
  topK: number = 8
): Promise<RerankResult[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");

  const response = await fetch(RERANK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: RERANK_MODEL,
      query,
      documents,
      top_k: topK,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI Rerank error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as {
    data: RerankResult[];
    usage: { total_tokens: number };
  };

  return data.data;
}
