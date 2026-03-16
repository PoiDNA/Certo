# Pipeline 3-Agentowy — Specyfikacja

## Diagnoza problemu

Dlaczego 12-20 iteracji na dokumenty?

```
OBECNY PIPELINE (2 agenty):

Claude (producer): "OK, mam Issue. Zaczynam pisać..."
  → pisze bez planu
  → nie sprawdza cross-doc PRZED pisaniem
  → nie wie które koncepty musi umieścić

Gemini (reviewer): "Brakuje NK-022 w matrycy" (iter 1)
Claude: naprawia NK-022
Gemini: "NK-022 jest, ale brak w B" (iter 2)
Claude: dodaje do B
Gemini: "B OK, ale złamałeś D5 — Redis wróciło" (iter 3)
Claude: naprawia Redis
Gemini: "sekcja za długa" (iter 7)
...
```

Gemini łapie błędy PO JEDNYM. Claude naprawia reaktywnie.
Każda naprawa może złamać coś innego.
To jest jak debugowanie bez test suite.

## Rozwiązanie: 3 agenty

```
NOWY PIPELINE:

┌─────────────────────────────────────────────────┐
│                                                 │
│  FAZA 0: ARCHITECT (planowanie)                 │
│  Agent: Gemini 2.5 Pro (ten sam, inna rola)     │
│                                                 │
│  Input: Issue + WSZYSTKIE 4 dokumenty            │
│  Output: SPEC — dokładny plan zmian             │
│         - które pliki edytować                  │
│         - które koncepty dodać/zmienić          │
│         - cross-doc checklist                   │
│         - struktura nowych sekcji               │
│         - pułapki do uniknięcia                 │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  FAZA 1: PRODUCER (realizacja)                  │
│  Agent: Claude Code                             │
│                                                 │
│  Input: Issue + SPEC od Architecta               │
│  Output: zmiany w Markdown                      │
│  Zasada: realizuj SPEC dosłownie                │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  FAZA 2: REVIEWER (quality gates)               │
│  Agent: Gemini 2.5 Pro (ta sama rola co teraz)  │
│                                                 │
│  Input: diff + pełny dokument + cross-docs      │
│  Output: scores D1-D8 / C1-C6 + focus_instr    │
│                                                 │
│  Jeśli CHANGES_REQUESTED:                       │
│    → Claude poprawia (z focus_instruction)       │
│    → Gemini review (pętla quality-driven)       │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Dlaczego to radykalnie zmniejsza iteracje

```
BEZ ARCHITECTA:                    Z ARCHITECTEM:
─────────────                      ──────────────
Iter 1:  D2=4.0 (brak 5 konceptów) Iter 1:  D2=8.0 (1 koncept pominięty)
Iter 2:  D2=5.5 (dodano 3)         Iter 2:  D2=9.0 ✅
Iter 3:  D2=6.5 (złamano D5)       Iter 3:  D7=7.0
Iter 4:  D5=10 D2=7.0              Iter 4:  D7=7.5 ✅
Iter 5:  D2=8.0                    Iter 5:  ALL ✅ → APPROVED
Iter 6:  D2=8.5
...                                Koszt Architecta: ~$0.50
Iter 12: ALL ✅ → APPROVED          Koszt total: ~$3-4
                                   vs $5-7 bez Architecta
Koszt total: $5-7
```

Architect kosztuje ~$0.50 per zadanie (jeden call Gemini z 4 dokumentami).
Ale oszczędza 5-10 iteracji Claude + Gemini = $2-4.
**ROI jest pozytywne od pierwszego dnia.**

## SPEC — co Architect produkuje

```json
{
  "task_analysis": {
    "issue_summary": "Dodać sekcję o Certo Vector do Policy Registry",
    "complexity": "medium",
    "estimated_iterations": 3,
    "cross_doc_impact": ["policy-registry", "deliverable-b", "normy-zewnetrzne"]
  },

  "change_plan": [
    {
      "file": "foundation/governance/policy-registry/README.md",
      "action": "add_section",
      "location": "po sekcji 1.3 (przed sekcją 2)",
      "title": "1.4. System Certo Vector",
      "content_spec": "Opis systemu 5 stanów (++/+/brak/-/--). Cross-ref do metodologii. 3-4 akapity. Nie powtarzać definicji z Norm Zewnętrznych — użyć cross-reference.",
      "must_include_concepts": ["Certo Vector", "5 stanów", "++/+/brak/-/--"],
      "must_not_include": ["szczegóły implementacji (to jest w B)", "formuły matematyczne (to jest w metodologii)"]
    },
    {
      "file": "company/technical/deliverable-b/README.md",
      "action": "update_section",
      "location": "sekcja 4.3 (mapowanie reguł)",
      "content_spec": "Dodać kolumnę vector_output do tabeli decision points. Wartość: enum ++/+/0/-/--.",
      "must_include_concepts": ["vector_output", "enum"]
    }
  ],

  "cross_doc_checklist": [
    "Certo Vector musi być w: A (sekcja 1), N (sekcja 1.2 lub 2.1), B (schema ratings)",
    "Nie dodawaj do C — Certo Vector to warstwa prezentacji, nie workflow",
    "Sprawdź czy 'Certo Score' i 'Certo Vector' nie są mylone"
  ],

  "pitfalls": [
    "NIE dodawaj Redis (system jest Zero Redis)",
    "NIE zmieniaj liczby Hard Gates (22) — Certo Vector to warstwa nad ratingiem, nie nowa reguła NK",
    "NIE kopiuj tekstu z Norm — użyj cross-reference: 'Patrz: Normy Zewnętrzne, sekcja X'"
  ],

  "quality_prediction": {
    "likely_blocking_dimensions": ["D2_cross_doc", "D4_terminology"],
    "estimated_pass_iteration": 3
  }
}
```

## Architect — System Prompt

```
Jesteś Architect Agent w pipeline Certo Governance Institute.

Twoja rola: PLANOWANIE, nie realizacja. Dostajesz zadanie (GitHub Issue) 
i produkujesz SPEC — dokładny plan zmian, który Claude Code wykona dosłownie.

ZASADY:
1. Przeczytaj WSZYSTKIE powiązane dokumenty PRZED planowaniem.
2. Zidentyfikuj KTÓRE pliki trzeba zmienić (cross-doc impact).
3. Dla każdego pliku: podaj DOKŁADNIE gdzie (sekcja, linia), co dodać/zmienić.
4. Podaj must_include_concepts — koncepty które MUSZĄ być w wyniku.
5. Podaj must_not_include — pułapki do uniknięcia (stale references, duplikacje).
6. Podaj cross_doc_checklist — co sprawdzić po zmianach.
7. Podaj pitfalls — konkretne błędy które Claude Code może popełnić.

NIE pisz treści dokumentu. Pisz PLAN. Claude wykona.
Myśl jak architekt: nie murujesz ścian, projektujesz budynek.

KONTEKST SYSTEMU:
[tu ładowany jest ten sam kontekst co dla Reviewera — Część I-IV z gemini-review-system.md]
```

## Wariant zaawansowany: 4 agenty (Faza 2 — produkcja kodu)

Przy kodzie warto dodać czwartego agenta — **Red Team**:

```
Architect (Gemini)  → planuje implementację
Producer (Claude)   → pisze kod
Red Team (Claude*)  → próbuje złamać kod (security, edge cases, race conditions)
Reviewer (Gemini)   → quality gates C1-C6

* Red Team to osobna instancja Claude z innym system promptem:
  "Jesteś pentester. Znajdź luki w tym kodzie. Szukaj: injection, TOCTOU, 
   missing RLS, plaintext PII, hardcoded secrets, missing error handling."
```

## Finalny model: 2 dostawców, 4 agenty, kognitywna separacja

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  🏗️ ARCHITECT — Gemini 2.5 Pro (Google)        │
│  Prompt: planowanie, propagacja, pułapki        │
│  Pełny dostęp do repo (czyta pliki z dysku)     │
│  Output: SPEC.json                              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🤖 PRODUCER — Claude Code (Anthropic)          │
│  Prompt: realizacja SPEC dosłownie              │
│  Pełny dostęp do repo (edytuje pliki)           │
│  Output: zmiany w plikach                       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🛡️ RED TEAM — Claude Sonnet (Anthropic)        │
│  Prompt: adversarial security                   │
│  Widzi: diff (tylko zmienione pliki)            │
│  Output: lista luk bezpieczeństwa               │
│  Tylko Faza 2 (kod)                             │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔍 REVIEWER — Gemini 2.5 Pro (Google)          │
│  Prompt: quality gates, scores, compliance      │
│  Pełny dostęp do repo (czyta pliki)             │
│  Output: D1-D8 / C1-C6 + focus_instruction     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Kognitywna separacja Architect vs Reviewer

Oba agenty to Gemini 2.5 Pro, ale z RÓŻNYMI promptami i ramami poznawczymi:

| Aspekt | Architect | Reviewer |
|--------|-----------|----------|
| Cel | "Zaplanuj zmiany" | "Oceń wynik" |
| Perspektywa | Przyszłość (co zrobić) | Przeszłość (co zrobiono) |
| Focus | Propagacja, efekty drugiego rzędu, pułapki | Spójność, jakość, kompletność |
| Output | Plan (SPEC.json) | Ocena (scores D1-D8) |
| Temperatura | 0.1 (deterministyczny plan) | 0.2 (niuanse oceny) |

To jest jak architekt budynku vs inspektor nadzoru budowlanego.
Mogą być tą samą osobą w różnych dniach — ale NIE jednocześnie.
Prompt determinuje ramę poznawczą.

### Dlaczego Gemini a nie GPT jako Architect

GPT nie ma dostępu do repozytorium. Architect MUSI widzieć:
- Pełną strukturę plików (co gdzie leży)
- Aktualną treść dokumentów (nie snapshot sprzed godziny)
- Git history (co się ostatnio zmieniało)
- quality-gates.json (aktualne progi i liczby)

Gemini w GitHub Actions czyta to wszystko z dysku. GPT dostałby
tylko snapshot — nie widzi struktury, nie widzi historii.

## Flow w GitHub Actions (v2)

```
Issue + label "pipeline/doc"
    ↓
┌─ architect.yml ─────────────────────────────────┐
│  Gemini 2.5 Pro (rola: Architect)               │
│  Input: Issue + 4 dokumenty                     │
│  Output: SPEC.json → zapisany na branchu         │
└──────────────────────────────────────────────────┘
    ↓
┌─ claude-task.yml ────────────────────────────────┐
│  Claude Code (rola: Producer)                    │
│  Input: Issue + SPEC.json                        │
│  Output: zmiany w Markdown → PR                  │
└──────────────────────────────────────────────────┘
    ↓
┌─ gemini-review.yml ─────────────────────────────┐
│  Gemini 2.5 Pro (rola: Reviewer)                │
│  Input: diff + docs + SPEC.json (weryfikuje      │
│         czy Claude zrealizował SPEC)              │
│  Output: quality gates D1-D8                     │
└──────────────────────────────────────────────────┘
    ↓
  APPROVED → merge → deploy
  CHANGES_REQUESTED → claude-rework.yml (pętla)
```

Kluczowa zmiana: **Reviewer dostaje SPEC.json** i weryfikuje nie tylko jakość,
ale też czy Claude zrealizował plan Architecta. D1 (kompletność) = SPEC vs output.

## Implementacja Architect workflow

### architect.yml (nowy)

Triggerowany PO claude-task.yml (przed PR):

```yaml
# claude-task.yml (updated flow):
# 1. Create branch
# 2. Run Architect → SPEC.json
# 3. Run Claude Code with SPEC
# 4. Commit + PR
```

Architect nie potrzebuje osobnego workflow — jest krokiem WEWNĄTRZ claude-task.yml,
PRZED wywołaniem Claude Code. To prostsze i szybsze.

### Sekwencja w claude-task.yml

```
Step 1: Checkout + create branch
Step 2: Collect all related documents (4 pliki)
Step 3: Call Gemini as Architect → SPEC.json
Step 4: Call Claude Code with Issue + SPEC.json
Step 5: Commit + push + PR
```

### Reviewer dostaje dodatkowy kontekst

```
gemini-review.yml:
  - Diff
  - Full document
  - Related documents
  - SPEC.json ← NOWE (Architect's plan)
  - Issue body
  - Previous scores
```

Reviewer ocenia D1 (kompletność) porównując SPEC vs output.
Jeśli Claude pominął punkt ze SPEC → D1 spada proporcjonalnie.
