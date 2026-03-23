-- Knowledge Graph + Rules Engine for Certo RAG Agent
-- Adds concept graph, relationships, and formalized governance rules

-- ═══════════════════════════════════════════════════════════════
-- 1. KNOWLEDGE GRAPH — NODES (Concepts)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kg_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  concept_type TEXT NOT NULL CHECK (concept_type IN (
    'principle',       -- zasada governance (np. "transparentność")
    'requirement',     -- wymóg regulacyjny (np. "wyznaczenie DPO")
    'indicator',       -- wskaźnik oceny (np. "wskaźnik jawności")
    'regulation',      -- regulacja / norma (np. "GDPR", "KSH")
    'process',         -- proces (np. "zarządzanie ryzykiem")
    'role',            -- rola (np. "DPO", "audytor wewnętrzny")
    'standard',        -- standard (np. "ISO 27001")
    'risk_category'    -- kategoria ryzyka (np. "ryzyko operacyjne")
  )),
  description TEXT,
  sectors TEXT[] DEFAULT '{}',
  embedding vector(1024),
  aliases TEXT[] DEFAULT '{}',  -- alternatywne nazwy / synonimy
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate concepts (same name + type)
CREATE UNIQUE INDEX kg_concepts_name_type_idx
  ON kg_concepts (lower(name), concept_type);

-- Semantic concept search via embeddings
CREATE INDEX kg_concepts_embedding_idx ON kg_concepts
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Sector filter
CREATE INDEX kg_concepts_sectors_idx ON kg_concepts USING gin (sectors);

-- Full-text search on concept names/aliases
ALTER TABLE kg_concepts ADD COLUMN name_fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(name_en, '') || ' ' || array_to_string(aliases, ' '))
  ) STORED;
CREATE INDEX kg_concepts_name_fts_idx ON kg_concepts USING gin (name_fts);

-- ═══════════════════════════════════════════════════════════════
-- 2. KNOWLEDGE GRAPH — EDGES (Relationships)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kg_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_concept_id UUID NOT NULL REFERENCES kg_concepts(id) ON DELETE CASCADE,
  target_concept_id UUID NOT NULL REFERENCES kg_concepts(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'requires',      -- A wymaga B
    'contradicts',   -- A jest sprzeczne z B
    'supersedes',    -- A zastępuje B
    'refines',       -- A uszczegóławia B
    'references',    -- A odwołuje się do B
    'part_of',       -- A jest częścią B
    'measured_by',   -- A jest mierzone przez B
    'implements'     -- A implementuje B
  )),
  sector_scope TEXT[],       -- NULL = universal, else sector-specific
  weight FLOAT DEFAULT 1.0,  -- edge strength (0.0–2.0)
  evidence TEXT,              -- cytowany fragment uzasadniający relację
  source_chunk_id UUID REFERENCES rag_chunks(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_concept_id, target_concept_id, relationship_type)
);

CREATE INDEX kg_rel_source_idx ON kg_relationships (source_concept_id);
CREATE INDEX kg_rel_target_idx ON kg_relationships (target_concept_id);
CREATE INDEX kg_rel_type_idx ON kg_relationships (relationship_type);

-- ═══════════════════════════════════════════════════════════════
-- 3. CHUNK ↔ CONCEPT BRIDGE (many-to-many)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kg_chunk_concepts (
  chunk_id UUID NOT NULL REFERENCES rag_chunks(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES kg_concepts(id) ON DELETE CASCADE,
  relevance FLOAT DEFAULT 1.0,
  extracted_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (chunk_id, concept_id)
);

CREATE INDEX kg_cc_concept_idx ON kg_chunk_concepts (concept_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. RULES ENGINE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kg_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'requirement',      -- A wymaga B
    'prohibition',      -- A zabrania B
    'conditional',      -- jeśli A to B (warunkowo)
    'scoring_weight',   -- waga wskaźnika
    'chain'             -- łańcuch wymagań A→B→C
  )),
  sectors TEXT[] NOT NULL DEFAULT '{}',
  condition JSONB NOT NULL,
  consequence JSONB NOT NULL,
  priority INTEGER DEFAULT 100,
  source_document_id UUID REFERENCES rag_documents(id) ON DELETE SET NULL,
  source_regulation TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX kg_rules_sectors_idx ON kg_rules USING gin (sectors);
CREATE INDEX kg_rules_type_idx ON kg_rules (rule_type) WHERE active = true;

-- Rule ↔ Concept bridge
CREATE TABLE IF NOT EXISTS kg_rule_concepts (
  rule_id UUID NOT NULL REFERENCES kg_rules(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES kg_concepts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('trigger', 'subject', 'output')),
  PRIMARY KEY (rule_id, concept_id, role)
);

CREATE INDEX kg_rc_concept_idx ON kg_rule_concepts (concept_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE kg_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_chunk_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_rule_concepts ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated can read kg_concepts" ON kg_concepts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read kg_relationships" ON kg_relationships
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read kg_chunk_concepts" ON kg_chunk_concepts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read kg_rules" ON kg_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read kg_rule_concepts" ON kg_rule_concepts
  FOR SELECT TO authenticated USING (true);

-- Service role has full access (for extraction pipeline)
CREATE POLICY "Service manages kg_concepts" ON kg_concepts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manages kg_relationships" ON kg_relationships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manages kg_chunk_concepts" ON kg_chunk_concepts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manages kg_rules" ON kg_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manages kg_rule_concepts" ON kg_rule_concepts FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 6. GRAPH TRAVERSAL FUNCTION (Recursive CTE)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION traverse_concepts(
  start_concept_id UUID,
  max_depth INT DEFAULT 2,
  filter_sectors TEXT[] DEFAULT NULL,
  filter_rel_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  concept_id UUID,
  concept_name TEXT,
  concept_type TEXT,
  depth INT,
  path_weight FLOAT,
  relationship_type TEXT,
  via_concept_id UUID
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE traversal AS (
    -- Base: direct neighbors of start concept
    SELECT
      r.target_concept_id AS cid,
      c.name AS cname,
      c.concept_type AS ctype,
      1 AS d,
      r.weight AS pw,
      r.relationship_type AS rtype,
      r.source_concept_id AS via_cid
    FROM kg_relationships r
    JOIN kg_concepts c ON c.id = r.target_concept_id
    WHERE r.source_concept_id = start_concept_id
      AND (filter_sectors IS NULL OR c.sectors && filter_sectors)
      AND (filter_rel_types IS NULL OR r.relationship_type = ANY(filter_rel_types))

    UNION ALL

    -- Recursive: neighbors of neighbors
    SELECT
      r.target_concept_id,
      c.name,
      c.concept_type,
      t.d + 1,
      t.pw * r.weight * 0.7,  -- decay factor per hop
      r.relationship_type,
      r.source_concept_id
    FROM traversal t
    JOIN kg_relationships r ON r.source_concept_id = t.cid
    JOIN kg_concepts c ON c.id = r.target_concept_id
    WHERE t.d < max_depth
      AND r.target_concept_id != start_concept_id  -- avoid cycles
      AND (filter_sectors IS NULL OR c.sectors && filter_sectors)
      AND (filter_rel_types IS NULL OR r.relationship_type = ANY(filter_rel_types))
  )
  SELECT DISTINCT ON (traversal.cid)
    traversal.cid,
    traversal.cname,
    traversal.ctype,
    traversal.d,
    traversal.pw,
    traversal.rtype,
    traversal.via_cid
  FROM traversal
  ORDER BY traversal.cid, traversal.pw DESC;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7. SEMANTIC CONCEPT LOOKUP FUNCTION
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_concepts_by_embedding(
  query_embedding vector(1024),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5,
  filter_sectors TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  concept_id UUID,
  concept_name TEXT,
  concept_type TEXT,
  sectors TEXT[],
  description TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.concept_type,
    c.sectors,
    c.description,
    1 - (c.embedding <=> query_embedding) AS sim
  FROM kg_concepts c
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
    AND (filter_sectors IS NULL OR c.sectors && filter_sectors)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
