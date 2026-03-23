import Anthropic from "@anthropic-ai/sdk";
import { hybridSearch, type SearchFilters, type RetrievedChunk } from "./retrieval";
import { SYSTEM_PROMPT, buildContextPrompt, buildSourcesList } from "./prompts";

const MODEL = "claude-sonnet-4-20250514";

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
}

export interface GenerateResult {
  stream: AsyncIterable<string>;
  sources: RetrievedChunk[];
}

/**
 * Generate a streaming response with RAG context
 */
export async function generateResponse(
  options: GenerateOptions
): Promise<GenerateResult> {
  const { query, conversationHistory = [], filters = {}, topK = 8 } = options;

  // Retrieve relevant chunks
  const chunks = await hybridSearch(query, filters, topK);

  // Build messages
  const contextPrompt = buildContextPrompt(chunks);
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  // Add conversation history (last 6 exchanges max to control context size)
  const recentHistory = conversationHistory.slice(-12);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current query with context
  const userMessage =
    chunks.length > 0
      ? `${contextPrompt}\n\n## Pytanie\n\n${query}`
      : `Nie znaleziono pasujących fragmentów w bazie wiedzy. Odpowiedz na pytanie na podstawie swojej ogólnej wiedzy, zaznaczając że odpowiedź nie jest oparta na dokumentach Certo.\n\n## Pytanie\n\n${query}`;

  messages.push({ role: "user", content: userMessage });

  // Create streaming response
  const client = getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
  });

  // Create async iterable from stream
  async function* textStream(): AsyncIterable<string> {
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }

    // Append sources list at the end
    if (chunks.length > 0) {
      yield "\n\n---\n\n**Źródła:**\n";
      yield buildSourcesList(chunks);
    }
  }

  return {
    stream: textStream(),
    sources: chunks,
  };
}

/**
 * Non-streaming generation (for testing/API)
 */
export async function generateResponseSync(
  options: GenerateOptions
): Promise<{ text: string; sources: RetrievedChunk[] }> {
  const { stream, sources } = await generateResponse(options);

  let text = "";
  for await (const chunk of stream) {
    text += chunk;
  }

  return { text, sources };
}
