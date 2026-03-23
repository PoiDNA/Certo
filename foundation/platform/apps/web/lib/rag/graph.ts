/**
 * Knowledge Graph — Graph-enhanced retrieval for Certo RAG
 *
 * Provides concept matching, graph traversal, and chunk lookup
 * as a parallel retrieval track alongside semantic + keyword search.
 */

import { getServiceSupabase } from "./supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MatchedConcept {
  id: string;
  name: string;
  conceptType: string;
  sectors: string[];
  description?: string;
  similarity: number;
}

export interface GraphRelationship {
  sourceConceptId: string;
  sourceConceptName: string;
  targetConceptId: string;
  targetConceptName: string;
  relationshipType: string;
  weight: number;
}

export interface GraphChunk {
  chunkId: string;
  conceptId: string;
  conceptName: string;
  relevance: number;
}

export interface GraphSearchResult {
  concepts: MatchedConcept[];
  relationships: GraphRelationship[];
  chunkIds: Array<{ id: string; score: number }>;
}

// ─── Graph operations ───────────────────────────────────────────────────────

/**
 * Check if the knowledge graph has been populated.
 * Returns false if kg_concepts is empty → skip graph search.
 */
let _graphPopulated: boolean | null = null;

async function isGraphPopulated(): Promise<boolean> {
  if (_graphPopulated !== null) return _graphPopulated;

  try {
    const sb = getServiceSupabase();
    const { count } = await (sb.from("kg_concepts") as any)
      .select("id", { count: "exact", head: true });
    _graphPopulated = (count || 0) > 0;
  } catch {
    _graphPopulated = false;
  }
  return _graphPopulated;
}

/**
 * Find concepts matching the query embedding (semantic lookup).
 */
async function matchConcepts(
  queryEmbedding: number[],
  sectors?: string[],
  topK: number = 5
): Promise<MatchedConcept[]> {
  const sb = getServiceSupabase();

  const { data, error } = await (sb.rpc as any)("find_concepts_by_embedding", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.4,
    match_count: topK,
    filter_sectors: sectors || null,
  });

  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: r.concept_id,
    name: r.concept_name,
    conceptType: r.concept_type,
    sectors: r.sectors || [],
    description: r.description,
    similarity: r.similarity,
  }));
}

/**
 * Traverse graph from matched concepts, collecting related concepts.
 */
async function traverseFromConcepts(
  conceptIds: string[],
  sectors?: string[],
  depth: number = 2
): Promise<{
  relatedConceptIds: string[];
  relationships: GraphRelationship[];
}> {
  const sb = getServiceSupabase();
  const allRelated: string[] = [];
  const allRelationships: GraphRelationship[] = [];

  // Traverse from each matched concept
  for (const conceptId of conceptIds) {
    const { data } = await (sb.rpc as any)("traverse_concepts", {
      start_concept_id: conceptId,
      max_depth: depth,
      filter_sectors: sectors || null,
      filter_rel_types: null,
    });

    if (!data) continue;

    for (const r of data as any[]) {
      if (!allRelated.includes(r.concept_id)) {
        allRelated.push(r.concept_id);
      }
      allRelationships.push({
        sourceConceptId: r.via_concept_id,
        sourceConceptName: "", // filled later if needed
        targetConceptId: r.concept_id,
        targetConceptName: r.concept_name,
        relationshipType: r.relationship_type,
        weight: r.path_weight,
      });
    }
  }

  return { relatedConceptIds: allRelated, relationships: allRelationships };
}

/**
 * Get chunk IDs linked to a set of concepts.
 */
async function getChunksForConcepts(
  conceptIds: string[]
): Promise<Array<{ id: string; score: number }>> {
  if (conceptIds.length === 0) return [];

  const sb = getServiceSupabase();

  const { data } = await (sb.from("kg_chunk_concepts") as any)
    .select("chunk_id, relevance")
    .in("concept_id", conceptIds);

  if (!data) return [];

  // Deduplicate and aggregate scores
  const chunkScores = new Map<string, number>();
  for (const r of data) {
    const current = chunkScores.get(r.chunk_id) || 0;
    chunkScores.set(r.chunk_id, current + (r.relevance || 1.0));
  }

  return [...chunkScores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30); // cap at 30
}

// ─── Main graph search function ─────────────────────────────────────────────

/**
 * Full graph-enhanced search pipeline:
 * 1. Match concepts by query embedding
 * 2. Traverse graph to find related concepts
 * 3. Look up chunks linked to all concepts
 *
 * Returns chunk IDs with graph-derived scores, plus concept/relationship metadata.
 */
export async function graphExpandedSearch(
  queryEmbedding: number[],
  sectors?: string[]
): Promise<GraphSearchResult> {
  // Graceful degradation: if graph is empty, return nothing
  if (!(await isGraphPopulated())) {
    return { concepts: [], relationships: [], chunkIds: [] };
  }

  // Step 1: Find matching concepts
  const concepts = await matchConcepts(queryEmbedding, sectors, 5);
  if (concepts.length === 0) {
    return { concepts: [], relationships: [], chunkIds: [] };
  }

  // Step 2: Traverse graph
  const conceptIds = concepts.map((c) => c.id);
  const { relatedConceptIds, relationships } = await traverseFromConcepts(
    conceptIds,
    sectors,
    2
  );

  // Step 3: Get chunks for matched + related concepts
  const allConceptIds = [...new Set([...conceptIds, ...relatedConceptIds])];
  const chunkIds = await getChunksForConcepts(allConceptIds);

  return { concepts, relationships, chunkIds };
}

/**
 * Get rules associated with a set of concepts.
 */
export async function getRulesForConcepts(
  conceptIds: string[],
  sector?: string
): Promise<any[]> {
  if (conceptIds.length === 0) return [];

  const sb = getServiceSupabase();

  // Get rule IDs linked to these concepts
  const { data: links } = await (sb.from("kg_rule_concepts") as any)
    .select("rule_id")
    .in("concept_id", conceptIds);

  if (!links || links.length === 0) return [];

  const ruleIds = [...new Set(links.map((l: { rule_id: string }) => l.rule_id))];

  // Fetch rules
  let query = (sb.from("kg_rules") as any)
    .select("*")
    .in("id", ruleIds)
    .eq("active", true)
    .order("priority", { ascending: false });

  if (sector) {
    query = query.contains("sectors", [sector]);
  }

  const { data: rules } = await query;
  return rules || [];
}
