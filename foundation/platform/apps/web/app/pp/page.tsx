export default function PolitykaPrywatnosci() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 font-serif text-certo-navy">
      <div className="mb-12">
        <a href="/" className="text-xs text-certo-gold hover:text-certo-gold-light no-underline tracking-widest font-sans font-bold uppercase transition-colors">← Certogov.org</a>
      </div>
      
      <h1 className="text-4xl font-bold mb-2 tracking-tight">Polityka Prywatności</h1>
      <p className="text-sm text-certo-navy/60 mb-12 font-sans">Ostatnia aktualizacja: marzec 2026</p>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gold/30">1. Administrator danych</h2>
        <p className="leading-relaxed text-certo-navy/80 font-sans">
          Administratorem danych osobowych jest <strong>Fundacja Certo Governance Institute</strong> z siedzibą w Polsce. 
          Kontakt: <a href="mailto:privacy@certogov.org" className="text-certo-gold hover:underline">privacy@certogov.org</a>
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gold/30">2. Jakie dane zbieramy</h2>
        <ul className="leading-loose text-certo-navy/80 pl-6 list-disc font-sans">
          <li><strong>Dane uwierzytelniające:</strong> adres e-mail, imię i nazwisko, zdjęcie profilowe — pozyskiwane przy logowaniu przez Google lub Microsoft OAuth.</li>
          <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, czas wizyty — gromadzone automatycznie w logach serwera.</li>
          <li><strong>Dane sesji:</strong> tokeny uwierzytelniające przechowywane w ciasteczkach (cookies).</li>
        </ul>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gold/30">3. Cel i podstawa prawna przetwarzania</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm font-sans">
            <thead>
              <tr className="bg-certo-navy/5">
                <th className="text-left p-3 border border-certo-navy/20 font-semibold text-certo-navy">Cel</th>
                <th className="text-left p-3 border border-certo-navy/20 font-semibold text-certo-navy">Podstawa prawna</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/80">Umożliwienie logowania i dostępu do dokumentów</td>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/60">Art. 6 ust. 1 lit. b RODO</td>
              </tr>
              <tr>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/80">Zapewnienie bezpieczeństwa serwisu</td>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/60">Art. 6 ust. 1 lit. f RODO</td>
              </tr>
              <tr>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/80">Prowadzenie statystyk</td>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/60">Art. 6 ust. 1 lit. f RODO</td>
              </tr>
              <tr>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/80">Wypełnienie obowiązków prawnych</td>
                <td className="p-3 border border-certo-navy/20 text-certo-navy/60">Art. 6 ust. 1 lit. c RODO</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gold/30">4. Odbiorcy danych</h2>
        <ul className="leading-loose text-certo-navy/80 pl-6 list-disc font-sans">
          <li><strong>Supabase Inc.</strong> — infrastruktura bazy danych i uwierzytelniania.</li>
          <li><strong>Vercel Inc.</strong> — infrastruktura hostingowa.</li>
          <li><strong>Google LLC</strong> — logowanie przez Google OAuth.</li>
          <li><strong>Microsoft Corporation</strong> — logowanie przez Microsoft OAuth.</li>
        </ul>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gold/30">5. Prawa użytkownika</h2>
        <p className="leading-relaxed text-certo-navy/80 font-sans">
          Przysługuje Ci prawo dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz sprzeciwu. 
          W celu skorzystania z praw: <a href="mailto:privacy@certogov.org" className="text-certo-gold hover:underline">privacy@certogov.org</a>. 
          Przysługuje Ci też prawo skargi do Prezesa UODO.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gold/30">6. Cookies</h2>
        <p className="leading-relaxed text-certo-navy/80 font-sans">
          Serwis wykorzystuje cookies wyłącznie sesyjne i uwierzytelniające. Nie stosujemy cookies marketingowych ani śledzących.
        </p>
      </section>
      
      <section>
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gold/30">7. Okres przechowywania</h2>
        <p className="leading-relaxed text-certo-navy/80 font-sans">
          Dane uwierzytelniające — przez okres posiadania konta. Logi techniczne — 90 dni. Po usunięciu konta dane są anonimizowane w ciągu 30 dni.
        </p>
      </section>
    </main>
  );
}