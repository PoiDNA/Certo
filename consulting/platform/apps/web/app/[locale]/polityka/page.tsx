import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal' });
  return {
    title: `${t('privacy_title')} | Certo Consulting`,
    description: t('privacy_title'),
  };
}

export default async function PolitykaPrywatnosci({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal' });

  return (
    <>
      <section className="bg-certo-primary pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <h1 className="font-display text-4xl md:text-5xl text-white font-light tracking-[-0.02em] mb-6">
            {t('privacy_title')}
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
              <h2 className="font-display text-2xl text-certo-primary mb-6">1. Administrator Danych</h2>
              <p className="text-certo-muted font-light leading-relaxed mb-8">
                Administratorem Twoich danych osobowych jest Certo ID PSA. Dbamy o to, aby Twoje dane były przetwarzane w sposób bezpieczny i zgodny z obowiązującymi przepisami prawa, w tym RODO.
              </p>

              <h2 className="font-display text-2xl text-certo-primary mb-6">2. Cel Przetwarzania Danych</h2>
              <div className="text-certo-muted font-light leading-relaxed mb-8">
                Przetwarzamy Twoje dane w celu:
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>Świadczenia usług doradztwa i audytu na najwyższym poziomie.</li>
                  <li>Realizacji zawartych umów i obsługi zapytań ofertowych.</li>
                  <li>Udzielania odpowiedzi na zapytania z formularzy kontaktowych na stronie.</li>
                  <li>Wypełniania obowiązków prawnych ciążących na Administratorze.</li>
                </ul>
              </div>

              <h2 className="font-display text-2xl text-certo-primary mb-6">3. Udostępnianie danych</h2>
              <p className="text-certo-muted font-light leading-relaxed mb-8">
                Twoje dane osobowe mogą być udostępniane podmiotom wspierającym nas w świadczeniu usług (np. akredytowani doradcy Certo) wyłącznie w niezbędnym zakresie, objętym stosownymi umowami o powierzenie przetwarzania danych.
              </p>

              <h2 className="font-display text-2xl text-certo-primary mb-6">4. Prawa Użytkownika</h2>
              <div className="text-certo-muted font-light leading-relaxed mb-8">
                Masz prawo do:
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>Dostępu do treści swoich danych osobowych.</li>
                  <li>Sprostowania, usunięcia lub ograniczenia przetwarzania danych.</li>
                  <li>Wniesienia sprzeciwu wobec przetwarzania.</li>
                  <li>Przenoszenia danych do innego podmiotu.</li>
                </ul>
              </div>

              <h2 className="font-display text-2xl text-certo-primary mb-6">5. Kontakt</h2>
              <p className="text-certo-muted font-light leading-relaxed">
                W sprawach związanych z ochroną danych osobowych prosimy o kontakt mailowy: <a href="mailto:iodo@certo.id" className="text-certo-accent hover:underline transition-colors duration-300">iodo@certo.id</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
