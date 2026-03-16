# Certo Governance

Jedno repozytorium dla całej dokumentacji i kodu platformy Certo Governance Institute.

## Struktura

| Folder | Zawartość | Właściciel |
|--------|-----------|------------|
| `foundation/` | Dokumenty Fundacji Certo (Statut, Normy, Policy Registry) | Fundacja |
| `company/` | Dokumenty i kod Spółki Certo ID PSA (Deliverables, platforma) | Spółka |
| `pipeline/` | Silnik pipeline (Claude Code + Gemini Review) | DevOps |
| `docs-portal/` | Portal dokumentacji (Next.js na Vercel) | DevOps |
| `seeds/` | Dokumenty startowe Sprint 0 (DOCX) | — |

## Pipeline

```
GitHub Issue (zadanie)
    ↓
Claude Code (realizacja na branchu)
    ↓
Gemini 2.5 Pro (automatyczny review w CI)
    ↓ ← pętla aż do APPROVED (max 5 iteracji)
PR merge → DOCX/PDF → docs portal
```

## Quick Start

```bash
# Docs portal
cd docs-portal && npm install && npm run dev

# Pipeline (review)
cd pipeline && npm install && npm run review
```

## Dokumenty Sprint 0

- **Normy Zewnętrzne v2.1+** — model instytucjonalny
- **Policy Registry v2.0** — 22 Hard Gates, 22 Soft Gates
- **Deliverable B v2.0** — Specyfikacja Techniczna (7 ADR, 13 tabel DB)
- **Deliverable C v1.0** — 7 Workflowów z bramkami NK

## Licencja

Proprietary — Fundacja Certo Governance Institute
