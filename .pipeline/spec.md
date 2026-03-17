# SPEC OD ARCHITECTA — realizuj dosłownie

**Złożoność:** medium
**Szacowane iteracje:** 2
**Pliki do edycji:** company/technical/deliverable-b/README.md, pipeline/config/quality-gates.json

## Efekty drugiego rzędu (WAŻNE)
- ⚠️ Wprowadzenie nowej, kluczowej zależności (Supabase Auth) wymaga udokumentowania jako Architecture Decision Record (ADR).
- ⚠️ Liczba ADR wzrasta z 7 do 8, co wymaga aktualizacji w `deliverable-b/README.md` oraz w `pipeline/config/quality-gates.json`.

## Plan zmian

### company/platform/apps/web/middleware.ts
Akcja: create_or_modify_file
Lokalizacja: undefined
Spec: Implementacja middleware przy użyciu `@supabase/auth-helpers-nextjs`. Middleware ma chronić wszystkie ścieżki ('/') z wyjątkiem publicznych. Konfiguracja matchera: `matcher: ['/((?!login|auth/callback|pp|terms|_next/static|_next/image|favicon.ico).*)']`. Niezalogowany użytkownik jest przekierowywany na '/login'.
MUSI zawierać: createMiddlewareClient, NextRequest, NextResponse, matcher config
NIE MOŻE zawierać: Hardkodowanie kluczy Supabase, Logika biznesowa niezwiązana z autoryzacją

### company/platform/apps/web/app/login/page.tsx
Akcja: create_file
Lokalizacja: undefined
Spec: Strona logowania jako komponent kliencki ('use client'). Stylizacja zgodna z issue: tło #080A0F, akcent #00E5A0, font Syne. Centralnie umieszczone logo Certo ID (400x120), pod nim tagline 'Cryptographic Rating' z odpowiednim stylem. Dwa przyciski OAuth (Google, Microsoft) z ikonami SVG i stylami (border, hover). Linki do /pp i /terms na dole strony. Logika przycisków ma wywoływać `supabase.auth.signInWithOAuth` z odpowiednim providerem i `redirectTo` wskazującym na `/auth/callback`.
MUSI zawierać: use client, createClientComponentClient, signInWithOAuth, Google provider, Microsoft provider (azure), TailwindCSS/styled-components for styling
NIE MOŻE zawierać: Dowolne inne metody logowania (np. email/hasło), Formularze

### company/platform/apps/web/app/auth/callback/route.ts
Akcja: create_file
Lokalizacja: undefined
Spec: Route handler (GET) do obsługi callbacku z Supabase po udanym logowaniu OAuth. Używa `@supabase/auth-helpers-nextjs` do wymiany kodu autoryzacyjnego na sesję użytkownika. Po pomyślnej wymianie, przekierowuje użytkownika na stronę główną ('/').
MUSI zawierać: createRouteHandlerClient, exchangeCodeForSession, NextResponse.redirect
NIE MOŻE zawierać: Zapisywanie sesji ręcznie, Zwracanie danych JSON

### company/platform/apps/web/app/auth/logout/route.ts
Akcja: create_file
Lokalizacja: undefined
Spec: Route handler (POST) do wylogowywania użytkownika. Używa klienta Supabase do wywołania `signOut()`. Po pomyślnym wylogowaniu, przekierowuje użytkownika na stronę logowania ('/login').
MUSI zawierać: createRouteHandlerClient, signOut, POST method
NIE MOŻE zawierać: Obsługa metody GET

### company/platform/apps/web/app/layout.tsx
Akcja: modify_file
Lokalizacja: Wewnątrz głównego komponentu nawigacyjnego (Navbar) lub podobnego.
Spec: Zmodyfikuj istniejącą nawigację, aby była świadoma stanu autoryzacji. Użyj serwerowego klienta Supabase do pobrania sesji. Jeśli użytkownik jest zalogowany, wyświetl jego adres e-mail oraz przycisk 'Wyloguj'. Przycisk ten powinien być wewnątrz formularza, który wykonuje żądanie POST na '/auth/logout'. Jeśli użytkownik nie jest zalogowany, te elementy nie powinny być widoczne.
MUSI zawierać: createServerComponentClient, data.session, form action='/auth/logout' method='post'
NIE MOŻE zawierać: Przycisk 'Zaloguj' (logowanie jest przez redirect z middleware)

### company/platform/apps/web/.env.example
Akcja: create_or_modify_file
Lokalizacja: Na końcu pliku.
Spec: Dodaj zmienne środowiskowe wymagane do połączenia z Supabase, aby umożliwić deweloperom lokalne uruchomienie projektu. Zmienne powinny mieć puste wartości.
MUSI zawierać: NEXT_PUBLIC_SUPABASE_URL=, NEXT_PUBLIC_SUPABASE_ANON_KEY=
NIE MOŻE zawierać: Jakiekolwiek wartości sekretów

### company/technical/deliverable-b/README.md
Akcja: modify_file
Lokalizacja: W sekcji wprowadzającej, gdzie wymieniona jest liczba ADR.
Spec: Zaktualizuj liczbę ADR z 7 na 8. Zmień tekst '7 ADR' na '8 ADR'. Dodaj również odniesienie do nowego ADR w liście lub opisie.
MUSI zawierać: 8 ADR
NIE MOŻE zawierać: 7 ADR

### company/technical/deliverable-b/ADR-008-supabase-auth.md
Akcja: create_file
Lokalizacja: undefined
Spec: Utwórz nowy plik Architecture Decision Record. Struktura: Status (Proposed), Kontekst (potrzeba autoryzacji dla klientów Certo ID PSA, oddzielnie od Fundacji), Rozważane opcje (np. Auth0, self-hosted, Supabase), Decyzja (Wybór Supabase Auth z OAuth dla Google i Microsoft), Uzasadnienie (szybkość wdrożenia, integracja z Next.js, RLS w Postgres), Konsekwencje (zależność od zewnętrznego dostawcy, zarządzanie użytkownikami w panelu Supabase, konieczność konfiguracji RLS dla danych Certo ID).
MUSI zawierać: ADR-008, Certo ID PSA, Supabase Auth, OAuth, Row Level Security
NIE MOŻE zawierać: Szczegóły implementacyjne kodu, Fundacja Certo

### pipeline/config/quality-gates.json
Akcja: modify_file
Lokalizacja: W obiekcie `architecture_state`.
Spec: Zmień wartość klucza `adr_count` z 7 na 8.
MUSI zawierać: "adr_count": 8
NIE MOŻE zawierać: "adr_count": 7

## Cross-doc checklist (sprawdź PO zmianach)
- [ ] Sprawdź, czy `company/technical/deliverable-b/README.md` zawiera tekst '8 ADR'.
- [ ] Upewnij się, że w katalogu `company/technical/deliverable-b/` istnieje nowy plik `ADR-008-supabase-auth.md`.
- [ ] Zweryfikuj, czy w `pipeline/config/quality-gates.json` wartość `adr_count` została ustawiona na 8.
- [ ] Potwierdź, że żadne dokumenty w katalogu `foundation/` nie zostały zmodyfikowane.

## Pułapki (UNIKAJ)
- 🚫 Krytycznym błędem będzie zapomnienie o aktualizacji `adr_count` w `pipeline/config/quality-gates.json`. Reviewer odrzuci zmianę za niespójność liczbową (D6).
- 🚫 Claude może zapomnieć o utworzeniu pliku `.env.example`, co utrudni lokalne testowanie i wdrożenie.
- 🚫 Stylistyka strony logowania musi być dokładnie zgodna ze specyfikacją (kolory, font, logo, tagline). Każde odstępstwo zostanie zgłoszone.
- 🚫 Należy użyć oficjalnych bibliotek `@supabase/auth-helpers-nextjs`, a nie próbować implementować logiki ręcznie. Zapewnia to poprawne zarządzanie sesją w komponentach serwerowych i klienckich.
- 🚫 Nowy ADR musi jasno rozróżniać bazę użytkowników Certo ID (klienci PSA) od personelu Fundacji Certo, aby uniknąć przyszłych nieporozumień.