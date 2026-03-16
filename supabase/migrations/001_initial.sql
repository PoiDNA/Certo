-- Certo Governance Pipeline — Supabase Schema
-- Run: supabase db push

-- Documents registry
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  entity TEXT NOT NULL CHECK (entity IN ('foundation', 'company')),
  category TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'FROZEN')),
  markdown_path TEXT NOT NULL,
  docx_url TEXT,
  pdf_url TEXT,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Review history
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  pr_number INTEGER,
  reviewer TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'CHANGES_REQUESTED')),
  score NUMERIC(3,1),
  comments JSONB DEFAULT '[]',
  cross_doc_issues JSONB DEFAULT '[]',
  iteration INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline runs
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number INTEGER NOT NULL,
  branch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'REVIEWING', 'APPROVED', 'FAILED', 'ESCALATED')),
  phase TEXT NOT NULL CHECK (phase IN ('doc', 'code')),
  target_path TEXT,
  iterations INTEGER DEFAULT 0,
  max_iterations INTEGER DEFAULT 5,
  claude_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  gemini_model TEXT DEFAULT 'gemini-2.5-pro',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Seed documents
INSERT INTO documents (slug, title, entity, category, version, status, markdown_path) VALUES
  ('normy-zewnetrzne', 'Normy Zewnętrzne v2.1+', 'foundation', 'governance', '2.1', 'APPROVED', 'foundation/governance/normy-zewnetrzne/README.md'),
  ('policy-registry', 'Policy Registry (Deliverable A) v2.0', 'foundation', 'governance', '2.0', 'APPROVED', 'foundation/governance/policy-registry/README.md'),
  ('deliverable-b', 'Specyfikacja Techniczna Compliance Engine v2.0', 'company', 'technical', '2.0', 'APPROVED', 'company/technical/deliverable-b/README.md'),
  ('deliverable-c', 'Diagramy Procesów z Bramkami Normowymi v1.0', 'company', 'technical', '1.0', 'APPROVED', 'company/technical/deliverable-c/README.md'),
  ('statut', 'Statut Fundacji Certo Governance Institute v17', 'foundation', 'frozen', '17', 'FROZEN', 'foundation/frozen/statut/README.md')
ON CONFLICT (slug) DO NOTHING;

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Public read for documents
CREATE POLICY "Documents are publicly readable" ON documents FOR SELECT USING (true);
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Pipeline runs are publicly readable" ON pipeline_runs FOR SELECT USING (true);

-- Service role can write
CREATE POLICY "Service role can insert documents" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update documents" ON documents FOR UPDATE USING (true);
CREATE POLICY "Service role can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert pipeline_runs" ON pipeline_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update pipeline_runs" ON pipeline_runs FOR UPDATE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
