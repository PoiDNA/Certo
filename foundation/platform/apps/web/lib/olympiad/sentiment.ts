/**
 * Sentiment analysis for Olimpiada Certo open-text fields.
 *
 * Strategy: self-hosted LLM for privacy (GDPR compliance).
 * Primary: local model via Ollama/vLLM endpoint (zero data leaves infrastructure).
 * Fallback: Anthropic API with DPA + Zero Data Retention.
 *
 * Use cases:
 * - Extract sentiment from survey open-text fields
 * - Strip PII before storing text
 * - Categorize feedback themes
 */

interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  confidence: number;
  themes: string[];
  pii_detected: boolean;
  sanitized_text: string | null; // PII-stripped version (null if no open text)
  source: "local" | "anthropic" | "fallback";
}

/**
 * Analyze sentiment of open-text survey responses.
 * Tries local LLM first, falls back to Anthropic, then to simple heuristic.
 */
export async function analyzeSentiment(
  text: string,
  locale: string = "pl"
): Promise<SentimentResult> {
  if (!text || text.trim().length < 5) {
    return {
      sentiment: "neutral",
      confidence: 0,
      themes: [],
      pii_detected: false,
      sanitized_text: null,
      source: "fallback",
    };
  }

  // 1. Try local LLM (Ollama/vLLM)
  const localResult = await tryLocalLLM(text, locale);
  if (localResult) return localResult;

  // 2. Try Anthropic API (with DPA + ZDR)
  const anthropicResult = await tryAnthropicSentiment(text, locale);
  if (anthropicResult) return anthropicResult;

  // 3. Fallback: simple keyword heuristic
  return keywordSentiment(text, locale);
}

/**
 * Local LLM via Ollama or vLLM endpoint.
 * Environment: LLM_LOCAL_ENDPOINT (e.g. http://localhost:11434/api/generate)
 */
async function tryLocalLLM(
  text: string,
  locale: string
): Promise<SentimentResult | null> {
  const endpoint = process.env.LLM_LOCAL_ENDPOINT;
  if (!endpoint) return null;

  const model = process.env.LLM_LOCAL_MODEL || "llama3.2:3b";

  try {
    const prompt = `Analyze this ${locale === "pl" ? "Polish" : "English"} text from a school governance survey.

Text: "${text}"

Respond ONLY with JSON:
{"sentiment":"positive|neutral|negative|mixed","confidence":0.0-1.0,"themes":["theme1","theme2"],"pii_detected":true|false,"sanitized_text":"text with [REDACTED] replacing any names/emails/phone numbers"}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.1, num_predict: 300 },
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!res.ok) return null;

    const data = await res.json();
    const responseText = data.response || data.choices?.[0]?.text || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      sentiment: parsed.sentiment || "neutral",
      confidence: parsed.confidence || 0.5,
      themes: parsed.themes || [],
      pii_detected: parsed.pii_detected || false,
      sanitized_text: parsed.sanitized_text || null,
      source: "local",
    };
  } catch {
    return null;
  }
}

/**
 * Anthropic API fallback (requires DPA + Zero Data Retention).
 */
async function tryAnthropicSentiment(
  text: string,
  locale: string
): Promise<SentimentResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Analyze sentiment of this ${locale === "pl" ? "Polish" : "English"} survey response about school governance. Respond ONLY with JSON: {"sentiment":"positive|neutral|negative|mixed","confidence":0.0-1.0,"themes":["theme1"],"pii_detected":true|false,"sanitized_text":"text with [REDACTED] for PII"}

Text: "${text.slice(0, 500)}"`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      source: "anthropic" as const,
    };
  } catch {
    return null;
  }
}

/**
 * Simple keyword-based sentiment as last resort.
 */
function keywordSentiment(text: string, locale: string): SentimentResult {
  const lower = text.toLowerCase();

  const positiveWords =
    locale === "pl"
      ? ["dobrze", "świetnie", "super", "polecam", "zadowolony", "dziękuję", "ok"]
      : ["good", "great", "excellent", "recommend", "satisfied", "thank", "ok"];

  const negativeWords =
    locale === "pl"
      ? ["źle", "problem", "skandal", "brak", "nie działa", "tragedia", "fatalnie"]
      : ["bad", "problem", "scandal", "lack", "not working", "terrible", "awful"];

  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;

  // Simple PII detection (email, phone patterns)
  const piiDetected = /\b[\w.-]+@[\w.-]+\.\w+\b/.test(text) || /\b\d{9,11}\b/.test(text);

  let sentiment: SentimentResult["sentiment"] = "neutral";
  if (posCount > negCount) sentiment = "positive";
  else if (negCount > posCount) sentiment = "negative";
  else if (posCount > 0 && negCount > 0) sentiment = "mixed";

  return {
    sentiment,
    confidence: 0.3,
    themes: [],
    pii_detected: piiDetected,
    sanitized_text: piiDetected
      ? text.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[REDACTED]").replace(/\b\d{9,11}\b/g, "[REDACTED]")
      : null,
    source: "fallback",
  };
}
