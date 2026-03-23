-- RAG Knowledge Base — Supabase Migration
-- Adds pgvector support and tables for the Certo Methodology RAG Agent

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Source documents registry
CREATE TABLE IF NOT EXISTS rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('internal', 'regulation', 'oecd', 'who', 'worldbank', 'academic', 'other')),
  sector TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'pl',
  file_path TEXT,
  file_hash TEXT,
  confidential BOOLEAN DEFAULT false,
  version TEXT,
  metadata JSONB DEFAULT '{}',
  ingested_at TIMESTAMPTZ DEFAULT now()
);

-- Chunks with embeddings
CREATE TABLE IF NOT EXISTS rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  embedding vector(1024),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search column (Polish dictionary)
ALTER TABLE rag_chunks ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED;

-- HNSW index for vector similarity search
CREATE INDEX rag_chunks_embedding_idx ON rag_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- GIN index for full-text search
CREATE INDEX rag_chunks_fts_idx ON rag_chunks USING gin (fts);

-- Index for document lookups
CREATE INDEX rag_chunks_document_id_idx ON rag_chunks (document_id);

-- Index for dedup by file hash
CREATE UNIQUE INDEX rag_documents_file_hash_idx ON rag_documents (file_hash) WHERE file_hash IS NOT NULL;

-- Conversation history
CREATE TABLE IF NOT EXISTS rag_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER rag_conversations_updated_at
  BEFORE UPDATE ON rag_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_conversations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read non-confidential documents and chunks
CREATE POLICY "Authenticated can read rag_documents" ON rag_documents
  FOR SELECT TO authenticated
  USING (confidential = false);

CREATE POLICY "Authenticated can read rag_chunks" ON rag_chunks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rag_documents d
      WHERE d.id = rag_chunks.document_id
      AND d.confidential = false
    )
  );

-- Service role has full access (for ingestion pipeline)
CREATE POLICY "Service role can manage rag_documents" ON rag_documents
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage rag_chunks" ON rag_chunks
  FOR ALL USING (true) WITH CHECK (true);

-- Users can only access their own conversations
CREATE POLICY "Users own their conversations" ON rag_conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role can manage conversations
CREATE POLICY "Service role can manage conversations" ON rag_conversations
  FOR ALL USING (true) WITH CHECK (true);

-- Helper function: semantic search
CREATE OR REPLACE FUNCTION match_rag_chunks(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20,
  filter_sectors text[] DEFAULT NULL,
  filter_source_types text[] DEFAULT NULL,
  filter_confidential boolean DEFAULT false
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INTEGER,
  content TEXT,
  token_count INTEGER,
  metadata JSONB,
  similarity float,
  doc_title TEXT,
  doc_source_type TEXT,
  doc_sector TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.token_count,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity,
    d.title AS doc_title,
    d.source_type AS doc_source_type,
    d.sector AS doc_sector
  FROM rag_chunks c
  JOIN rag_documents d ON d.id = c.document_id
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
    AND (filter_confidential = true OR d.confidential = false)
    AND (filter_sectors IS NULL OR d.sector && filter_sectors)
    AND (filter_source_types IS NULL OR d.source_type = ANY(filter_source_types))
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Helper function: full-text search
CREATE OR REPLACE FUNCTION search_rag_chunks(
  query_text text,
  match_count int DEFAULT 20,
  filter_sectors text[] DEFAULT NULL,
  filter_source_types text[] DEFAULT NULL,
  filter_confidential boolean DEFAULT false
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INTEGER,
  content TEXT,
  token_count INTEGER,
  metadata JSONB,
  rank float,
  doc_title TEXT,
  doc_source_type TEXT,
  doc_sector TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.token_count,
    c.metadata,
    ts_rank(c.fts, plainto_tsquery('simple', query_text)) AS rank,
    d.title AS doc_title,
    d.source_type AS doc_source_type,
    d.sector AS doc_sector
  FROM rag_chunks c
  JOIN rag_documents d ON d.id = c.document_id
  WHERE c.fts @@ plainto_tsquery('simple', query_text)
    AND (filter_confidential = true OR d.confidential = false)
    AND (filter_sectors IS NULL OR d.sector && filter_sectors)
    AND (filter_source_types IS NULL OR d.source_type = ANY(filter_source_types))
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
