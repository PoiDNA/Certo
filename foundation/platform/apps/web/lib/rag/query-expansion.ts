import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic();
  return _client;
}

/**
 * Multi-query expansion: generates 3 variant queries from the original
 * to improve retrieval recall across different phrasings and angles.
 *
 * Uses Haiku for speed and cost efficiency.
 */
export async function expandQuery(
  originalQuery: string,
  conversationContext?: string
): Promise<string[]> {
  const client = getClient();

  const contextHint = conversationContext
    ? `\nKontekst rozmowy (ostatnie tematy): ${conversationContext}`
    : "";

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: `Jesteś asystentem wyszukiwania. Twoim zadaniem jest wygenerowanie 3 wariantów zapytania użytkownika, które pomogą znaleźć różne istotne fragmenty w bazie wiedzy o governance, zarządzaniu i regulacjach.

Zasady:
- Wariant 1: Przeformułuj pytanie używając synonimów i alternatywnych terminów
- Wariant 2: Rozszerz pytanie o powiązane aspekty (np. jeśli pytanie o JST → dodaj "samorząd terytorialny, gmina, powiat")
- Wariant 3: Zawęź pytanie do konkretnych regulacji/norm jeśli to możliwe

Odpowiedz WYŁĄCZNIE w formacie JSON array z 3 stringami. Bez komentarzy.
Przykład: ["wariant 1", "wariant 2", "wariant 3"]`,
      messages: [
        {
          role: "user",
          content: `Pytanie oryginalne: ${originalQuery}${contextHint}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON array
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [originalQuery];

    const variants = JSON.parse(match[0]) as string[];
    if (!Array.isArray(variants) || variants.length === 0) return [originalQuery];

    // Return original + variants (deduplicated)
    return [originalQuery, ...variants.slice(0, 3)];
  } catch (err) {
    console.error("Query expansion failed, using original:", err);
    return [originalQuery];
  }
}
