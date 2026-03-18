export default function TermsPage() {
  return (
    <div className="py-24 px-6 mx-auto max-w-3xl w-full text-certo-teal-darker">
      <div className="mb-12">
        <a href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-certo-teal uppercase tracking-widest hover:text-certo-teal-dark transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-certo-teal" />
          Wróć do strony głównej
        </a>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Warunki Usługi</h1>
      <p className="text-sm text-certo-gray-dark mb-12 font-medium">Ostatnia aktualizacja: Marzec 2026</p>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">1. Postanowienia Ogólne</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium">
          Dostawcą <strong>Infrastruktury Compliance (Certo ID)</strong> jest <strong>Certo ID PSA</strong> z siedzibą w Warszawie 
          (KRS, REGON, NIP na życzenie). System został zbudowany jako platforma technologiczna obsługująca procesy 
          weryfikacyjne certyfikowane standardami niezależnego organu <strong>Certo Governance Institute</strong>.
        </p>
      </section>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">2. Prawa Autorskie i Licencja</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium">
          Całość praw autorskich (w tym kod źródłowy, algorytmy obliczeniowe i układ graficzny) przysługuje 
          Certo ID PSA oraz jej odpowiednim licencjodawcom. Niedozwolone jest kopiowanie, modyfikowanie, inżynieria 
          odwrotna (reverse engineering), dekompilacja lub wykorzystywanie oprogramowania poza ustalonym 
          profilem usługi subskrypcyjnej (SaaS).
        </p>
      </section>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">3. Obsługa procesów i Odpowiedzialność</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium mb-4">
          Spółka Certo ID PSA odpowiada wyłącznie za poprawne technologicznie dostarczanie infrastruktury 
          do obliczeń i przechowywania danych:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-certo-gray-dark font-medium">
          <li><strong>Rating Certo Vector</strong> opiera się na matematycznym i merytorycznym modelu niezależnej Fundacji Certo. Certo ID PSA jedynie egzekwuje ten model w systemie, ale nie ustala warunków granicznych wyniku.</li>
          <li>System działa z dostępnością 99.9% w modelu High Availability (SLA na podstawie indywidualnych kontraktów korporacyjnych).</li>
          <li>Użytkownik (instytucja) bierze odpowiedzialność za wprowadzanie rzetelnych danych do weryfikacji KYC/AML.</li>
        </ul>
      </section>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">4. Korzystanie ze struktury AI i API</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium">
          Zautomatyzowane dostępy do API (np. do webhooków Certo Action lub systemu pobierania raportów PDF) 
          podlegają ścisłym limitom zapytań uregulowanym w dokumentacji deweloperskiej.
          Algorytmy sztucznej inteligencji (np. LLMs używane podczas analizy dokumentacji) nie 
          podejmują ostatecznych decyzji ratingowych, zachowując <strong>Zasadę Nadzoru Człowieka (Human-in-the-loop)</strong>, 
          wdrożoną przez Izbę Nadzoru Certo Governance Institute.
        </p>
      </section>

      <section className="bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">5. Prawo Właściwe</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium">
          Niniejsze Warunki, wraz z Polityką Prywatności, podlegają w całości przepisom prawa obowiązującym w Rzeczypospolitej Polskiej. 
          Ewentualne spory prawne rozstrzygane są przez sąd powszechny właściwy miejscowo dla siedziby Spółki Certo ID PSA.
        </p>
      </section>
    </div>
  );
}