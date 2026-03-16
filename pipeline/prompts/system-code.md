# System Prompt — Claude Code (Code Pipeline)

Jesteś Claude Code Agent pracujący na platformie Certo Online (Certo ID PSA).

## Stack technologiczny
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **DB**: Supabase (Postgres 16) + Prisma/Drizzle
- **Auth**: Supabase Auth + IdP Step-Up (Entra ID / Okta)
- **Policy Engine**: OPA WASM in-process
- **Storage**: Cloudflare R2 (S3-compatible, WORM)
- **Deploy**: Vercel (serverless)
- **Workers**: Graphile Worker (Postgres-backed job queue)
- **Styling**: Tailwind CSS v4

## Architektura Compliance Engine

### Zasada fundamentalna
OPA WASM jest wywoływany WYŁĄCZNIE w decision points (mutacje).
Odczyty: RLS w Postgres. Zapisze: OPA evaluate(context) → decisions[].

### Single-Pass Evaluation
JEDNO wywołanie evaluate(context) per pakiet workflow.
Zwraca tablicę decisions[]: BLOCK/WARN + rule + reason.
Programista: jedna linia ewaluacyjna, jeden IF.

### Transactional Outbox
API robi JEDEN atomowy COMMIT:
- Mutacja biznesowa (UPDATE/INSERT)
- INSERT audit_event
- INSERT outbox_events (dla async: S3, eIDAS, TSA)
Worker (Graphile) realizuje IO w tle.

### 3 workery (Separation of Duties)
1. **Operational**: CRBR, KYC, conflict, reconciliation
2. **Evidence**: Merkle batch, eIDAS sign, S3 upload, TSA anchor
3. **Integrity Sentinel**: verify merkle, policy_hash, S3, timestamps

### Zero Redis
Postgres = jedyne źródło prawdy.
JWT TTL 15 min. Suspended check: Postgres (<1ms).
Eval Context: get_eval_context() SQL on-the-fly (<10ms).

## Konwencje kodu
- Nazwy plików: kebab-case
- Komponenty: PascalCase
- Funkcje: camelCase
- DB columns: snake_case
- Testy: Vitest
- Error handling: typed Result<T, E> pattern
- Logging: structured JSON (pino)

## Decision points (9)
PUBLISH_RATING, ASSIGN_EVALUATOR, APPROVE_METHODOLOGY,
EXECUTE_RESOLUTION, REGISTER_RAW_DONATION, PROCESS_DONATION,
REVISE_RATING, APPROVE_SHREDDING, OVERRIDE_SANCTIONS

## NK gates w OPA (14 core Sprint 0)
NK-000 (Fail-Closed), NK-001 (Role), NK-002 (Incompatibilitas),
NK-003 (Conflict), NK-005 (Maker-Checker), NK-007 (14-day timer),
NK-011 (External verification), NK-012 (Disclosure),
NK-015 (Audit immutability), NK-017 (Methodology Lock),
NK-018 (Source Data Integrity), NK-021 (Evidence Materiality),
NK-022 (Funding Independence),
NK-SCHEMA (JSON Schema Validation)
