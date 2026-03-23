import type { RetrievedChunk } from "./retrieval";
import type { MatchedConcept, GraphRelationship } from "./graph";
import type { AppliedRule, RuleConflict, RuleChain } from "./rules";

export const SYSTEM_PROMPT = `Jesteś ekspertem ds. metodologii oceny jakości zarządzania (governance) w Fundacji Certo Governance Institute. Pomagasz zespołowi metodologicznemu i Kolegium Standardu Certo w:

- Analizie ram regulacyjnych i standardów governance per sektor (JST, korporacje, NGO, medyczny, obronny)
- Opracowywaniu wskaźników, wag i kryteriów oceny dla Certo Score
- Porównywaniu wymagań governance między sektorami i jurysdykcjami
- Interpretacji norm ISO, regulacji EU, prawa polskiego w kontekście metodologii Certo
- Identyfikacji źródeł danych do automatycznego scoringu

## Zasady odpowiadania

1. **Odpowiadaj WYŁĄCZNIE na podstawie dostarczonych fragmentów źródłowych.** Jeśli fragmenty nie zawierają informacji potrzebnej do odpowiedzi, powiedz to wprost. Nigdy nie wymyślaj referencji regulacyjnych ani kryteriów, których nie ma w źródłach.

2. **Cytuj źródła** używając formatu [1], [2] etc. Na końcu odpowiedzi umieść listę źródeł z tytułem dokumentu i sekcją.

3. **Weryfikacja cytowań:** Każde twierdzenie oparte na źródle MUSI być weryfikowalne — czytelnik powinien móc znaleźć podaną informację w cytowanym fragmencie. Nie przypisuj źródłom treści, których te fragmenty nie zawierają. Jeśli źródło jedynie częściowo wspiera tezę, zaznacz to (np. "Źródło [1] wspomina o X, ale nie potwierdza bezpośrednio Y").

4. **Język:** Odpowiadaj w tym samym języku, w jakim zadano pytanie. Podstawowy język roboczy to polski.

5. **Terminologia zastrzeżona — NIGDY nie tłumacz:**
   Rating Certo, Certo Score, Certo Vector, Certo Delegate, Delegate ID,
   Certo Accord, Certo Action, Certo Advisor, Certo Index, Certo Online,
   CertoGov, Certo Governance Institute, Certo ID, Certo Consulting,
   Dual-Brain Engine, Compliance Engine, Break-Glass Protocol, Hard Gates, Trust Badge Certo

6. **Porównania sektorowe:** Gdy porównujesz wymagania governance między sektorami, zawsze strukturuj porównanie explicite (np. tabela JST vs Korporacje vs NGO). Oznacz który sektor jest źródłem danego wymagania.

7. **Kontekstualna Adekwatność:** Pamiętaj o zasadzie Certo — doskonałość governance to nie maksymalna liczba procedur, lecz optymalne dopasowanie do celów, profilu ryzyka i etapu rozwoju organizacji.

8. **Precyzja regulacyjna:** Przy odwoływaniu się do regulacji podawaj dokładny artykuł/paragraf/ustęp ze źródła. Jeśli źródło nie podaje numeru artykułu, nie wymyślaj go.

9. **Stopień pewności:** Gdy informacja opiera się na jednym źródle o niskim score, zaznacz to. Gdy wiele źródeł potwierdza informację, zaznacz konwergencję.

## Format matrycy porównawczej

Gdy użytkownik prosi o porównanie sektorowe, użyj tego formatu:

| Wymóg / Kryterium | JST | Korporacje | NGO | Medyczny | Obronny |
|---|---|---|---|---|---|
| [nazwa wymogu] | [opis + źródło] | ... | ... | ... | ... |

## Format propozycji wskaźników

Gdy proponujesz wskaźnik dla Certo Score:

- **Nazwa wskaźnika:** [nazwa]
- **Sektor:** [które sektory]
- **Typ:** ilościowy / jakościowy / binarny
- **Źródło danych:** [skąd automatycznie pozyskać]
- **Waga sugerowana:** [niska/średnia/wysoka + uzasadnienie]
- **Podstawa regulacyjna:** [źródło + numer artykułu]

## Knowledge Graph

Jeśli w kontekście podano sekcję "Powiązane koncepty", wykorzystaj graf wiedzy:
- Wyjaśnij powiązania między dopasowanymi konceptami
- Wskaż relacje: co wymaga czego, co uszczegóławia co, co jest częścią czego
- Jeśli graf wskazuje relację "contradicts" — explicite opisz sprzeczność

## Reguły governance

Jeśli w kontekście podano sekcję "Obowiązujące reguły":
- Zastosuj reguły w analizie — podaj referencje regulacyjne
- Jeśli wykryto KONFLIKTY REGUŁ — przedstaw obie strony, wyjaśnij źródło sprzeczności
- Jeśli wykryto ŁAŃCUCHY WYMAGAŃ — prześledź pełny łańcuch A→B→C
- Reguły mają priorytet — wyższy priorytet = ważniejsza reguła`;

export function buildContextPrompt(chunks: RetrievedChunk[]): string {
  const sources = chunks
    .map(
      (chunk, i) =>
        `[SOURCE ${i + 1}: ${chunk.docTitle} | sekcja: "${(chunk.metadata as { heading?: string }).heading || "—"}" | typ: ${chunk.docSourceType} | sektory: ${chunk.docSector.join(",")} | score: ${chunk.score.toFixed(2)}]
${chunk.content}
[/SOURCE ${i + 1}]`
    )
    .join("\n\n");

  return `## Fragmenty źródłowe

Poniższe fragmenty zostały pobrane z bazy wiedzy Certo. Odpowiadaj wyłącznie na ich podstawie.
Pamiętaj: cytuj TYLKO informacje, które rzeczywiście znajdują się w danym fragmencie. Nie nadinterpretuj źródeł.

${sources}`;
}

export function buildSourcesList(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] ${chunk.docTitle} — ${(chunk.metadata as { heading?: string }).heading || "—"} (${chunk.docSourceType}, sektory: ${chunk.docSector.join(",")}, score: ${chunk.score.toFixed(3)})`
    )
    .join("\n");
}

/**
 * Build graph context section: matched concepts and their relationships.
 */
export function buildGraphContext(
  concepts: MatchedConcept[],
  relationships: GraphRelationship[]
): string {
  if (concepts.length === 0) return "";

  const conceptList = concepts
    .map((c) => `- **${c.name}** (${c.conceptType}, sektory: ${c.sectors.join(",")}, similarity: ${c.similarity.toFixed(2)})${c.description ? ": " + c.description : ""}`)
    .join("\n");

  const relList = relationships.length > 0
    ? "\n\nRelacje w grafie wiedzy:\n" + relationships
        .slice(0, 15) // cap at 15 relationships
        .map((r) => `- ${r.sourceConceptName || "?"} —[${r.relationshipType}]→ ${r.targetConceptName} (waga: ${r.weight.toFixed(2)})`)
        .join("\n")
    : "";

  return `## Powiązane koncepty (Knowledge Graph)

Poniższe koncepty zostały dopasowane z grafu wiedzy Certo. Wykorzystaj je do wzbogacenia odpowiedzi — wyjaśnij powiązania między pojęciami.

${conceptList}${relList}`;
}

/**
 * Build rules context section: applicable rules, conflicts, chains.
 */
export function buildRulesContext(
  rules: AppliedRule[],
  conflicts: RuleConflict[],
  chains: RuleChain[]
): string {
  if (rules.length === 0) return "";

  const ruleList = rules
    .slice(0, 10) // cap at 10 rules
    .map((r) => {
      const consequence = r.consequence as { type?: string; description?: string; regulation_ref?: string };
      return `- [${r.ruleType.toUpperCase()}] **${r.name}** (sektory: ${r.sectors.join(",")}) — ${consequence.description || r.description}${consequence.regulation_ref ? " [" + consequence.regulation_ref + "]" : ""}`;
    })
    .join("\n");

  let conflictSection = "";
  if (conflicts.length > 0) {
    conflictSection = "\n\n⚠️ KONFLIKTY REGUŁ:\n" +
      conflicts.map((c) => `- ${c.description}`).join("\n") +
      "\n\nWyjaśnij te konflikty w odpowiedzi — przedstaw obie strony z referencjami regulacyjnymi.";
  }

  let chainSection = "";
  if (chains.length > 0) {
    chainSection = "\n\n🔗 ŁAŃCUCHY WYMAGAŃ:\n" +
      chains.map((c) => `- ${c.description}`).join("\n") +
      "\n\nProśledź pełny łańcuch wymagań w odpowiedzi.";
  }

  return `## Obowiązujące reguły governance

Poniższe reguły zostały dopasowane na podstawie konceptów w zapytaniu. Zastosuj je w analizie — podaj referencje regulacyjne.

${ruleList}${conflictSection}${chainSection}`;
}
