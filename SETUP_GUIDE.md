# SETUP GUIDE + Normy vs Pipeline

## CZĘŚĆ 1: Czy normy wymagają specjalnego procesu PRZED certyfikacją?

### Krótka odpowiedź

**TAK** — ale nie tak jak myślisz. Normy nie wymagają certyfikatu żeby obowiązywały.
Wymagają **dowodów działania (records)** od pierwszego dnia. Certyfikat to tylko
formalne potwierdzenie, że te dowody istnieją i są spójne.

### Co to oznacza praktycznie

```
Dzień 0 ────────────── Miesiąc 6 ──────────── Miesiąc 12+
│                       │                       │
│ System działa         │ Audyt wewnętrzny      │ Audyt certyfikacyjny
│ Records gromadzone    │ Przegląd zarządzania  │ Certyfikat ISO
│ Pipeline produkuje    │ Korekty               │
│ dowody automatycznie  │                       │
```

Audytor certyfikacyjny (TÜV, BSI, DNV) zapyta o **minimum 3-6 miesięcy records**.
Jeśli od dnia zero pipeline produkuje te records automatycznie — certyfikacja
to formalność. Jeśli nie — trzeba je odtwarzać wstecz, co jest kosztowne i podejrzane.

### Co konkretnie normy wymagają od pipeline

#### ISO 9001 (Jakość) — Document Control

| Wymóg | Nasz pipeline | Record |
|-------|--------------|--------|
| Dokumenty muszą mieć wersję | Git commit hash + frontmatter version | ✅ automatycznie |
| Zmiany muszą być przeglądane | Gemini review + human approval na PR | ✅ automatycznie |
| Musi być ślad zatwierdzenia | GitHub PR merge (kto, kiedy, co) | ✅ automatycznie |
| Nieaktualne dokumenty nie mogą być używane | `status: APPROVED` w frontmatter, portal wyświetla tylko APPROVED | ✅ automatycznie |
| Musi być lista dystrybucji | Docs portal (publiczny) + Git access log | ✅ automatycznie |

**Pipeline spełnia ISO 9001 Document Control od dnia zero.**

#### ISO 27001 (Bezpieczeństwo) — Change Management

| Wymóg | Nasz pipeline | Record |
|-------|--------------|--------|
| Zmiany w systemie muszą być kontrolowane | Branch protection, PR required, CODEOWNERS | ✅ |
| Musi być ocena ryzyka zmiany | Gemini review (severity: critical/major/minor) | ✅ |
| Musi być rollback plan | Git revert, Vercel rollback | ✅ |
| Musi być separation of duties | Claude produkuje, Gemini recenzuje, human zatwierdza | ✅ |
| Access control do kodu | GitHub teams + CODEOWNERS | ✅ |
| Audit trail zmian | Git log + Supabase reviews table | ✅ |

**Pipeline spełnia ISO 27001 A.8 (Change Management) od dnia zero.**

#### ISO 37301 (Compliance) — Monitoring & Measurement

| Wymóg | Nasz pipeline | Record |
|-------|--------------|--------|
| Compliance musi być monitorowane | Gemini cross-doc check (51 konceptów) | ✅ |
| Niespójności muszą być wykrywane | staleReferences + numbersCheck w review | ✅ |
| Musi być eskalacja | Max 5 iteracji → human escalation | ✅ |
| Musi być przegląd okresowy | Pipeline dashboard + review history w Supabase | ✅ |

#### ISO 42001 (AI) — AI Governance

| Wymóg | Nasz pipeline | Record |
|-------|--------------|--------|
| AI musi być pod kontrolą człowieka | Claude produkuje, human zatwierdza PR | ✅ |
| Decyzje AI muszą być wyjaśnialne | Gemini review JSON (score, comments, reasons) | ✅ |
| AI nie może samodzielnie zmieniać systemu | Branch protection: merge wymaga human approval | ✅ |
| Musi być ślad użycia AI | pipeline_runs table (claude_model, gemini_model) | ✅ |

### Wniosek: buduj pipeline tak, jakbyś był już certyfikowany

Nie dlatego że musisz — ale dlatego że:
1. **Records gromadzą się od dnia zero** (audytor zobaczy 6+ miesięcy historii)
2. **Nie musisz nic zmieniać przed certyfikacją** (pipeline = compliance-by-design)
3. **Certo ocenia governance innych** — jeśli sam nie ma porządku, to hipokryzja

### Jedna dodatkowa rzecz do dodania w pipeline

Normy wymagają **przeglądu zarządzania (Management Review)** minimum raz na rok.
Dodaj do pipeline kwartalny Issue automatyczny:

```yaml
# .github/workflows/quarterly-review.yml
name: "📋 Quarterly Management Review"
on:
  schedule:
    - cron: "0 9 1 1,4,7,10 *"  # 1 stycznia, kwietnia, lipca, października
jobs:
  create-review-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Create review Issue
        run: |
          gh issue create \
            --title "📋 Przegląd zarządzania Q$(date +%q) $(date +%Y)" \
            --body "## Kwartalny przegląd zarządzania (ISO 9001, 37301)
          
          ### Checklist
          - [ ] Przegląd pipeline: ile PR, ile iteracji, ile eskalacji
          - [ ] Przegląd dokumentów: które wymagają aktualizacji
          - [ ] Przegląd reguł NK: czy Policy Registry jest aktualny
          - [ ] Przegląd incydentów: Break-Glass usage, audit alerts
          - [ ] Decyzja: zmiany w następnym kwartale
          
          ### Uczestnicy
          - Zarząd Fundacji Certo
          - CTO Spółki Certo ID
          - Przewodniczący Izby Nadzoru (opcjonalnie)
          
          **Termin:** 14 dni od utworzenia Issue." \
            --label "management-review"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## CZĘŚĆ 2: Jak postawić pipeline — krok po kroku

### Wymagania wstępne

- Konto GitHub (Pro: $4/mies.)
- Konto Vercel (Pro: $20/mies.)
- Konto Supabase (Free tier wystarczy na start)
- Konto Cloudflare (Free tier + R2)
- Klucz API Anthropic (Claude)
- Klucz API Google AI (Gemini 2.5 Pro)

### Szacowany czas: 2-3 godziny

---

### KROK 1: GitHub — Repozytorium (15 min)

```bash
# 1. Rozpakuj repo
unzip certo-governance-repo.zip
cd certo-governance

# 2. Git init
git init
git add -A
git commit -m "initial: pipeline + docs portal + Sprint 0 seeds"

# 3. Stwórz repo na GitHub
# Idź na github.com → New repository
# Nazwa: certo-governance
# Visibility: Private (na start)
# NIE inicjalizuj README (już mamy)

# 4. Push
git remote add origin git@github.com:TWOJA_ORG/certo-governance.git
git branch -M main
git push -u origin main
```

### KROK 2: GitHub — Branch Protection (5 min)

```
GitHub → Settings → Branches → Add rule

Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale PR reviews when new commits are pushed
✅ Require status checks to pass before merging
  → (dodaj później po pierwszym PR: "gemini-review")
✅ Require conversation resolution before merging
❌ Allow force pushes (NIGDY)
❌ Allow deletions (NIGDY)
```

### KROK 3: GitHub — Secrets (5 min)

```
GitHub → Settings → Secrets and variables → Actions → New repository secret

Dodaj:
  ANTHROPIC_API_KEY    = sk-ant-api03-...
  GEMINI_API_KEY       = AIza...
  SUPABASE_URL         = https://xxx.supabase.co
  SUPABASE_SERVICE_KEY = eyJ...
  R2_ACCESS_KEY_ID     = (z kroku 6)
  R2_SECRET_ACCESS_KEY = (z kroku 6)
  R2_ENDPOINT          = https://xxx.r2.cloudflarestorage.com
  R2_PUBLIC_URL        = https://docs-assets.certo.gov.pl (lub R2 public URL)
  VERCEL_DEPLOY_HOOK   = (z kroku 5)
```

### KROK 4: Supabase — Baza danych (15 min)

```
1. supabase.com → New Project
   Nazwa: certo-governance
   Region: eu-central-1 (Frankfurt)
   Password: (zapisz)

2. SQL Editor → Paste treść z:
   supabase/migrations/001_initial.sql
   → Run

3. Sprawdź:
   Table Editor → documents → 5 rekordów (seeds)

4. Skopiuj:
   Settings → API:
   - Project URL → SUPABASE_URL
   - anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key → SUPABASE_SERVICE_KEY
```

### KROK 5: Vercel — Docs Portal (15 min)

```
1. vercel.com → Add New Project → Import Git Repository
   → certo-governance

2. Framework Preset: Next.js
   Root Directory: docs-portal     ← WAŻNE!
   Build Command: (default)
   Output Directory: (default)

3. Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_KEY = eyJ...

4. Deploy → czekaj ~2 min

5. Po deployu:
   Settings → Git → Deploy Hooks
   → Create Hook: "Pipeline trigger"
   → Skopiuj URL → to jest VERCEL_DEPLOY_HOOK (do GitHub Secrets)

6. Opcjonalnie: Custom domain
   Settings → Domains → docs.certo.gov.pl
   → Dodaj CNAME w Cloudflare DNS
```

### KROK 6: Cloudflare R2 — Storage (10 min)

```
1. Cloudflare Dashboard → R2 → Create Bucket
   Nazwa: certo-docs
   Region: EEUR (Europe)

2. R2 → Manage R2 API Tokens → Create API Token
   Permissions: Object Read & Write
   Bucket: certo-docs
   → Skopiuj Access Key ID + Secret Access Key

3. (Opcjonalnie) Public access:
   Bucket → Settings → Public Access → Enable
   Custom domain: docs-assets.certo.gov.pl
   → Dodaj CNAME w Cloudflare DNS

4. Wrzuć seedy ręcznie (jednorazowo):
   R2 Dashboard → certo-docs → Upload
   → Wgraj 4 pliki DOCX z seeds/

5. Zaktualizuj Supabase:
   SQL Editor:
   UPDATE documents SET docx_url = 'https://docs-assets.certo.gov.pl/Certo_Normy_Zewnetrzne_FINAL.docx'
   WHERE slug = 'normy-zewnetrzne';
   -- (powtórz dla pozostałych 3)
```

### KROK 7: Pipeline — Instalacja zależności (5 min)

```bash
# Na lokalnej maszynie (Cursor)
cd certo-governance/pipeline
npm install

cd ../docs-portal
npm install

# Test lokalny docs-portal
npm run dev
# Otwórz http://localhost:3000
```

### KROK 8: Pierwszy test pipeline (15 min)

```
1. GitHub → Issues → New Issue
   Użyj template: "📝 Document Task"

   Tytuł: [DOC] Dodaj sekcję o Certo Vector do Policy Registry
   Zadanie: Dodaj krótki opis systemu Certo Vector (5 stanów: ++/+/brak/-/--) 
            w sekcji 1 Policy Registry jako kontekst dla reguł NK.
   Dokument docelowy: foundation/governance/policy-registry
   Priorytet: 🟡 Normal

2. Dodaj label: pipeline/doc
   → GitHub Action "Claude Task Executor" uruchomi się automatycznie

3. Obserwuj:
   Actions tab → "🤖 Claude Task Executor" → logi
   → Claude tworzy branch, modyfikuje README.md, otwiera PR

4. PR otwarty → automatycznie uruchamia się:
   Actions tab → "🔍 Gemini Review"
   → Gemini komentuje na PR: APPROVED lub CHANGES_REQUESTED

5. Jeśli CHANGES_REQUESTED:
   → "🔄 Claude Rework" uruchamia się automatycznie
   → Claude poprawia → push → Gemini review (pętla)

6. Jeśli APPROVED:
   → Ty (human) robisz merge PR
   → "📄 Generate Artifacts" uruchamia się
   → DOCX generowany, uploadowany na R2
   → Supabase zaktualizowany
   → Vercel revalidated
   → Docs portal pokazuje nową wersję
```

### KROK 9: Konfiguracja Cursor (ad-hoc) (5 min)

```
W Cursor (VS Code):
1. Otwórz folder certo-governance/
2. Terminal: git pull origin main (zawsze przed pracą)
3. Pracujesz normalnie — tworzysz branch, edytujesz, push, PR
4. Gemini review uruchomi się automatycznie na Twoim PR
5. Merge po APPROVED

Cursor + Claude Code działa RÓWNOLEGLE z pipeline:
- Pipeline: automatyczne zadania (Issues)
- Cursor: ręczna praca developera
Oba używają tego samego repo i branch protection.
```

### KROK 10: Monitoring (ongoing)

```
1. Docs portal → /pipeline — status aktywnych zadań i review history
2. GitHub Actions → historia uruchomień
3. Supabase → Table Editor → reviews — pełna historia recenzji Gemini
4. Kwartalny Management Review (automatyczny Issue)
```

---

## PODSUMOWANIE: Checklist uruchomienia

| # | Krok | Czas | Status |
|---|------|------|--------|
| 1 | GitHub: repo + push | 15 min | ⬜ |
| 2 | GitHub: branch protection | 5 min | ⬜ |
| 3 | GitHub: secrets (7 kluczy) | 5 min | ⬜ |
| 4 | Supabase: projekt + migracja SQL | 15 min | ⬜ |
| 5 | Vercel: deploy docs-portal | 15 min | ⬜ |
| 6 | Cloudflare R2: bucket + seedy | 10 min | ⬜ |
| 7 | Lokalnie: npm install + test | 5 min | ⬜ |
| 8 | Pierwszy test: Issue → Claude → Gemini → merge | 15 min | ⬜ |
| 9 | Cursor: konfiguracja ad-hoc | 5 min | ⬜ |
| 10 | Kwartalny review workflow | 2 min | ⬜ |
| | **TOTAL** | **~90 min** | |

## Koszt miesięczny

| Komponent | Koszt | Tier |
|-----------|-------|------|
| GitHub Pro | $4 | Pro |
| Vercel | $20 | Pro |
| Supabase | $0 | Free (do 500MB) |
| Cloudflare R2 | ~$0.50 | Pay-as-you-go |
| Claude API | ~$10-30 | Per usage |
| Gemini API | ~$5-15 | Per usage |
| **TOTAL** | **~$40-70/mies.** | |
