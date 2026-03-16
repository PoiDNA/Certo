# Certo Governance Pipeline — Specyfikacja Architektoniczna

## 1. Wizja

Jedno repozytorium (`certo-governance`) zawiera CAŁĄ dokumentację i kod platformy Certo.
Pipeline obsługuje dwie fazy: **dokumentację** (Faza 1) i **produkcję kodu** (Faza 2).

```
GitHub Issue (zadanie)
    ↓
Claude Code (realizacja)
    ↓
Gemini 2.5 Pro (review automatyczny w CI)
    ↓  ← pętla aż do APPROVED
Pull Request → merge → deploy
```

## 2. Struktura repozytorium

```
certo-governance/
│
├── foundation/                    # FUNDACJA CERTO
│   ├── frozen/                    # 🔒 Dokumenty niezmienne (branch protection)
│   │   ├── statut/                #    Statut v17 + kolejne wersje
│   │   ├── uchwaly/               #    Uchwały organów
│   │   └── akty-zalozycielskie/   #    Dokumenty założycielskie
│   ├── governance/                # 📝 Dokumenty żywe (pipeline operuje)
│   │   ├── normy-zewnetrzne/      #    Normy Zewnętrzne v2.1+
│   │   ├── policy-registry/       #    Policy Registry (Deliverable A)
│   │   └── metodologia/           #    Metodologia Certo Score
│   └── compliance/                # 📋 Polityki compliance (AI Policy, AML, etc.)
│
├── company/                       # SPÓŁKA CERTO ID PSA
│   ├── frozen/                    # 🔒 Umowa spółki, dokumenty korporacyjne
│   ├── technical/                 # 📝 Dokumentacja techniczna (żywa)
│   │   ├── deliverable-b/         #    Specyfikacja Techniczna
│   │   ├── deliverable-c/         #    Diagramy Procesów
│   │   └── adr/                   #    Architecture Decision Records
│   ├── platform/                  # 💻 Kod platformy Certo Online (Faza 2)
│   │   ├── apps/web/              #    Next.js app
│   │   └── packages/              #    compliance-engine, db, shared
│   └── operations/                # 🔧 Dokumentacja operacyjna
│
├── pipeline/                      # ⚙️ Silnik pipeline
│   ├── agents/                    #    Claude worker, Gemini reviewer
│   ├── templates/                 #    Prompty dla agentów
│   └── prompts/                   #    Konteksty systemowe
│
├── docs-portal/                   # 🌐 Portal dokumentacji (Next.js na Vercel)
│   ├── app/                       #    App Router
│   ├── components/                #    Komponenty UI
│   └── lib/                       #    Utilities, Supabase client
│
└── seeds/                         # 🌱 Dokumenty startowe (DOCX z Sprint 0)
```

## 3. Zasady dokumentów

### 3.1 Frozen (zamrożone)
- `foundation/frozen/` i `company/frozen/`
- **CODEOWNERS**: wymagają approval od `@poi` (Fundator)
- Branch protection: żaden CI/CD nie modyfikuje
- Zmiana = nowa wersja pliku (np. `statut-v18.md`), nie edycja starego
- Format: Markdown (source of truth) + wygenerowany DOCX/PDF

### 3.2 Live (żywe)
- `foundation/governance/`, `company/technical/`, `company/platform/`
- Pipeline może modyfikować przez PR
- Gemini musi zatwierdzić przed merge
- Każda zmiana generuje nowy DOCX/PDF automatycznie
- Format: Markdown → DOCX (pandoc) → PDF (optional)

### 3.3 Format dokumentów
- **Source of truth**: Markdown w Git (diffable, mergeable)
- **Generowane artefakty**: DOCX + PDF (przez CI/CD, Cloudflare R2 / Supabase Storage)
- **Metadane**: frontmatter YAML w każdym .md (version, status, author, reviewed_by)

```yaml
---
id: deliverable-b
title: "Specyfikacja Techniczna Compliance Engine"
version: "2.0"
status: "APPROVED"  # DRAFT | IN_REVIEW | APPROVED | FROZEN
entity: "company"   # foundation | company
category: "technical"
last_reviewed: "2026-03-16"
reviewed_by: "gemini-2.5-pro"
approver: "poi"
---
```

## 4. Pipeline Flow

### 4.1 Trigger: GitHub Issue

```yaml
# .github/ISSUE_TEMPLATE/doc-task.yml
name: "📝 Document Task"
labels: ["pipeline/doc"]
body:
  - type: textarea
    id: task
    label: "Zadanie"
    description: "Co Claude Code ma zrobić?"
  - type: dropdown
    id: target
    label: "Dokument docelowy"
    options:
      - foundation/governance/normy-zewnetrzne
      - foundation/governance/policy-registry
      - company/technical/deliverable-b
      - company/technical/deliverable-c
      - company/technical/adr
```

### 4.2 Faza 1: Claude realizuje zadanie

```
1. GitHub Action wykrywa Issue z labelem `pipeline/doc`
2. Tworzy branch: `pipeline/doc-{issue_number}`
3. Uruchamia Claude Code z kontekstem:
   - Treść Issue (zadanie)
   - Aktualny stan dokumentu (z repo)
   - System prompt z pipeline/prompts/
   - Kontekst powiązanych dokumentów (cross-refs)
4. Claude produkuje zmiany w Markdown
5. CI generuje DOCX/PDF z Markdown (pandoc)
6. Push na branch → otwiera PR
```

### 4.3 Faza 2: Gemini review

```
1. PR otwarte → GitHub Action triggeruje Gemini review
2. Gemini 2.5 Pro otrzymuje:
   - Diff (co się zmieniło)
   - Pełny dokument po zmianach
   - Cross-reference z powiązanymi dokumentami
   - Review prompt z pipeline/templates/
3. Gemini zwraca:
   - APPROVED / CHANGES_REQUESTED
   - Lista uwag (jako PR comments)
   - Spójność z innymi dokumentami (cross-check)
4. Jeśli CHANGES_REQUESTED:
   - Claude Code otrzymuje feedback
   - Iteruje na branchu
   - Ponowny Gemini review
5. Jeśli APPROVED:
   - PR auto-merge (jeśli włączone) lub czeka na human approval
   - Artefakty DOCX/PDF uploadowane do storage
   - Supabase metadata zaktualizowane
   - Docs portal odświeżony (ISR/revalidate)
```

### 4.4 Pętla iteracyjna

```
┌─────────────────────────────────────────────┐
│  Issue created                              │
│     ↓                                       │
│  Claude Code → branch + PR                  │
│     ↓                                       │
│  Gemini Review                              │
│     ↓                                       │
│  ┌── APPROVED → merge → deploy              │
│  └── CHANGES_REQUESTED                      │
│        ↓                                    │
│     Claude Code (z feedback Gemini)         │
│        ↓                                    │
│     Push → Gemini Review (loop)             │
│        ↓                                    │
│     Max 5 iteracji → human escalation       │
└─────────────────────────────────────────────┘
```

## 5. Stack technologiczny

| Komponent | Technologia | Cel |
|-----------|-------------|-----|
| Repo | GitHub | Source of truth |
| CI/CD | GitHub Actions | Orchestracja pipeline |
| Producer | Claude Code (API) | Generowanie docs/kodu |
| Reviewer | Gemini 2.5 Pro (API) | Automatyczny review |
| Ad-hoc | Cursor + Claude | Praca ręczna developera |
| External | GPT-4o (manual) | Analizy zewnętrzne (bez repo access) |
| UI | Next.js (Vercel) | Portal dokumentacji |
| DB | Supabase | Metadata, review history, pipeline state |
| Storage | Cloudflare R2 | DOCX/PDF artifacts |
| Conversion | Pandoc (w CI) | Markdown → DOCX/PDF |
| DNS/CDN | Cloudflare | docs.certo.gov.pl |

## 6. Supabase Schema

```sql
-- Dokumenty
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- 'deliverable-b'
  title TEXT NOT NULL,
  entity TEXT NOT NULL,                -- 'foundation' | 'company'
  category TEXT NOT NULL,              -- 'governance' | 'technical' | 'frozen'
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  markdown_path TEXT NOT NULL,         -- 'company/technical/deliverable-b/README.md'
  docx_url TEXT,                       -- R2 URL
  pdf_url TEXT,                        -- R2 URL
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,                    -- 'gemini-2.5-pro' | 'poi'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historia review
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  pr_number INTEGER,
  reviewer TEXT NOT NULL,              -- 'gemini-2.5-pro'
  decision TEXT NOT NULL,              -- 'APPROVED' | 'CHANGES_REQUESTED'
  comments JSONB,
  iteration INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline state
CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number INTEGER NOT NULL,
  branch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING', -- RUNNING | REVIEWING | APPROVED | FAILED
  phase TEXT NOT NULL,                    -- 'doc' | 'code'
  iterations INTEGER DEFAULT 0,
  max_iterations INTEGER DEFAULT 5,
  claude_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  gemini_model TEXT DEFAULT 'gemini-2.5-pro',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

## 7. Docs Portal (Next.js)

### Architektura
- **ISR** (Incremental Static Regeneration): strony generowane statycznie, rewalidowane po merge
- **Supabase** jako backend: lista dokumentów, metadane, statusy
- **R2/Supabase Storage**: download DOCX/PDF
- **MDX rendering**: dokumenty renderowane bezpośrednio z Markdown w repo

### Strony
- `/` — Dashboard: lista wszystkich dokumentów z statusami
- `/documents/[slug]` — Pojedynczy dokument (renderowany MDX + download buttons)
- `/pipeline` — Status pipeline (aktywne PR, review history)
- `/api/documents` — API endpoint dla listy dokumentów
- `/api/documents/[slug]/download` — Redirect do R2 URL (DOCX/PDF)

### Rewalidacja
```typescript
// Po merge PR → webhook → revalidate
export async function POST(req: Request) {
  const { slug } = await req.json();
  revalidatePath(`/documents/${slug}`);
  return Response.json({ revalidated: true });
}
```

## 8. Konfiguracja GitHub

### Branch Protection (main)
- Require PR review (1 approval minimum)
- Require status checks: `gemini-review`, `build`
- No direct push
- `CODEOWNERS` for frozen docs

### CODEOWNERS
```
# Frozen docs — require human approval
/foundation/frozen/  @poi
/company/frozen/     @poi

# Live docs — pipeline can propose, human approves
/foundation/governance/  @poi
/company/technical/      @poi

# Platform code — standard review
/company/platform/       @poi
```

## 9. Koszt miesięczny (szacunek)

| Komponent | Koszt |
|-----------|-------|
| GitHub (Pro) | $4/mies. |
| Vercel (Pro) | $20/mies. |
| Supabase (Free/Pro) | $0-25/mies. |
| Cloudflare R2 (storage) | ~$1/mies. |
| Claude API (pipeline) | ~$10-30/mies. |
| Gemini API (review) | ~$5-15/mies. |
| **TOTAL** | **~$40-95/mies.** |

## 10. Kolejność implementacji

### Sprint 0 (ten tydzień)
1. ✅ Inicjalizacja repo + struktura
2. ✅ Seed: wgranie 4 dokumentów Sprint 0 (MD + DOCX)
3. ✅ GitHub Actions: Gemini review workflow
4. ✅ Pipeline engine: gemini-reviewer.ts
5. ✅ Docs portal: basic Next.js z listą dokumentów

### Sprint 1
6. GitHub Actions: Claude Code task executor
7. Issue templates
8. Supabase schema + API
9. DOCX/PDF generation w CI (pandoc)
10. Docs portal: download, search, status

### Sprint 2
11. Claude Code ↔ Gemini loop (pełna automatyzacja)
12. Cross-document verification w Gemini review
13. Pipeline dashboard
14. Webhook: merge → revalidate portal
