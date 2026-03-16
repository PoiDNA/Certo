/**
 * Red Team Agent — Adversarial Security Review
 * 
 * Runs BEFORE Gemini review on code PRs.
 * Uses Claude (separate instance) to find security issues.
 * Output feeds into Gemini's C3 (Security) dimension.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface SecurityFinding {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

interface RedTeamReport {
  findings: SecurityFinding[];
  attack_vectors_tested: string[];
  overall_risk: "critical" | "high" | "medium" | "low" | "clean";
  summary: string;
}

const RED_TEAM_PROMPT = `Jesteś Red Team Agent — pentester dla platformy Certo Online.

Twoim JEDYNYM zadaniem jest znaleźć luki bezpieczeństwa w kodzie. 
NIE oceniasz jakości kodu, czytelności, stylu. TYLKO bezpieczeństwo.

## Wektory ataku do sprawdzenia

### Certo-specyficzne
- TOCTOU: czy między sprawdzeniem OPA a COMMITem coś się zmienia?
- Plaintext PII: czy gdziekolwiek PII trafia niezaszyfrowane na WORM/log?
- Missing RLS: czy odczyty idą bez RLS? Czy zapisy idą przez OPA?
- Break-Glass bypass: czy można obejść NK-017/NK-018 przez Break-Glass?
- DEK leak: czy DEK jest logowany/eksponowany/kopiowany poza dek_registry?
- Audit tampering: czy ktokolwiek może UPDATE/DELETE na audit_events?
- Time manipulation: czy czas pochodzi z transaction_timestamp() czy z API?
- Worker privilege: czy worker ma więcej uprawnień niż potrzebuje?

### Standardowe (OWASP Top 10)
- SQL Injection (nawet z ORM — raw queries, template strings)
- Missing input validation (JSON schema, size limits)
- Auth bypass (JWT manipulation, missing middleware)
- IDOR (accessing other org's data)
- Secrets in code (API keys, passwords, tokens)
- Missing rate limiting
- Error leaking (stack traces, internal paths)
- Missing CORS/CSP headers

### Race conditions
- Concurrent Break-Glass: dwa requesty = dwa audit events zamiast jednego?
- Concurrent publish: dwa użytkowników publishuje ten sam rating?
- Worker idempotency: retry = duplikat na S3 WORM?

## FORMAT ODPOWIEDZI (JSON only, no markdown):

{
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "category": "TOCTOU|RLS|PII|injection|auth|...",
      "file": "path/to/file.ts",
      "line": 42,
      "description": "Opis luki",
      "recommendation": "Jak naprawić"
    }
  ],
  "attack_vectors_tested": ["lista sprawdzonych wektorów"],
  "overall_risk": "critical|high|medium|low|clean",
  "summary": "1-2 zdania"
}`;

export async function runRedTeam(codeFiles: Record<string, string>): Promise<RedTeamReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const codeContext = Object.entries(codeFiles)
    .map(([path, content]) => `### ${path}\n\`\`\`typescript\n${content}\n\`\`\``)
    .join("\n\n");

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: RED_TEAM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Przeanalizuj poniższy kod pod kątem bezpieczeństwa:\n\n${codeContext}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Red Team API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty Red Team response");

  // Strip markdown fences if present
  const clean = text.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(clean);
}

export function formatRedTeamForReview(report: RedTeamReport): string {
  const emoji = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
    clean: "✅",
  };

  const lines = [
    `## 🛡️ Red Team Report`,
    "",
    `**Overall Risk:** ${emoji[report.overall_risk]} ${report.overall_risk.toUpperCase()}`,
    `**Findings:** ${report.findings.length}`,
    "",
  ];

  if (report.findings.length > 0) {
    lines.push("### Findings");
    for (const f of report.findings) {
      lines.push(
        `- ${emoji[f.severity]} **${f.severity.toUpperCase()}** [${f.category}] ${f.file}${f.line ? `:${f.line}` : ""}`,
        `  ${f.description}`,
        `  → Fix: ${f.recommendation}`,
        ""
      );
    }
  }

  lines.push(
    "### Attack vectors tested",
    ...report.attack_vectors_tested.map((v) => `- ${v}`),
    "",
    `*${report.summary}*`
  );

  return lines.join("\n");
}

// CLI
async function main() {
  const fs = await import("fs");
  const path = await import("path");
  const glob = await import("child_process");

  // Find all .ts/.tsx files in the diff
  const changedFiles = (process.env.CHANGED_FILES || "").split("\n").filter(Boolean);
  const codeFiles: Record<string, string> = {};

  for (const file of changedFiles) {
    if (file.match(/\.(ts|tsx|js|jsx)$/) && fs.existsSync(file)) {
      codeFiles[file] = fs.readFileSync(file, "utf-8");
    }
  }

  if (Object.keys(codeFiles).length === 0) {
    console.log("No code files to review");
    process.exit(0);
  }

  const report = await runRedTeam(codeFiles);
  fs.writeFileSync("/tmp/redteam-report.json", JSON.stringify(report, null, 2));
  fs.writeFileSync("/tmp/redteam-report.md", formatRedTeamForReview(report));

  console.log(`Red Team: ${report.overall_risk} (${report.findings.length} findings)`);
  
  // Exit with error if critical findings
  if (report.overall_risk === "critical") {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Red Team failed:", e);
  process.exit(2);
});
