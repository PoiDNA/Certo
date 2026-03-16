export default function WarunkiKorzystania() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 2rem 4rem', fontFamily: 'Georgia, serif', color: '#0F1F3D' }}>
      <div style={{ marginBottom: '3rem' }}>
        <a href="/" style={{ fontSize: '0.75rem', color: '#C9A84C', textDecoration: 'none', letterSpacing: '0.1em', fontFamily: 'system-ui', fontWeight: 700 }}>← CERTO.ORG.PL</a>
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Warunki Korzystania z Serwisu</h1>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '3rem', fontFamily: 'system-ui' }}>Ostatnia aktualizacja: marzec 2026</p>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>1. Postanowienia ogólne</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>Niniejsze Warunki regulują zasady korzystania z serwisu <strong>certo.org.pl</strong> prowadzonego przez <strong>Fundację Certo Governance Institute</strong>. Korzystanie z Serwisu oznacza akceptację Warunków.</p>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>2. Charakter serwisu</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>Serwis stanowi portal dokumentacyjny Fundacji — niezależnego organu ratingowego działającego na rzecz jakości governance instytucji publicznych. Dostęp do części zasobów wymaga weryfikacji tożsamości.</p>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>3. Konto użytkownika</h2>
        <p style={{ lineHeight: 1.8, color: '#374151', marginBottom: '1rem' }}>Użytkownik zobowiązuje się do: podania prawdziwych danych tożsamości, nieudostępniania danych dostępowych osobom trzecim, niezwłocznego powiadomienia Fundacji o nieautoryzowanym dostępie, korzystania z Serwisu zgodnie z obowiązującym prawem.</p>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>4. Własność intelektualna</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>Wszelkie treści Serwisu stanowią własność Fundacji. Zabronione jest kopiowanie, rozpowszechnianie lub komercyjne wykorzystywanie treści bez pisemnej zgody Fundacji.</p>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>5. Zasada ratingu tworzonego przez człowieka</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>Fundacja stosuje <strong>Zasadę Ratingu Tworzonego przez Człowieka</strong>: wszystkie ratingi są tworzone i weryfikowane przez analityków. Narzędzia AI mogą wspierać procesy analityczne, jednak ostateczna decyzja ratingowa należy zawsze do człowieka.</p>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>6. Wyłączenie odpowiedzialności</h2>
        <p style={{ lineHeight: 1.8, color: '#374151' }}>Dokumenty i ratingi mają charakter informacyjny i nie stanowią porady prawnej ani finansowej. Fundacja nie ponosi odpowiedzialności za decyzje podjęte na ich podstawie.</p>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>7. Zakaz niedozwolonych działań</h2>
        <ul style={{ lineHeight: 2, color: '#374151', paddingLeft: '1.5rem' }}>
          <li>Nieautoryzowany dostęp do zasobów Serwisu.</li>
          <li>Automatyczne pobieranie treści (scraping) bez zgody Fundacji.</li>
          <li>Działania zakłócające działanie Serwisu.</li>
          <li>Podszywanie się pod Fundację lub jej pracowników.</li>
        </ul>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>8. Prawo właściwe</h2>
sed -i '' 's|Governance, certain. © {new Date().getFullYear()} Fundacja Certo Governance Institute|Governance, certain. © {new Date().getFullYear()} Fundacja Certo Governance Institute · <a href="/pp" style={{color: "#4A5568"}}>Polityka Prywatności</a> · <a href="/terms" style={{color: "#4A5568"}}>Warunki Korzystania</a>|' /Users/lk/work/certo/foundation/platform/apps/web/app/layout.tsx
cd /Users/lk/work/certo && git add -A && git commit -m "feat: strony /pp i /terms + linki w footer" && git push origin main
