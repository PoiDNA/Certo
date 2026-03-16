import Anthropic from "@anthropic-ai/sdk"; // not used here, but available for Claude calls

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

interface ReviewResult {
  decision: "APPROVED" | "CHANGES_REQUESTED";
  summary: string;
  score: number;
  comments: ReviewComment[];
  crossDocIssues: string[];
  staleReferences: string[];
  numbersCheck: Record<string, string>;
}

interface ReviewComment {
  file: string;
  line?: number;
  severity: "critical" | "major" | "minor" | "suggestion";
  message: string;
}

interface ReviewInput {
  diff: string;
  fullDocument: string;
  relatedDocuments: Record<string, string>; // slug → content
  issueBody: string;
  prNumber: number;
  iteration: number;
  previousFeedback?: string;
}

const SYSTEM_PROMPT_PATH = new URL("../prompts/gemini-review-system.md", import.meta.url);

async function loadSystemPrompt(): Promise<string> {
  const fs = await import("fs");
  const path = await import("path");
  const promptPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../prompts/gemini-review-system.md"
  );
  return fs.readFileSync(promptPath, "utf-8");
}

export async function reviewPR(input: ReviewInput): Promise<ReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const SYSTEM_PROMPT = await loadSystemPrompt();

  const userPrompt = `## Zadanie z GitHub Issue #${input.prNumber}
${input.issueBody}

## Iteracja: ${input.iteration}/5
${input.previousFeedback ? `### Poprzedni feedback:\n${input.previousFeedback}` : ""}

## Diff (zmiany)
\`\`\`diff
${input.diff}
\`\`\`

## Pełny dokument po zmianach
${input.fullDocument}

## Powiązane dokumenty (cross-reference)
${Object.entries(input.relatedDocuments)
  .map(([slug, content]) => `### ${slug}\n${content.slice(0, 3000)}...`)
  .join("\n\n")}

Przeanalizuj zmiany i zwróć JSON z oceną.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");

  const result: ReviewResult = JSON.parse(text);

  // Auto-escalate: if iteration >= 5 and still CHANGES_REQUESTED
  if (input.iteration >= 5 && result.decision === "CHANGES_REQUESTED") {
    result.summary += " [ESCALATED: Max iterations reached. Human review required.]";
  }

  return result;
}

// Post review as PR comment
export function formatReviewAsMarkdown(result: ReviewResult, iteration: number): string {
  const emoji = result.decision === "APPROVED" ? "✅" : "🔄";
  const lines = [
    `## ${emoji} Gemini Review (iteracja ${iteration}/5)`,
    "",
    `**Decyzja:** ${result.decision}`,
    `**Score:** ${result.score}/10`,
    "",
    `### Podsumowanie`,
    result.summary,
  ];

  if (result.comments.length > 0) {
    lines.push("", "### Komentarze");
    for (const c of result.comments) {
      const icon = { critical: "🔴", major: "🟠", minor: "🟡", suggestion: "💡" }[c.severity];
      lines.push(`- ${icon} **${c.severity}** (${c.file}${c.line ? `:${c.line}` : ""}): ${c.message}`);
    }
  }

  if (result.staleReferences.length > 0) {
    lines.push("", "### 🗑️ Stale references (muszą być usunięte)");
    for (const ref of result.staleReferences) {
      lines.push(`- ${ref}`);
    }
  }

  if (result.crossDocIssues.length > 0) {
    lines.push("", "### 🔗 Niespójności krzyżowe");
    for (const issue of result.crossDocIssues) {
      lines.push(`- ⚠️ ${issue}`);
    }
  }

  if (result.numbersCheck && Object.keys(result.numbersCheck).length > 0) {
    lines.push("", "### 🔢 Weryfikacja liczb");
    for (const [key, value] of Object.entries(result.numbersCheck)) {
      const ok = value.startsWith("OK");
      lines.push(`- ${ok ? "✅" : "❌"} **${key}**: ${value}`);
    }
  }

  return lines.join("\n");
}

// CLI entry point (for GitHub Actions)
async function main() {
  const diff = process.env.PR_DIFF || "";
  const fullDoc = process.env.FULL_DOCUMENT || "";
  const issueBody = process.env.ISSUE_BODY || "";
  const prNumber = parseInt(process.env.PR_NUMBER || "0");
  const iteration = parseInt(process.env.ITERATION || "1");
  const previousFeedback = process.env.PREVIOUS_FEEDBACK;

  // Related docs passed as JSON env var
  const relatedDocs = JSON.parse(process.env.RELATED_DOCUMENTS || "{}");

  const result = await reviewPR({
    diff,
    fullDocument: fullDoc,
    relatedDocuments: relatedDocs,
    issueBody,
    prNumber,
    iteration,
    previousFeedback,
  });

  // Output for GitHub Actions
  console.log(JSON.stringify(result, null, 2));

  const markdown = formatReviewAsMarkdown(result, iteration);
  
  // Write outputs for subsequent steps
  const fs = await import("fs");
  fs.writeFileSync("/tmp/review-result.json", JSON.stringify(result));
  fs.writeFileSync("/tmp/review-comment.md", markdown);

  // Exit code: 0 = approved, 1 = changes requested
  process.exit(result.decision === "APPROVED" ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
