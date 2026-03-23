-- RAG Conversations v2 — Extended thinking + model tracking + summary
-- Adds model preference, thinking visibility, and auto-summary

-- Add columns to rag_conversations
ALTER TABLE rag_conversations
  ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'sonnet',
  ADD COLUMN IF NOT EXISTS thinking_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- Separate messages table for better querying and less bloat
CREATE TABLE IF NOT EXISTS rag_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES rag_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  thinking TEXT,
  sources JSONB,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX rag_messages_conversation_idx ON rag_messages (conversation_id, created_at);

-- RLS for messages
ALTER TABLE rag_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their messages" ON rag_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rag_conversations c
      WHERE c.id = rag_messages.conversation_id
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rag_conversations c
      WHERE c.id = rag_messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage rag_messages" ON rag_messages
  FOR ALL USING (true) WITH CHECK (true);
