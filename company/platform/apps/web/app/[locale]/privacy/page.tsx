import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Legal' });

  return (
    <div className="py-24 px-6 mx-auto max-w-3xl w-full text-certo-teal-darker">
      <div className="mb-12">
        <a href={`/${locale}`} className="inline-flex items-center gap-2 text-xs font-mono font-bold text-certo-teal uppercase tracking-widest hover:text-certo-teal-dark transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-certo-teal" />
          {t('back')}
        </a>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{t('privacy_title')}</h1>
      <p className="text-sm text-certo-gray-dark mb-12 font-medium">{t('last_updated')}</p>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">1. Administrator Danych</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium">
          Administratorem Twoich danych osobowych jest <strong>Certo ID Prosta Spółka Akcyjna (PSA)</strong> z siedzibą w Warszawie.
          Jesteśmy komercyjnym operatorem technologicznym ekosystemu Certo. W sprawach związanych z ochroną danych
          skontaktuj się z nami pisząc na adres: <a href="mailto:privacy@certo.id" className="text-certo-teal hover:underline">privacy@certo.id</a>.
        </p>
      </section>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">2. Cele i podstawy przetwarzania</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium mb-4">
          Przetwarzamy dane w ramach dostarczania <strong>Infrastruktury Compliance</strong> dla instytucji publicznych i podmiotów regulowanych:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-certo-gray-dark font-medium">
          <li><strong>Weryfikacja Tożsamości (KYC/AML):</strong> W celu spełnienia wymogów prawnych (Art. 6 ust. 1 lit. c RODO).</li>
          <li><strong>Świadczenie usług Certo ID:</strong> Obsługa kont i procesów biznesowych (Art. 6 ust. 1 lit. b RODO).</li>
          <li><strong>Bezpieczeństwo:</strong> Monitorowanie ruchu i zapobieganie nadużyciom logów serwerów (Art. 6 ust. 1 lit. f RODO).</li>
        </ul>
      </section>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">3. Powierzenie i transfer danych</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium mb-4">
          Współpracujemy wyłącznie z zaufanymi dostawcami usług chmurowych przestrzegającymi standardów ISO/IEC 27001, z serwerami zlokalizowanymi głównie na terenie Unii Europejskiej:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-certo-gray-dark font-medium">
          <li><strong>Supabase Inc.</strong> — bezpieczna baza danych i autoryzacja.</li>
          <li><strong>Cloudflare Inc.</strong> — sieć CDN i zabezpieczenia anty-DDoS.</li>
          <li><strong>Vercel Inc.</strong> — hosting aplikacji front-end.</li>
        </ul>
      </section>

      <section className="mb-12 bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">4. Prawa Użytkownika</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium">
          Zgodnie z RODO posiadasz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania,
          przenoszenia danych, a także wniesienia sprzeciwu wobec przetwarzania. Masz również prawo do wniesienia
          skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).
        </p>
      </section>

      <section className="bg-white p-8 border border-certo-gray rounded-[2px] shadow-sm">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-certo-gray-light">5. Pliki Cookies (Ciasteczka)</h2>
        <p className="text-certo-gray-dark leading-relaxed font-medium">
          Korzystamy wyłącznie z technicznych (niezbędnych) plików cookies do obsługi sesji logowania oraz
          podstawowych mechanizmów bezpieczeństwa. <strong>Certo ID nie stosuje cookies śledzących ani marketingowych.</strong>
        </p>
      </section>
    </div>
  );
}
