# SPEC OD ARCHITECTA — realizuj dosłownie

**Złożoność:** high
**Szacowane iteracje:** 3
**Pliki do edycji:** company/technical/deliverable-b/README.md, company/technical/deliverable-c/README.md, pipeline/config/quality-gates.json, SETUP_GUIDE.md

## Efekty drugiego rzędu (WAŻNE)
- ⚠️ Dodanie nowego ADR-008 zwiększa ich liczbę z 7 do 8, co wymaga aktualizacji `quality-gates.json`.
- ⚠️ Wprowadzenie tożsamości użytkownika (JWT) wpłynie na schematy baz danych (audyt) i logikę punktów decyzyjnych.
- ⚠️ Nowy współdzielony pakiet `foundation/platform/packages/auth/` staje się nową zależnością dla aplikacji webowych.

## Plan zmian

### company/technical/deliverable-b/README.md
Akcja: add_section
Lokalizacja: W sekcji z listą Architecture Decision Records, po ostatnim istniejącym ADR (prawdopodobnie ADR-007).
Spec: Dodaj nowy Architecture Decision Record (ADR-008) dotyczący centralnej autoryzacji. Tytuł: 'ADR-008: Centralized Authentication using Supabase Auth'. Użyj standardowego formatu ADR: Status (np. 'Proposed'), Kontekst (potrzeba jednego, bezpiecznego mechanizmu logowania dla ekosystemu Certo), Decyzja (wybór Supabase Auth, OAuth2 z Google/Microsoft, stworzenie współdzielonego pakietu `@certo/auth` w `foundation/platform/packages/auth/`, przepływ tokenu JWT), Konsekwencje (propagacja JWT do backendu, konieczność rozszerzenia schematów DB o `user_id` dla celów audytowych, ochrona routów w aplikacjach Next.js za pomocą middleware). Zaktualizuj również podsumowanie na początku dokumentu, aby odzwierciedlało 8 ADR, a nie 7.
MUSI zawierać: ADR-008, Supabase Auth, OAuth 2.0, JWT, shared package, user identity propagation, audit trail
NIE MOŻE zawierać: szczegóły implementacji UI (np. wygląd przycisków), konkretne klucze API, Redis, sidecar

### company/technical/deliverable-c/README.md
Akcja: update_section
Lokalizacja: Na początku sekcji opisującej workflowy (W1-W7), przed opisem pierwszego workflow.
Spec: Dodaj nowy akapit wyjaśniający, że wszystkie workflowy inicjowane przez użytkownika w interfejsach webowych są poprzedzone obowiązkowym krokiem uwierzytelnienia i autoryzacji. Podkreśl, że tożsamość zalogowanego użytkownika jest bezpiecznie powiązana z każdą transakcją i zapisywana w logu audytowym. Dodaj odnośnik do ADR-008 w 'Deliverable B' dla szczegółów technicznych.
MUSI zawierać: prerequisite, authentication, user identity, audit log, cross-reference to ADR-008
NIE MOŻE zawierać: zmiana kroków wewnątrz istniejących workflowów W1-W7, szczegółowy opis techniczny przepływu OAuth

### pipeline/config/quality-gates.json
Akcja: update_value
Lokalizacja: Wewnątrz obiektu `architecture_state`.
Spec: Zmień wartość klucza `adr_count` z `7` na `8`.
MUSI zawierać: "adr_count": 8
NIE MOŻE zawierać: zmiana jakichkolwiek innych wartości liczbowych w `architecture_state`

### SETUP_GUIDE.md
Akcja: add_section
Lokalizacja: Po sekcji dotyczącej konfiguracji bazy danych, a przed sekcją o uruchamianiu aplikacji.
Spec: Dodaj nową sekcję '## Konfiguracja Autoryzacji (Supabase)'. W tej sekcji: 1. Wylistuj wymagane zmienne środowiskowe w formacie tabeli: `FOUNDATION_SUPABASE_URL`, `FOUNDATION_SUPABASE_ANON_KEY`, `CERTOID_SUPABASE_URL`, `CERTOID_SUPABASE_ANON_KEY`. 2. Dodaj instrukcję krok po kroku (lista numerowana) jak skonfigurować dostawców OAuth (Google, Microsoft) w panelu Supabase. 3. Wyraźnie wskaż, że należy dodać dwa Redirect URLs dla każdej aplikacji: `https://certo.org.pl/auth/callback` i `https://certo.id/auth/callback` (lub ich lokalne odpowiedniki dla deweloperów, np. `http://localhost:3000/auth/callback`).
MUSI zawierać: environment variables, Supabase dashboard, OAuth providers, Redirect URLs, step-by-step guide
NIE MOŻE zawierać: konkretne wartości sekretów lub kluczy, instrukcje zakładania konta Supabase od zera

## Cross-doc checklist (sprawdź PO zmianach)
- [ ] Deliverable B: Nowy ADR-008 został dodany, a liczba ADR w podsumowaniu zaktualizowana do 8.
- [ ] Deliverable C: Dodano wzmiankę o autoryzacji jako warunku wstępnym dla workflowów, z poprawnym odnośnikiem do ADR-008.
- [ ] quality-gates.json: Wartość `architecture_state.adr_count` jest ustawiona na 8.
- [ ] SETUP_GUIDE.md: Zawiera nową, kompletną sekcję opisującą konfigurację Supabase Auth i wymagane zmienne środowiskowe.

## Pułapki (UNIKAJ)
- 🚫 NIE zapomnij zaktualizować `adr_count` w `quality-gates.json`. Niezgodność liczb spowoduje natychmiastowy fail na wymiarze D6.
- 🚫 ADR-008 w Deliverable B musi opisywać decyzję architektoniczną, a NIE być tutorialem implementacji. Unikaj wklejania fragmentów kodu.
- 🚫 Upewnij się, że konsekwencje w ADR-008 wspominają o wpływie na schemat bazy danych (potrzeba przechowywania `user_id` w logach audytowych).
- 🚫 W `SETUP_GUIDE.md` należy wyraźnie oddzielić zmienne dla `foundation` i `certoid`, aby uniknąć pomyłek w konfiguracji.
- 🚫 Nie zmieniaj istniejących kroków w diagramach workflow w Deliverable C. Autoryzacja jest krokiem poprzedzającym, a nie częścią np. W2.