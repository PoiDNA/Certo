# Projekt Certo — Claude Code Context

## Czym jest Certo
Europejski ekosystem ratingowy oceniający jakość zarządzania (governance)
w sektorze publicznym, korporacyjnym, medycznym, obronnym i pozarządowym.

Dwa podmioty:
- **Fundacja Certo Governance Institute** — niezależny organ ratingowy, właściciel metodologii
- **Certo ID PSA** — komercyjny operator technologiczny, utrzymuje systemy IT

## Repo
github.com/PoiDNA/Certo (monorepo)

## Struktura monorepo
foundation/platform/apps/web   → certogov.org
company/platform/apps/web      → certo.id
consulting/platform/apps/web   → certo.consulting
packages/i18n                  → shared i18n (24 języki UE)
packages/i18n/messages/        → pl.json (source), en.json + 22 języki (auto)
packages/i18n/scripts/         → translate.ts (Claude API pipeline)
.github/workflows/             → translate.yml (auto-tłumaczenie po commicie)

## Stack
Next.js 15, TypeScript, React 19, Supabase, Vercel, Cloudflare, next-intl, Turborepo

## Domeny
certogov.org          → Fundacja
certogov.com          → redirect → certogov.org
certo.org.pl          → redirect → certogov.org
certo.id              → Certo ID PSA
certo.consulting      → Portal doradców
certodelegate.com     → System delegatów AI
auth.certogov.org     → Supabase
auth.certo.id         → Supabase
auth.certo.consulting → Supabase

## i18n
24 języki UE: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv
Domyślny: pl (certogov.org), en (certo.id), pl (certo.consulting)
localePrefix: always → /pl/, /en/, /de/
Auto-tłumaczenie: Claude API po commicie pl.json

## Terminologia zastrzeżona — nigdy nie tłumacz
Rating Certo, Certo Score, Certo Vector, Certo Delegate, Delegate ID,
Certo Accord, Certo Action, Certo Advisor, Certo Index, Certo Online,
CertoGov, Certo Governance Institute, Certo ID, Certo Consulting,
Dual-Brain Engine, Compliance Engine, Break-Glass Protocol, Hard Gates, Trust Badge Certo

## Aktywne problemy
- [ ] 404 na certogov.org/pl i /en — dodać generateStaticParams w [locale]/layout.tsx i page.tsx
- [ ] ANTHROPIC_API_KEY dodać do GitHub Secrets → uruchomi translation pipeline
- [ ] Lokalne messages/ per serwis nie są tłumaczone przez pipeline

## GitHub Secrets wymagane
ANTHROPIC_API_KEY → tłumaczenia przez Claude API

## Zasady
- Hotfixy → commit na main
- Features → PR
- Nazewnictwo: certogov.org (NIE certo.org.pl)
- Fundacja = "Fundacja Certo Governance Institute" (NIE "Fundacja CGI")
- Pełne ścieżki w komendach

## Historia PR
PR #5 certo.id i18n ✅
PR #6 certo.consulting i18n ✅
PR #7 translation pipeline DeepL ✅ closed
PR #8 parcel/watcher fix ✅
PR #9 Next.js RC→stable ✅
PR Claude translation pipeline → do merge
