import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Legal' });
  return {
    title: `${t('terms_title')} | Certo Consulting`,
    description: t('terms_title'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function Regulamin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Legal' });

  return (
    <>
      <section className="bg-certo-primary pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <h1 className="font-display text-4xl md:text-5xl text-white font-light tracking-[-0.02em] mb-6">
            {t('terms_title')}
          </h1>
          <p className="text-certo-surface/80 text-lg font-light max-w-2xl">
            {t('last_updated')}
          </p>
        </div>
      </section>

      <section className="py-20 bg-certo-surface">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="bg-white p-8 md:p-16 border border-certo-border shadow-sm max-w-4xl">
            <div className="prose prose-lg prose-certo">
              <h2 className="font-display text-2xl text-certo-primary mb-6">1. Postanowienia ogólne</h2>
              <p className="text-certo-muted font-light leading-relaxed mb-8">
                Niniejszy regulamin określa zasady korzystania z usług doradczych świadczonych przez platformę Certo Consulting. Wszyscy doradcy dostępni w serwisie są ściśle akredytowani i podlegają nadzorowi merytorycznemu Fundacji Certo Governance Institute.
              </p>

              <h2 className="font-display text-2xl text-certo-primary mb-6">2. Rodzaje świadczonych usług</h2>
              <div className="text-certo-muted font-light leading-relaxed mb-8">
                W ramach serwisu Certo Consulting oferujemy dostęp do specjalistów zajmujących się:
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>Doradztwem strategicznym z zakresu ładu korporacyjnego i compliance.</li>
                  <li>Wsparciem we wdrażaniu rekomendacji wynikających z ratingu kryptograficznego Certo.</li>
                  <li>Audytami bezpieczeństwa i weryfikacją polityk wewnętrznych.</li>
                  <li>Szkoleniami kadr menedżerskich z ochrony zdrowia, edukacji, finansów i JST.</li>
                </ul>
              </div>

              <h2 className="font-display text-2xl text-certo-primary mb-6">3. Warunki świadczenia usług</h2>
              <p className="text-certo-muted font-light leading-relaxed mb-8">
                Wypełnienie formularza kontaktowego w serwisie stanowi jedynie zapytanie o dostępność i kompetencje doradcy. Rozpoczęcie świadczenia usług doradczych każdorazowo wymaga uzgodnień handlowych i zawarcia odrębnej umowy określającej precyzyjny zakres, harmonogram i koszty współpracy. Informacje przedstawione w serwisie nie stanowią wiążącej oferty w rozumieniu przepisów kodeksu cywilnego.
              </p>

              <h2 className="font-display text-2xl text-certo-primary mb-6">4. Odpowiedzialność</h2>
              <p className="text-certo-muted font-light leading-relaxed mb-8">
                Certo Consulting gwarantuje najwyższy standard usług doradczych oparty o wytyczne Fundacji. Ewentualna odpowiedzialność z tytułu realizowanych projektów doradczych jest szczegółowo określana w zawieranych z poszczególnymi podmiotami umowach zlecenia.
              </p>

              <h2 className="font-display text-2xl text-certo-primary mb-6">5. Postanowienia końcowe</h2>
              <p className="text-certo-muted font-light leading-relaxed">
                Certo ID PSA zastrzega sobie prawo do wprowadzania zmian w niniejszym regulaminie. Zmiany wchodzą w życie z dniem ich publikacji na stronie internetowej Certo Consulting. Prawem właściwym dla wszelkich sporów jest prawo Rzeczypospolitej Polskiej.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
