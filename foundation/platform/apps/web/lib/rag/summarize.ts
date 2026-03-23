import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "./generate";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic();
  return _client;
}

/**
 * Threshold: when conversation exceeds this many messages,
 * older messages are compressed into a summary.
 */
const SUMMARY_THRESHOLD = 12; // 6 exchanges
const KEEP_RECENT = 6; // keep last 3 exchanges verbatim

/**
 * Auto-summarize older conversation messages.
 * Returns a condensed history that preserves context without token bloat.
 *
 * Strategy:
 * - If history ≤ SUMMARY_THRESHOLD → return as-is
 * - Otherwise → summarize older messages, keep recent ones verbatim
 */
export async function compressHistory(
  history: ChatMessage[]
): Promise<{ messages: ChatMessage[]; summary: string | null }> {
  if (history.length <= SUMMARY_THRESHOLD) {
    return { messages: history, summary: null };
  }

  const olderMessages = history.slice(0, -KEEP_RECENT);
  const recentMessages = history.slice(-KEEP_RECENT);

  const client = getClient();

  try {
    const conversationText = olderMessages
      .map((m) => `${m.role === "user" ? "Użytkownik" : "Agent"}: ${m.content.slice(0, 500)}`)
      .join("\n\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: `Skondensuj poniższą rozmowę do zwięzłego podsumowania (maks. 400 słów) zachowując:
- Kluczowe tematy i pytania użytkownika
- Istotne wnioski i ustalenia agenta
- Nazwy dokumentów, sektorów, regulacji, które się pojawiły
- Terminologię Certo (Rating Certo, Certo Score, etc.)
- Otwarte pytania / kontekst potrzebny do kontynuacji

Pisz w 3. osobie, po polsku. Format: ciągły tekst, bez list.`,
      messages: [
        {
          role: "user",
          content: `Rozmowa do skondensowania (${olderMessages.length} wiadomości):\n\n${conversationText}`,
        },
      ],
    });

    const summary =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Inject summary as a system-context message at the beginning
    const compressedHistory: ChatMessage[] = [
      {
        role: "user",
        content: `[Podsumowanie wcześniejszej rozmowy]\n${summary}`,
      },
      {
        role: "assistant",
        content:
          "Rozumiem kontekst z wcześniejszej rozmowy. Kontynuuję na podstawie powyższego podsumowania.",
      },
      ...recentMessages,
    ];

    return { messages: compressedHistory, summary };
  } catch (err) {
    console.error("Summary generation failed, truncating:", err);
    // Fallback: just keep recent messages
    return { messages: recentMessages, summary: null };
  }
}

/**
 * Extract short context string from recent messages for query expansion
 */
export function extractConversationContext(history: ChatMessage[]): string | undefined {
  if (history.length < 2) return undefined;

  // Last 4 messages → extract key topics
  const recent = history.slice(-4);
  const topics = recent
    .map((m) => m.content.slice(0, 100))
    .join(" | ");

  return topics.slice(0, 300);
}
