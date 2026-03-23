import Anthropic from "@anthropic-ai/sdk";
import { multiQueryHybridSearch, type SearchFilters, type RetrievedChunk } from "./retrieval";
import { SYSTEM_PROMPT, buildContextPrompt, buildSourcesList } from "./prompts";
import { expandQuery } from "./query-expansion";
import { compressHistory, extractConversationContext } from "./summarize";

export type ModelChoice = "sonnet" | "opus";

const MODELS: Record<ModelChoice, string> = {
  sonnet: "claude-sonnet-4-20250514",
  opus: "claude-opus-4-20250514",
};

const THINKING_BUDGET: Record<ModelChoice, number> = {
  sonnet: 8000,
  opus: 16000,
};

const MAX_TOKENS: Record<ModelChoice, number> = {
  sonnet: 12000,
  opus: 20000,
};

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic();
  return _client;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  query: string;
  conversationHistory?: ChatMessage[];
  filters?: SearchFilters;
  topK?: number;
  model?: ModelChoice;
  thinking?: boolean;
}

export interface GenerateResult {
  stream: AsyncIterable<{ type: "text" | "thinking"; content: string }>;
  sources: RetrievedChunk[];
  expandedQueries: string[];
  summarized: boolean;
}

/**
 * Generate a streaming response with:
 * - Multi-query expansion (3 variants via Haiku)
 * - Auto-summary of long conversations
 * - Extended thinking
 * - RAG context from hybrid search
 */
export async function generateResponse(
  options: GenerateOptions
): Promise<GenerateResult> {
  const {
    query,
    conversationHistory = [],
    filters = {},
    topK = 8,
    model = "sonnet",
    thinking = true,
  } = options;

  // Step 1: Multi-query expansion + conversation context extraction (parallel)
  const conversationContext = extractConversationContext(conversationHistory);

  const [expandedQueries, compressedResult] = await Promise.all([
    expandQuery(query, conversationContext),
    compressHistory(conversationHistory),
  ]);

  // Step 2: Multi-query hybrid search with all variants
  const chunks = await multiQueryHybridSearch(expandedQueries, filters, topK);

  // Step 3: Build messages with compressed history
  const contextPrompt = buildContextPrompt(chunks);
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  // Add compressed conversation history
  for (const msg of compressedResult.messages) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current query with context
  const userMessage =
    chunks.length > 0
      ? `${contextPrompt}\n\n## Pytanie\n\n${query}`
      : `Nie znaleziono pasujących fragmentów w bazie wiedzy. Odpowiedz na pytanie na podstawie swojej ogólnej wiedzy, zaznaczając że odpowiedź nie jest oparta na dokumentach Certo.\n\n## Pytanie\n\n${query}`;

  messages.push({ role: "user", content: userMessage });

  const client = getClient();
  const selectedModel = MODELS[model];
  const maxTokens = MAX_TOKENS[model];

  // Build API params
  const baseParams = {
    model: selectedModel,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages,
  };

  // Extended thinking config
  const thinkingConfig = thinking
    ? { thinking: { type: "enabled" as const, budget_tokens: THINKING_BUDGET[model] } }
    : {};

  const stream = client.messages.stream({
    ...baseParams,
    ...thinkingConfig,
  });

  // Create async iterable from stream — yields both thinking and text events
  async function* eventStream(): AsyncIterable<{ type: "text" | "thinking"; content: string }> {
    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        if (event.delta.type === "thinking_delta") {
          yield { type: "thinking", content: event.delta.thinking };
        } else if (event.delta.type === "text_delta") {
          yield { type: "text", content: event.delta.text };
        }
      }
    }

    // Append sources list at the end
    if (chunks.length > 0) {
      yield { type: "text", content: "\n\n---\n\n**Źródła:**\n" };
      yield { type: "text", content: buildSourcesList(chunks) };
    }
  }

  return {
    stream: eventStream(),
    sources: chunks,
    expandedQueries,
    summarized: compressedResult.summary !== null,
  };
}

/**
 * Non-streaming generation (for testing/API)
 */
export async function generateResponseSync(
  options: GenerateOptions
): Promise<{ text: string; thinking: string; sources: RetrievedChunk[] }> {
  const { stream, sources } = await generateResponse(options);

  let text = "";
  let thinking = "";
  for await (const event of stream) {
    if (event.type === "text") text += event.content;
    if (event.type === "thinking") thinking += event.content;
  }

  return { text, thinking, sources };
}
