import Anthropic from "@anthropic-ai/sdk";
import { multiQueryHybridSearch, type SearchFilters, type RetrievedChunk, type HybridSearchResult } from "./retrieval";
import {
  SYSTEM_PROMPT, buildContextPrompt, buildSourcesList,
  buildGraphContext, buildRulesContext,
} from "./prompts";
import { expandQuery } from "./query-expansion";
import { compressHistory, extractConversationContext } from "./summarize";
import { evaluateRules, type RuleEvaluationResult } from "./rules";
import type { MatchedConcept, GraphRelationship } from "./graph";

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
  graphConcepts: MatchedConcept[];
  graphRelationships: GraphRelationship[];
  ruleEvaluation: RuleEvaluationResult;
}

/**
 * Generate a streaming response with:
 * - Multi-query expansion (Haiku)
 * - Auto-summary of long conversations
 * - Knowledge Graph traversal (parallel with search)
 * - Rules engine evaluation
 * - Extended thinking
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

  // Step 1: Multi-query expansion + conversation compression (parallel)
  const conversationContext = extractConversationContext(conversationHistory);

  const [expandedQueries, compressedResult] = await Promise.all([
    expandQuery(query, conversationContext),
    compressHistory(conversationHistory),
  ]);

  // Step 2: Multi-query hybrid search + graph traversal (graph runs in parallel inside)
  const searchResult: HybridSearchResult = await multiQueryHybridSearch(
    expandedQueries, filters, topK
  );

  const { chunks, graphData } = searchResult;

  // Step 3: Evaluate rules based on matched concepts
  const conceptIds = graphData.concepts.map((c) => c.id);
  const detectedSector = filters.sectors?.[0]; // primary sector filter
  const ruleEvaluation = await evaluateRules(conceptIds, detectedSector);

  // Step 4: Build messages with compressed history + graph + rules context
  const contextPrompt = buildContextPrompt(chunks);
  const graphContext = buildGraphContext(graphData.concepts, graphData.relationships);
  const rulesContext = buildRulesContext(
    ruleEvaluation.rules, ruleEvaluation.conflicts, ruleEvaluation.chains
  );

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const msg of compressedResult.messages) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Combine all context sections
  const contextSections = [contextPrompt, graphContext, rulesContext]
    .filter(Boolean)
    .join("\n\n");

  const userMessage = chunks.length > 0 || graphData.concepts.length > 0
    ? `${contextSections}\n\n## Pytanie\n\n${query}`
    : `Nie znaleziono pasujących fragmentów w bazie wiedzy. Odpowiedz na pytanie na podstawie swojej ogólnej wiedzy, zaznaczając że odpowiedź nie jest oparta na dokumentach Certo.\n\n## Pytanie\n\n${query}`;

  messages.push({ role: "user", content: userMessage });

  const client = getClient();
  const selectedModel = MODELS[model];
  const maxTokens = MAX_TOKENS[model];

  const baseParams = {
    model: selectedModel,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages,
  };

  const thinkingConfig = thinking
    ? { thinking: { type: "enabled" as const, budget_tokens: THINKING_BUDGET[model] } }
    : {};

  const stream = client.messages.stream({
    ...baseParams,
    ...thinkingConfig,
  });

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
    graphConcepts: graphData.concepts,
    graphRelationships: graphData.relationships,
    ruleEvaluation,
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
