/**
 * Architect Agent — Gemini 2.5 Pro
 * 
 * Runs inside GitHub Actions → full repo access.
 * Reads ALL files from disk, analyzes structure, Git history if needed.
 * Produces SPEC.json that Claude Code executes literally.
 * 
 * Cognitive separation from Reviewer:
 *   - Architect prompt focuses on PLANNING (implications, propagation, pitfalls)
 *   - Reviewer prompt focuses on EVALUATION (quality gates, scores, compliance)
 *   - Same model, different prompts, different cognitive frames
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

interface ArchitectSpec {
  task_analysis: {
    issue_summary: string;
    complexity: "trivial" | "low" | "medium" | "high" | "critical";
    estimated_iterations: number;
    cross_doc_impact: string[];
    second_order_effects: string[];
  };
  change_plan: ChangePlanItem[];
  cross_doc_checklist: string[];
  pitfalls: string[];
  quality_prediction: {
    likely_blocking_dimensions: string[];
    estimated_pass_iteration: number;
  };
}

interface ChangePlanItem {
  file: string;
  action: "add_section" | "update_section" | "delete_section" | "add_concept" | "fix_reference" | "update_numbers";
  location: string;
  content_spec: string;
  must_include_concepts: string[];
  must_not_include: string[];
}

const ARCHITECT_PROMPT = `Jesteś Architect Agent w pipeline Certo Governance Institute.

Twoja rola: PLANOWANIE, nie realizacja. Nie piszesz treści dokumentów. Produkujesz SPEC — dokładny plan zmian, który Claude Code wykona dosłownie. Twój SPEC jest potem podstawą oceny przez Reviewer (osobny agent Gemini z innym promptem).

Masz pełny dostęp do repozytorium. Czytasz pliki z dysku. Widzisz strukturę, wersje, Git history.

## ZASADY

1. Przeczytaj WSZYSTKIE powiązane dokumenty PRZED planowaniem.
2. Zidentyfikuj KTÓRE pliki trzeba zmienić — nie tylko oczywiste, ale też efekty drugiego rzędu (second_order_effects).
3. Dla każdego pliku: podaj DOKŁADNIE gdzie (sekcja, po czym, przed czym), co dodać/zmienić, i jakim stylem (tabela, akapit, lista).
4. must_include_concepts — koncepty które MUSZĄ być w wyniku.
5. must_not_include — pułapki: stale references, duplikacje, błędne nazwy, koncepty które NIE powinny się pojawić.
6. cross_doc_checklist — lista weryfikacji PO zmianach (co sprawdzić w każdym dokumencie).
7. pitfalls — konkretne błędy które Claude Code PRAWDOPODOBNIE popełni na podstawie wzorców z poprzednich recenzji.
8. second_order_effects — co JESZCZE się zmienia w wyniku tej zmiany (np. nowa reguła NK → liczba Hard Gates rośnie → trzeba zaktualizować WSZYSTKIE wzmianki "22 Hard Gates" + quality-gates.json).

## MYŚL O PROPAGACJI

Każda zmiana ma fale:
- Fala 1: bezpośrednia zmiana w docelowym dokumencie
- Fala 2: propagacja do powiązanych dokumentów (A↔B↔C↔N)
- Fala 3: aktualizacja liczb, konfiguracji, matryc
- Fala 4: wpływ na Break-Glass classification, workflow routing, schema DB

Twój plan MUSI obejmować WSZYSTKIE fale, nie tylko falę 1.

## KONTEKST SYSTEMU CERTO

Architektura: OPA WASM in-process, Single-Pass Evaluation, Transactional Outbox, 3 workery SoD (Operational, Evidence, Integrity Sentinel), External Trust Anchor (RFC3161 TSA), Zero Redis, Postgres source of truth.

22 Hard Gates (NK-000–NK-022), 14 core Sprint 0, 22 Soft Gates (NK-019–NK-041).
7 workflowów (W1-W7). 9 decision points. 7 ADR. 13 tabel DB.

Nazewnictwo: "Fundacja Certo" (NIGDY "Fundacja CGI"). "Spółka Certo ID PSA".

Break-Glass omijalne: NK-005, 007, 011, 012.
Break-Glass NIEOMIJALNE: NK-SCHEMA, NK-017, NK-018, NK-021, NK-022.

Stale references (MUSZĄ być w pitfalls jeśli zmiana ich dotyczy):
Redis, sidecar, 5 workflowów, Top 15, ScheduleKeyDeletion, pg_cron, PutObjectRetention, "Fundacja CGI"

## FORMAT ODPOWIEDZI

Zwróć TYLKO JSON (bez markdown, bez backticks):

{
  "task_analysis": {
    "issue_summary": "po polsku, 1-2 zdania",
    "complexity": "trivial|low|medium|high|critical",
    "estimated_iterations": 3,
    "cross_doc_impact": ["foundation/governance/policy-registry/README.md", "..."],
    "second_order_effects": ["liczba Hard Gates rośnie z 22 do 23 — wymaga aktualizacji we wszystkich dokumentach i quality-gates.json"]
  },
  "change_plan": [
    {
      "file": "ścieżka/do/pliku.md",
      "action": "add_section",
      "location": "po sekcji 'NK-022 Funding Independence', przed sekcją '3. Soft Gates'",
      "content_spec": "Tabela reguły NK-023 w formacie identycznym jak NK-022. Opis: max 3 kolejne ewaluacje tego samego podmiotu.",
      "must_include_concepts": ["rotation", "consecutive", "3 ewaluacje", "obowiązkowa rotacja"],
      "must_not_include": ["Redis", "sidecar", "implementacja szczegółowa (to jest w B)"]
    }
  ],
  "cross_doc_checklist": [
    "A: NK-023 w tabeli Hard Gates + sekcja 6.6 decision points (ASSIGN_EVALUATOR)",
    "B: NK-023 w mapowaniu reguł + kolumna consecutive_evaluations w schema ratings",
    "C: NK-023 w matrycy (wiersz po 022, kolumna W2=✓) + krok w W2 po NK-003",
    "N: wzmianka w sekcji 5.2 (decision points) + cross-reference do A",
    "quality-gates.json: hard_gates_total → 23"
  ],
  "pitfalls": [
    "NIE zapomnij zaktualizować quality-gates.json — Reviewer sprawdza D6 (spójność liczbowa)",
    "NK-023 to Sprint 1, NIE Sprint 0 — nie dodawaj do '14 core'",
    "Rotation ≠ Incompatibilitas (NK-002). NK-002 = zakaz. NK-023 = limit kolejnych",
    "Sprawdź czy nowa reguła jest omijalna przez Break-Glass czy nie (rekomendacja: omijalna, bo proceduralna)"
  ],
  "quality_prediction": {
    "likely_blocking_dimensions": ["D2_cross_doc", "D6_numbers"],
    "estimated_pass_iteration": 3
  }
}`;

export async function createSpec(
  issueBody: string,
  documents: Record<string, string>,
  repoStructure?: string,
): Promise<ArchitectSpec> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const docsContext = Object.entries(documents)
    .map(([path, content]) => `### ${path}\n${content}`)
    .join("\n\n---\n\n");

  const userPrompt = `## Zadanie z GitHub Issue
${issueBody}

## Struktura repozytorium
${repoStructure || "(niedostępna)"}

## Dokumenty (pełna treść)
${docsContext}

Przeanalizuj zadanie, przeczytaj dokumenty, zaplanuj zmiany. Zwróć SPEC jako JSON.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: ARCHITECT_PROMPT + "\n\n" + userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini Architect error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Architect response");

  return JSON.parse(text);
}

export function formatSpecForClaude(spec: ArchitectSpec): string {
  const lines = [
    "# SPEC OD ARCHITECTA — realizuj dosłownie",
    "",
    `**Złożoność:** ${spec.task_analysis.complexity}`,
    `**Szacowane iteracje:** ${spec.task_analysis.estimated_iterations}`,
    `**Pliki do edycji:** ${spec.task_analysis.cross_doc_impact.join(", ")}`,
    "",
  ];

  if (spec.task_analysis.second_order_effects.length > 0) {
    lines.push("## Efekty drugiego rzędu (WAŻNE)");
    for (const effect of spec.task_analysis.second_order_effects) {
      lines.push(`- ⚠️ ${effect}`);
    }
    lines.push("");
  }

  lines.push("## Plan zmian");
  for (const item of spec.change_plan) {
    lines.push(
      "",
      `### ${item.file}`,
      `Akcja: ${item.action}`,
      `Lokalizacja: ${item.location}`,
      `Spec: ${item.content_spec}`,
      `MUSI zawierać: ${item.must_include_concepts.join(", ")}`,
      `NIE MOŻE zawierać: ${item.must_not_include.join(", ")}`
    );
  }

  lines.push("", "## Cross-doc checklist (sprawdź PO zmianach)");
  for (const check of spec.cross_doc_checklist) {
    lines.push(`- [ ] ${check}`);
  }

  lines.push("", "## Pułapki (UNIKAJ)");
  for (const trap of spec.pitfalls) {
    lines.push(`- 🚫 ${trap}`);
  }

  return lines.join("\n");
}

// CLI entry point (called by GitHub Actions)
async function main() {
  const fs = await import("fs");
  const path = await import("path");
  const { execSync } = await import("child_process");

  const issueBody = process.env.ISSUE_BODY || "";

  // Read all live documents from repo (we have full disk access)
  const docPaths = [
    "foundation/governance/normy-zewnetrzne/README.md",
    "foundation/governance/policy-registry/README.md",
    "company/technical/deliverable-b/README.md",
    "company/technical/deliverable-c/README.md",
    "foundation/governance/metodologia/README.md",
  ];

  const documents: Record<string, string> = {};
  for (const docPath of docPaths) {
    const fullPath = path.resolve(process.cwd(), "..", docPath);
    if (fs.existsSync(fullPath)) {
      documents[docPath] = fs.readFileSync(fullPath, "utf-8");
    }
  }

  // Get repo structure for context
  let repoStructure = "";
  try {
    repoStructure = execSync("find .. -name '*.md' -not -path '*/node_modules/*' | head -30", { encoding: "utf-8" });
  } catch { /* ignore */ }

  // Read quality-gates config
  const configPath = path.resolve(process.cwd(), "config", "quality-gates.json");
  if (fs.existsSync(configPath)) {
    documents["pipeline/config/quality-gates.json"] = fs.readFileSync(configPath, "utf-8");
  }

  const spec = await createSpec(issueBody, documents, repoStructure);
  const formatted = formatSpecForClaude(spec);

  fs.writeFileSync("/tmp/architect-spec.json", JSON.stringify(spec, null, 2));
  fs.writeFileSync("/tmp/architect-spec-formatted.md", formatted);

  console.log("=== ARCHITECT SPEC ===");
  console.log(`Complexity: ${spec.task_analysis.complexity}`);
  console.log(`Files: ${spec.task_analysis.cross_doc_impact.length}`);
  console.log(`Est. iterations: ${spec.task_analysis.estimated_iterations}`);
  console.log(`Second-order effects: ${spec.task_analysis.second_order_effects.length}`);
  console.log(`Pitfalls: ${spec.pitfalls.length}`);
}

main().catch((e) => {
  console.error("Architect failed:", e);
  process.exit(1);
});
