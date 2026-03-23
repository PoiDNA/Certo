-- RAG Sprint 4 — Shared conversations + tagging

-- Add sharing and tagging columns to conversations
ALTER TABLE rag_conversations
  ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Comments on messages (for Kolegium review)
CREATE TABLE IF NOT EXISTS rag_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES rag_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX rag_comments_message_idx ON rag_comments (message_id);

ALTER TABLE rag_comments ENABLE ROW LEVEL SECURITY;

-- Users can see comments on conversations shared with them or their own
CREATE POLICY "Users can access comments on accessible conversations" ON rag_comments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rag_messages m
      JOIN rag_conversations c ON c.id = m.conversation_id
      WHERE m.id = rag_comments.message_id
      AND (c.user_id = auth.uid() OR c.shared = true OR auth.uid() = ANY(c.shared_with))
    )
  )
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage rag_comments" ON rag_comments
  FOR ALL USING (true) WITH CHECK (true);

-- Update conversations policy to allow shared access
DROP POLICY IF EXISTS "Users own their conversations" ON rag_conversations;

CREATE POLICY "Users access own or shared conversations" ON rag_conversations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR shared = true OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users modify own conversations" ON rag_conversations
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own conversations" ON rag_conversations
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own conversations" ON rag_conversations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Tag index for search
CREATE INDEX rag_conversations_tags_idx ON rag_conversations USING gin (tags);
