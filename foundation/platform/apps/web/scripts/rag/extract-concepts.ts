#!/usr/bin/env npx tsx
/**
 * Knowledge Graph Entity Extraction Pipeline
 *
 * Extracts concepts, relationships, and rules from existing RAG chunks
 * using Claude Haiku for cost-efficient structured extraction.
 *
 * Usage:
 *   npx tsx scripts/rag/extract-concepts.ts [--limit N] [--offset N] [--force]
 *
 * Requires env vars: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, VOYAGE_API_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// ─── Config ─────────────────────────────────────────────────────────────────

const BATCH_SIZE = 10;
const CONCURRENCY = 3;
const MODEL = "claude-haiku-4-5-20251001";

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}
const limit = parseInt(getArg("limit") || "0") || 0;
const offset = parseInt(getArg("offset") || "0") || 0;
const force = args.includes("--force");

// ─── Clients ────────────────────────────────────────────────────────────────

const anthropic = new Anthropic();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function from(table: string) { return supabase.from(table) as any; }

// ─── Voyage AI embedding ────────────────────────────────────────────────────

async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");

  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: "voyage-3", input: texts, input_type: "document" }),
  });
  if (!res.ok) throw new Error(`Voyage error: ${res.status}`);
  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

// ─── Extraction prompt ──────────────────────────────────────────────────────

const EXTRACTION_PROMPT = `Jesteś ekspertem ds. ekstrakcji wiedzy z dokumentów o governance, zarządzaniu i regulacjach.

Przeanalizuj podany fragment tekstu i wyekstrahuj:

1. **Koncepty** (pojęcia, byty) — nazwy kanoniczne w języku polskim
2. **Relacje** między konceptami
3. **Reguły** (wymogi, zakazy, warunki) jeśli występują

## Typy konceptów
- principle — zasada governance (np. "transparentność", "rozliczalność")
- requirement — wymóg regulacyjny (np. "wyznaczenie DPO")
- indicator — wskaźnik oceny (np. "wskaźnik jawności")
- regulation — regulacja/norma (np. "RODO", "KSH", "ISO 27001")
- process — proces (np. "zarządzanie ryzykiem", "audyt wewnętrzny")
- role — rola (np. "DPO", "radny", "audytor wewnętrzny")
- standard — standard (np. "ISO 31000", "COSO")
- risk_category — kategoria ryzyka (np. "ryzyko operacyjne")

## Typy relacji
- requires — A wymaga B
- contradicts — A jest sprzeczne z B
- supersedes — A zastępuje B
- refines — A uszczegóławia B
- references — A odwołuje się do B
- part_of — A jest częścią B
- measured_by — A jest mierzone przez B
- implements — A implementuje B

## Typy reguł
- requirement — A wymaga B
- prohibition — A zabrania B
- conditional — jeśli A to B
- scoring_weight — waga wskaźnika
- chain — łańcuch A→B→C

## Format odpowiedzi — WYŁĄCZNIE JSON, bez komentarzy:
{
  "concepts": [
    { "name": "...", "name_en": "...", "type": "...", "sectors": ["jst","corporate",...], "description": "krótki opis" }
  ],
  "relationships": [
    { "source": "nazwa konceptu A", "target": "nazwa konceptu B", "type": "requires", "evidence": "krótki cytat" }
  ],
  "rules": [
    {
      "name": "krótka nazwa reguły",
      "description": "pełny opis",
      "type": "requirement",
      "sectors": ["corporate"],
      "condition": { "type": "concept_present", "concept": "nazwa konceptu" },
      "consequence": { "type": "requirement", "description": "co wynika", "target_concept": "nazwa", "regulation_ref": "art. X" }
    }
  ]
}

WAŻNE:
- Ekstrahuj TYLKO koncepty wyraźnie obecne w tekście
- Nazwy konceptów: kanoniczne, w mianowniku, po polsku
- Nie wymyślaj relacji, których tekst nie potwierdza
- Jeśli tekst nie zawiera wyraźnych konceptów, zwróć puste tablice`;

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExtractedConcept {
  name: string;
  name_en?: string;
  type: string;
  sectors: string[];
  description?: string;
}

interface ExtractedRelationship {
  source: string;
  target: string;
  type: string;
  evidence?: string;
}

interface ExtractedRule {
  name: string;
  description: string;
  type: string;
  sectors: string[];
  condition: Record<string, unknown>;
  consequence: Record<string, unknown>;
}

interface ExtractionResult {
  concepts: ExtractedConcept[];
  relationships: ExtractedRelationship[];
  rules: ExtractedRule[];
}

interface ChunkRow {
  id: string;
  content: string;
  document_id: string;
  metadata: { heading?: string };
}

// ─── Extract from single chunk ──────────────────────────────────────────────

async function extractFromChunk(chunk: ChunkRow): Promise<ExtractionResult | null> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: EXTRACTION_PROMPT,
      messages: [{ role: "user", content: `Fragment (heading: "${chunk.metadata?.heading || "—"}"):\n\n${chunk.content}` }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as ExtractionResult;
  } catch (err) {
    console.error(`  ⚠ Extraction failed for chunk ${chunk.id}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

// ─── Concept upsert (dedup) ─────────────────────────────────────────────────

const conceptCache = new Map<string, string>(); // name+type → id

async function upsertConcept(concept: ExtractedConcept): Promise<string | null> {
  const key = `${concept.name.toLowerCase()}|${concept.type}`;
  if (conceptCache.has(key)) return conceptCache.get(key)!;

  // Check existing
  const { data: existing } = await from("kg_concepts")
    .select("id, sectors")
    .eq("concept_type", concept.type)
    .ilike("name", concept.name)
    .maybeSingle();

  if (existing) {
    // Merge sectors
    const merged = [...new Set([...(existing.sectors || []), ...concept.sectors])];
    if (merged.length > (existing.sectors || []).length) {
      await from("kg_concepts").update({ sectors: merged }).eq("id", existing.id);
    }
    conceptCache.set(key, existing.id);
    return existing.id;
  }

  // Insert new
  const { data, error } = await from("kg_concepts")
    .insert({
      name: concept.name,
      name_en: concept.name_en || null,
      concept_type: concept.type,
      description: concept.description || null,
      sectors: concept.sectors,
      metadata: {},
    })
    .select("id")
    .single();

  if (error) {
    // Handle race condition on unique constraint
    if (error.code === "23505") {
      const { data: retry } = await from("kg_concepts")
        .select("id")
        .eq("concept_type", concept.type)
        .ilike("name", concept.name)
        .single();
      if (retry) {
        conceptCache.set(key, retry.id);
        return retry.id;
      }
    }
    console.error(`  ⚠ Failed to insert concept "${concept.name}": ${error.message}`);
    return null;
  }

  conceptCache.set(key, data.id);
  return data.id;
}

// ─── Store extraction results ───────────────────────────────────────────────

async function storeResults(
  chunkId: string,
  documentId: string,
  result: ExtractionResult
): Promise<{ concepts: number; relationships: number; rules: number }> {
  let conceptCount = 0;
  let relCount = 0;
  let ruleCount = 0;

  // 1. Upsert concepts + link to chunk
  const conceptIdMap = new Map<string, string>(); // name → id

  for (const c of result.concepts) {
    const id = await upsertConcept(c);
    if (id) {
      conceptIdMap.set(c.name.toLowerCase(), id);
      conceptCount++;

      // Link chunk → concept (ignore conflict)
      await from("kg_chunk_concepts")
        .upsert({ chunk_id: chunkId, concept_id: id, relevance: 1.0 }, { onConflict: "chunk_id,concept_id" });
    }
  }

  // 2. Insert relationships
  for (const r of result.relationships) {
    const sourceId = conceptIdMap.get(r.source.toLowerCase());
    const targetId = conceptIdMap.get(r.target.toLowerCase());
    if (!sourceId || !targetId) continue;

    const { error } = await from("kg_relationships")
      .upsert({
        source_concept_id: sourceId,
        target_concept_id: targetId,
        relationship_type: r.type,
        evidence: r.evidence || null,
        source_chunk_id: chunkId,
        weight: 1.0,
      }, { onConflict: "source_concept_id,target_concept_id,relationship_type" });

    if (!error) relCount++;
  }

  // 3. Insert rules
  for (const rule of result.rules) {
    const { data: ruleData, error } = await from("kg_rules")
      .insert({
        name: rule.name,
        description: rule.description,
        rule_type: rule.type,
        sectors: rule.sectors,
        condition: rule.condition,
        consequence: rule.consequence,
        priority: 100,
        source_document_id: documentId,
        active: true,
      })
      .select("id")
      .single();

    if (error) continue;
    ruleCount++;

    // Link rule to relevant concepts
    if (rule.consequence && typeof rule.consequence === "object") {
      const targetName = (rule.consequence as { target_concept?: string }).target_concept;
      if (targetName) {
        const targetId = conceptIdMap.get(targetName.toLowerCase());
        if (targetId && ruleData) {
          await from("kg_rule_concepts")
            .upsert({ rule_id: ruleData.id, concept_id: targetId, role: "output" }, { onConflict: "rule_id,concept_id,role" });
        }
      }
    }
  }

  return { concepts: conceptCount, relationships: relCount, rules: ruleCount };
}

// ─── Embed all concepts ─────────────────────────────────────────────────────

async function embedAllConcepts(): Promise<number> {
  const { data: concepts } = await from("kg_concepts")
    .select("id, name, name_en, description")
    .is("embedding", null);

  if (!concepts || concepts.length === 0) return 0;

  console.log(`\n🔗 Embedding ${concepts.length} concepts...`);

  const BATCH = 128;
  let embedded = 0;

  for (let i = 0; i < concepts.length; i += BATCH) {
    const batch = concepts.slice(i, i + BATCH);
    const texts = batch.map((c: { name: string; name_en?: string; description?: string }) =>
      `${c.name}${c.name_en ? " (" + c.name_en + ")" : ""}${c.description ? ": " + c.description : ""}`
    );

    const embeddings = await embedTexts(texts);

    for (let j = 0; j < batch.length; j++) {
      await from("kg_concepts")
        .update({ embedding: JSON.stringify(embeddings[j]) })
        .eq("id", batch[j].id);
    }

    embedded += batch.length;
    console.log(`   Embedded ${embedded}/${concepts.length}`);
  }

  return embedded;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧠 Knowledge Graph Extraction Pipeline");
  console.log(`   Model: ${MODEL}`);
  console.log(`   Batch: ${BATCH_SIZE}, Concurrency: ${CONCURRENCY}`);

  // Get chunks to process
  let query = from("rag_chunks")
    .select("id, content, document_id, metadata")
    .order("created_at", { ascending: true });

  if (!force) {
    // Skip chunks already processed (have entries in kg_chunk_concepts)
    // We use a simple approach: check if chunk_id exists in kg_chunk_concepts
    const { data: processed } = await from("kg_chunk_concepts")
      .select("chunk_id");
    const processedIds = new Set((processed || []).map((r: { chunk_id: string }) => r.chunk_id));

    if (processedIds.size > 0 && !force) {
      console.log(`   Already processed: ${processedIds.size} chunks`);
    }
  }

  if (offset > 0) query = query.range(offset, offset + (limit || 99999));
  else if (limit > 0) query = query.limit(limit);

  const { data: chunks, error } = await query;
  if (error) throw new Error(`Failed to fetch chunks: ${error.message}`);
  if (!chunks || chunks.length === 0) {
    console.log("No chunks to process.");
    return;
  }

  // Filter already processed
  let chunksToProcess: ChunkRow[] = chunks;
  if (!force) {
    const { data: processed } = await from("kg_chunk_concepts").select("chunk_id");
    const processedIds = new Set((processed || []).map((r: { chunk_id: string }) => r.chunk_id));
    chunksToProcess = chunks.filter((c: ChunkRow) => !processedIds.has(c.id));
  }

  console.log(`\nProcessing ${chunksToProcess.length} chunks (of ${chunks.length} total)\n`);

  let totalConcepts = 0;
  let totalRels = 0;
  let totalRules = 0;
  let processed = 0;
  let failures = 0;

  // Process in batches
  for (let i = 0; i < chunksToProcess.length; i += BATCH_SIZE) {
    const batch = chunksToProcess.slice(i, i + BATCH_SIZE);

    // Extract in parallel (limited concurrency)
    const results = await Promise.all(
      batch.map((chunk) => extractFromChunk(chunk))
    );

    // Store results sequentially (to avoid race conditions on upserts)
    for (let j = 0; j < batch.length; j++) {
      const result = results[j];
      if (!result) {
        failures++;
        continue;
      }

      const counts = await storeResults(batch[j].id, batch[j].document_id, result);
      totalConcepts += counts.concepts;
      totalRels += counts.relationships;
      totalRules += counts.rules;
      processed++;
    }

    console.log(
      `   Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${processed} processed, ` +
      `${totalConcepts} concepts, ${totalRels} relationships, ${totalRules} rules`
    );

    // Small pause between batches
    if (i + BATCH_SIZE < chunksToProcess.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Embed all new concepts
  const embedded = await embedAllConcepts();

  console.log(`\n📊 Summary:`);
  console.log(`   Chunks processed: ${processed} (${failures} failures)`);
  console.log(`   Concepts: ${totalConcepts} (${conceptCache.size} unique)`);
  console.log(`   Relationships: ${totalRels}`);
  console.log(`   Rules: ${totalRules}`);
  console.log(`   Embeddings: ${embedded} new concepts embedded`);

  // Stats
  const { count: conceptCount } = await from("kg_concepts").select("id", { count: "exact" });
  const { count: relCount } = await from("kg_relationships").select("id", { count: "exact" });
  const { count: ruleCount } = await from("kg_rules").select("id", { count: "exact" });
  console.log(`\n🗄️  Database totals:`);
  console.log(`   kg_concepts: ${conceptCount}`);
  console.log(`   kg_relationships: ${relCount}`);
  console.log(`   kg_rules: ${ruleCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
