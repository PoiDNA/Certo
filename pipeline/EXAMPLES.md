# Jak to działa — przewodnik z przykładami

## Twój dzień pracy z pipeline

Siedzisz w Cursor. Masz pomysł, problem, albo ktoś zgłosił uwagę.
Otwierasz GitHub, tworzysz Issue, dodajesz label. Idziesz na kawę.
Wracasz — PR czeka na Twój merge, dokumenty zaktualizowane, DOCX do pobrania.

Albo: pracujesz w Cursor jak zwykle, push na branch, PR.
Gemini automatycznie recenzuje. Dostajesz komentarz na PR: co poprawić albo ✅.

To są dwa tryby. Pipeline (automatyczny) i Cursor (ręczny). Oba korzystają z tego samego repo, tych samych reguł, tego samego Gemini jako strażnika.

---

## PRZYKŁAD 1: Dodanie nowej reguły NK-023

### Sytuacja

Izba Nadzoru postanowiła, że Certo potrzebuje reguły monitorującej
czy ewaluator nie oceniał tego samego podmiotu więcej niż 3 razy z rzędu.
Masz uchwałę. Trzeba ją wdrożyć w dokumentacji.

### Krok 1: Tworzysz Issue

```
Tytuł: [DOC] NK-023 Rotation Limit — max 3 kolejne ewaluacje tego samego podmiotu

Zadanie:
Dodać regułę NK-023 "Rotation Limit" do wszystkich dokumentów.
Ewaluator nie może oceniać tego samego podmiotu więcej niż 3 razy
z rzędu. Po 3 ewaluacjach — obowiązkowa rotacja.
Źródło: Uchwała Izby Nadzoru nr 7/2026 z dnia 15.03.2026.

Dokument docelowy: foundation/governance/policy-registry
Priorytet: 🟠 High
```

Label: `pipeline/doc`

### Krok 2: Architect (Gemini) planuje — automatycznie, ~30 sekund

Dostajesz komentarz na Issue:

> 🏗️ **Architect SPEC**
>
> **Złożoność:** high
> **Szacowane iteracje:** 5-7
> **Pliki do edycji:** policy-registry, deliverable-b, deliverable-c, normy-zewnetrzne
>
> <details><summary>Pełny SPEC</summary>
>
> **Plan zmian:**
>
> 1. `policy-registry/README.md` — dodaj tabelę NK-023 po NK-022, wzór identyczny
>    jak NK-004 (Rotation Tracker). Must include: "3 kolejne ewaluacje",
>    "obowiązkowa rotacja", "COUNT consecutive WHERE evaluator AND entity".
>    Must NOT include: Redis, sidecar.
>
> 2. `deliverable-b/README.md` — dodaj NK-023 do tabeli mapowania (sekcja 4.3).
>    Dodaj kolumnę w schema ratings: `consecutive_evaluations INTEGER DEFAULT 0`.
>    Decision point: ASSIGN_EVALUATOR.
>
> 3. `deliverable-c/README.md` — dodaj NK-023 do matrycy (wiersz po 022,
>    kolumna W2 = ✓). Dodaj krok w W2 (Przypisanie ewaluatora) po NK-003.
>
> 4. `normy-zewnetrzne/README.md` — dodaj wzmiankę w sekcji 5.2 (decision points).
>    Cross-reference do Policy Registry.
>
> **Pułapki:**
> - NIE zmieniaj liczby "22 Hard Gates" na "23" — to wymaga aktualizacji
>   quality-gates.json ORAZ wszystkich wzmianek we wszystkich dokumentach.
>   Zrób to jako osobną zmianę w tym samym PR.
> - NK-023 to Sprint 1, nie Sprint 0 — nie dodawaj do "14 core".
> - Rotation ≠ Incompatibilitas (NK-002). NK-002 = nie może oceniać.
>   NK-023 = może, ale max 3 razy z rzędu.
>
> </details>

### Krok 3: Claude Code realizuje SPEC — automatycznie, ~2-3 minuty

Claude modyfikuje CZTERY pliki w jednym commicie:
- Policy Registry: nowa tabela NK-023
- Deliverable B: nowa kolumna w schema + mapowanie
- Deliverable C: nowy wiersz w matrycy + krok w W2
- Normy Zewnętrzne: wzmianka w sekcji 5.2

Otwiera PR z opisem:

> 🤖 #42: NK-023 Rotation Limit
>
> | Agent | Status |
> |-------|--------|
> | 🏗️ Architect | ✅ SPEC created |
> | 🤖 Producer | ✅ 4 pliki zmienione |
> | 🔍 Reviewer | ⏳ Czeka na review |
>
> Złożoność: high
> Szacowane iteracje: 5-7

### Krok 4: Gemini recenzuje — automatycznie, ~1 minuta

Komentarz na PR:

> ## 🔄 Gemini Review (iteracja 1)
>
> | Wymiar | Score | Próg | Status |
> |--------|-------|------|--------|
> | D1 Kompletność | 8.5 | 8.0 | ✅ |
> | D2 Spójność krzyżowa | 7.5 | 9.0 | ❌ |
> | D3 Poprawność | 9.0 | 9.0 | ✅ |
> | D4 Terminologia | 9.5 | 8.5 | ✅ |
> | D5 Stale refs | 10.0 | 10.0 | ✅ |
> | D6 Liczby | 0.0 | 10.0 | ❌ |
> | D7 Redakcja | 8.0 | 7.5 | ✅ |
> | D8 Audyt | 8.5 | 8.5 | ✅ |
>
> **Blocking:**
> - D2: NK-023 dodany do matrycy w C, ale brak w tabeli "Decision points"
>   w Deliverable B (sekcja 4.3, wiersz ASSIGN_EVALUATOR — brakuje NK-023 na liście).
> - D6: Dokument A mówi "23 Hard Gates" ale Normy mówią "22".
>   quality-gates.json nadal ma `hard_gates_total: 22`.
>
> **Focus instruction:**
> 1. W deliverable-b/README.md, sekcja 4.3, wiersz ASSIGN_EVALUATOR:
>    dodaj ", 023" po "NK-000, 002, 003, 004"
> 2. W WSZYSTKICH dokumentach: zmień "22 Hard Gates" na "23 Hard Gates"
> 3. W quality-gates.json: zmień hard_gates_total na 23

### Krok 5: Claude poprawia — automatycznie

Claude dostaje focus_instruction i naprawia dokładnie te 3 rzeczy.
Push na branch. Gemini review odpala się ponownie.

### Krok 6: Gemini iteracja 2

> ## ✅ Gemini Review (iteracja 2)
>
> | Wymiar | Score | Status |
> |--------|-------|--------|
> | D1 | 9.0 | ✅ |
> | D2 | 9.0 | ✅ |
> | D3 | 9.0 | ✅ |
> | D4 | 9.5 | ✅ |
> | D5 | 10.0 | ✅ |
> | D6 | 10.0 | ✅ |
> | D7 | 8.0 | ✅ |
> | D8 | 9.0 | ✅ |
>
> **APPROVED** (score: 9.2)

### Krok 7: Ty merge'ujesz

Widzisz PR na GitHubie. Czytasz diff (4 pliki, ~30 linii zmian).
Wygląda dobrze. Klikasz "Merge".

Automatycznie:
- DOCX generowany z Markdown
- Upload na Cloudflare R2
- Supabase zaktualizowany
- Portal docs odświeżony

**Czas od Issue do merge: ~15 minut. 2 iteracje. Koszt: ~$1.50.**

---

## PRZYKŁAD 2: Praca ręczna w Cursor (tryb ad-hoc)

### Sytuacja

Czytasz Policy Registry i widzisz literówkę w sekcji NK-005.
Poza tym chcesz przeformułować jeden akapit w Normach.
Nie chcesz czekać na pipeline — robisz sam.

### Krok 1: Cursor

```bash
cd certo-governance
git checkout -b fix/nk005-typo
```

Otwierasz `foundation/governance/policy-registry/README.md`.
Poprawiasz literówkę. Otwierasz `foundation/governance/normy-zewnetrzne/README.md`.
Przeformuowujesz akapit.

```bash
git add -A
git commit -m "fix: literówka NK-005 + przeformułowanie sekcji 3.2 w Normach"
git push origin fix/nk005-typo
```

Otwierasz PR na GitHubie.

### Krok 2: Gemini review odpala się automatycznie

Komentarz na PR (po ~1 minucie):

> ## ✅ Gemini Review (iteracja 1)
>
> | Wymiar | Score | Status |
> |--------|-------|--------|
> | D1 | 9.5 | ✅ |
> | D2 | 10.0 | ✅ |
> | D3 | 10.0 | ✅ |
> | D4 | 10.0 | ✅ |
> | D5 | 10.0 | ✅ |
> | D6 | 10.0 | ✅ |
> | D7 | 9.0 | ✅ |
> | D8 | 10.0 | ✅ |
>
> **APPROVED** (score: 9.8) — auto-merge eligible ✅
>
> 💡 suggestion: Sekcja 3.2 — rozważ dodanie cross-reference do Deliverable B
>    zamiast powtórzenia definicji.

Merge. Gotowe. **Czas: 3 minuty. 1 iteracja. Koszt: ~$0.15.**

---

## PRZYKŁAD 3: Złożone zadanie z wieloma iteracjami

### Sytuacja

Komisja Europejska publikuje nowy wymóg dotyczący ESG disclosure
w ratingach governance. Trzeba dodać cały nowy rozdział do Norm Zewnętrznych
i propagować zmiany do A, B, C.

### Issue

```
Tytuł: [DOC] Rozdział 4.5 — Wymogi ESG Disclosure (EU CSRD alignment)

Zadanie:
Dodać nowy rozdział 4.5 do Norm Zewnętrznych opisujący alignment
z EU Corporate Sustainability Reporting Directive (CSRD).
Wymagania: (1) mapowanie CSRD na istniejące normy ISO,
(2) nowe soft gates dla ESG disclosure, (3) wpływ na R-BOM.
```

### Przebieg (skrócony)

```
Architect SPEC:
  Złożoność: critical
  Szacowane iteracje: 8-12
  Pliki: 4 (wszystkie dokumenty)
  Pitfalls: "CSRD dotyczy spółek giełdowych — Certo ocenia governance
  szerzej. NIE ograniczaj do spółek giełdowych."

Iteracja 1: Claude pisze rozdział 4.5 w Normach.
  Gemini: D1=7.0, D2=5.0, D3=8.0 — "brak propagacji do A/B/C"

Iteracja 2: Claude dodaje soft gates NK-042/043 do Registry.
  Gemini: D2=7.0, D6=0.0 — "22 Soft Gates → 24, ale tekst mówi 22"

Iteracja 3: Claude aktualizuje liczby.
  Gemini: D2=8.0, D3=7.5 — "CSRD art. 29a wymaga double materiality,
  ale sekcja opisuje tylko single materiality"

Iteracja 4: Claude poprawia na double materiality.
  Gemini: D2=8.5, D8=7.0 — "audytor zapyta: gdzie jest mapowanie
  CSRD articles → Certo NK gates? Dodaj tabelę."

Iteracja 5: Claude dodaje tabelę mapowania.
  Gemini: D2=9.0, D7=7.0 — "sekcja 4.5 powtarza definicje z 3.4 (ISO 37301)"

Iteracja 6: Claude zamienia powtórzenia na cross-references.
  Gemini: D7=7.0 — STAGNACJA wykryta.
  "Zamiast skracać akapity, zamień sekcję 4.5.2 na tabelę
  porównawczą: CSRD article | ISO norm | Certo NK gate | Status"

Iteracja 7: Claude przerabia na tabelę.
  Gemini: D7=8.0, D8=8.5 — ✅ wszystkie powyżej progu

APPROVED po 7 iteracjach. Koszt: ~$6. Czas: ~2-3 godziny.
```

### Co widzisz na GitHubie

PR z 7 komentarzami Gemini — pełna historia jak dokument dojrzewał.
Każdy komentarz ma tabelę scores, blocking dimensions, focus instructions.
Widzisz trend: jak D2 rosło z 5.0 do 9.0 przez 7 iteracji.

Czytasz finalny diff. 4 pliki zmienione, ~120 linii.
Merge. DOCX generowane automatycznie.

---

## PRZYKŁAD 4: Kod — implementacja NK-022 (Faza 2)

### Issue

```
Tytuł: [CODE] Implementacja NK-022 Funding Independence Gate w OPA

Zadanie:
Zaimplementować regułę NK-022 w pakiecie compliance-engine.
OPA Rego rule + get_eval_context() update + API integration.
```

### Przebieg

```
Architect SPEC:
  Złożoność: high
  Pliki: 3 (rego rule, SQL function, API route)
  Must include: funding_influence_graph query, 36-month lookback,
  BLOCK/REQUIRE_DISCLOSURE logic
  Pitfall: "Graf powiązań musi sprawdzać CRBR + donations + sponsors.
  NIE buduj własnego grafu — użyj istniejącego conflict_registry."

Claude Code pisze:
  - packages/compliance-engine/rules/nk022.rego
  - packages/db/functions/get_eval_context.sql (update)
  - apps/web/api/decision-points/publish-rating.ts (update)

Red Team (Claude pentester):
  🟠 HIGH [TOCTOU] nk022.rego: sprawdza funding_links w momencie
  ewaluacji, ale graf może się zmienić między ewaluacją a COMMIT.
  → Fix: dodaj funding_graph_hash do evaluation_context i porównaj
  przy COMMIT (jak conflict_hash).

  🟡 MEDIUM [IDOR] get_eval_context.sql: brak WHERE org_id filter
  na tabeli donations. Ewaluator widzi darowizny wszystkich organizacji.
  → Fix: dodaj AND d.org_id = r.org_id

Gemini Reviewer:
  C1=8.5, C2=9.0, C3=6.0 (Red Team findings!), C4=8.0, C5=9.0, C6=7.5
  "C3 blokuje: napraw TOCTOU i IDOR z Red Team report."

Claude naprawia oba. Gemini iteracja 2:
  C1=9.0, C2=9.0, C3=9.5, C4=8.5, C5=9.0, C6=8.0
  APPROVED.

2 iteracje kodu. Koszt: ~$3. Bez Red Team byłoby 5-6 iteracji.
```

---

## PRZYKŁAD 5: Gemini łapie pułapkę reputacyjną

### Sytuacja

Ktoś tworzy Issue: "Dodaj automatyczne generowanie podsumowania ratingu przez AI".

### Co się dzieje

```
Architect SPEC:
  ⚠️ PITFALL CRITICAL: "Automatyczne generowanie podsumowania ratingu
  przez AI narusza zasadę 'Ratingu Tworzonego przez Człowieka' (§15-17 Statutu).
  AI może PRZYGOTOWAĆ draft, ale tekst MUSI być zatwierdzony przez człowieka
  PRZED publikacją. Implementacja musi zawierać human approval step."

  change_plan: dodaj AI Draft Generation z MANDATORY human approval gate

Claude implementuje z approval gate.

Gemini Review:
  D8=9.5 — "Odporność audytowa wysoka. Audytor ISO 42001 zobaczy
  wyraźny human-in-the-loop. Dobrze."
  APPROVED.
```

Gdyby nie było Architecta — Claude mógłby zaimplementować auto-generation
bez approval gate. Gemini by to złapał, ale dopiero w iteracji 3-4.
Architect łapie to PRZED pisaniem.

---

## PRZYKŁAD 6: Stagnacja i zmiana strategii

### Sytuacja

Issue: "Skróć sekcję 3 w Normach Zewnętrznych — za długa."

### Przebieg

```
Iteracja 1: Claude skraca akapity. Gemini: D7=6.5
  "Nadal za długa. Sekcja 3.2 powtarza 3.1."

Iteracja 2: Claude łączy 3.1 i 3.2. Gemini: D7=6.5
  "Połączone, ale teraz sekcja 3.1 jest chaotyczna."

Iteracja 3: Claude reorganizuje. Gemini: D7=7.0
  "Lepsza struktura, ale definicje powtórzone z sekcji 2."

Iteracja 4: Claude usuwa duplikaty. Gemini: D7=7.0
  STAGNACJA WYKRYTA (3 iteracje, score nie rośnie).

Gemini zmienia strategię:
  "NOWE PODEJŚCIE: Zamiast skracać proza, zamień sekcję 3 na tabelę
  porównawczą: Norma | Zakres | Wymaganie Certo | Status wdrożenia.
  Tabela = 20 wierszy zamiast 40 akapitów. Czytelniejsza dla audytora."

Iteracja 5: Claude przerabia na tabelę. Gemini: D7=8.5 ✅
  APPROVED.
```

Zmiana strategii po stagnacji to kluczowa różnica.
Stary pipeline powtarzałby "skróć" do iteracji 5 i eskalował.
Nowy pipeline zmienia podejście.

---

## Co widzisz w codziennej pracy

### Na GitHubie

**Issues** — lista zadań. Każdy z labelem `pipeline/doc` lub `pipeline/code`.
Po utworzeniu: komentarz Architecta (SPEC), potem komentarz "PR otwarty".

**Pull Requests** — każdy PR ma:
- Opis z tabelą agentów (Architect ✅, Producer ✅, Reviewer ⏳)
- Komentarze Gemini z tabelami scores (D1-D8 lub C1-C6)
- Trend: jak scores rosły między iteracjami
- Plik `.pipeline/spec.json` (plan Architecta)

**Actions** — logi każdego kroku (Architect, Claude, Gemini, Rework).

### Na portalu docs (Vercel)

`docs.certo.gov.pl` — lista dokumentów z statusami:
- ✅ APPROVED (zielone)
- 📝 IN_REVIEW (niebieskie) — ktoś nad tym pracuje
- 🔒 FROZEN (szare) — Statut, uchwały

Każdy dokument: renderowany Markdown + przyciski "Pobierz DOCX" / "Pobierz PDF".

Strona `/pipeline` — aktywne PR, historia review, scores.

### W Cursor

Normalnie pracujesz. `git pull`, edycja, `git push`, PR.
Gemini review odpala się automatycznie — komentarz na PR w ~1 min.
Nie musisz nic konfigurować. Gemini review działa na KAŻDYM PR
do `foundation/governance/` i `company/technical/`.

---

## Podsumowanie: kiedy co używać

| Sytuacja | Tryb | Czas | Koszt |
|----------|------|------|-------|
| Literówka, mały fix | Cursor (ręcznie) | 3 min | ~$0.15 |
| Nowa reguła NK | Pipeline (Issue) | 15-30 min | ~$1.50-3 |
| Nowy rozdział w Normach | Pipeline (Issue) | 2-3h | ~$5-7 |
| Refaktor wielu dokumentów | Pipeline (Issue) | 3-5h | ~$7-12 |
| Implementacja reguły w OPA | Pipeline (Issue, code) | 30-60 min | ~$3-5 |
| Hotfix bezpieczeństwa | Cursor (ręcznie) + merge | 10 min | ~$0.15 |

Pipeline to Twój asystent. Cursor to Twoje ręce.
Gemini pilnuje jakości w obu trybach. Architect planuje w trybie pipeline.
Ty zawsze decydujesz o merge.
