import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import OrgChart from '../../../components/about/OrgChart';
import PrinciplesSection from '../../../components/about/PrinciplesSection';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return {
    title: t('title'),
    alternates: { canonical: `https://certogov.org/${locale}/about` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-certo-navy text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream mb-6">
            {t('title')}
          </h1>
          <p className="text-lg text-certo-cream/70 max-w-2xl mx-auto">
            {t('mission_text')}
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Organizational structure */}
        <OrgChart />

        {/* Founder */}
        <div className="bg-certo-cream border-l-4 border-certo-gold p-8 mb-16">
          <p className="text-lg font-serif italic text-certo-navy leading-relaxed mb-4">
            {t('founder_quote')}
          </p>
          <p className="text-sm text-certo-navy/60">
            — {t('founder_name')}, {t('founder_role')}
          </p>
        </div>

        {/* Principles */}
        <PrinciplesSection />

        {/* Two entities */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-bold text-certo-navy mb-8">
            {t('entities_title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-certo-navy/5">
              <h3 className="font-serif font-bold text-certo-navy mb-2">{t('entity_foundation_name')}</h3>
              <p className="text-sm text-certo-navy/60 leading-relaxed">{t('entity_foundation_desc')}</p>
            </div>
            <div className="bg-white p-6 border border-certo-navy/5">
              <h3 className="font-serif font-bold text-certo-navy mb-2">{t('entity_company_name')}</h3>
              <p className="text-sm text-certo-navy/60 leading-relaxed">{t('entity_company_desc')}</p>
            </div>
          </div>
        </div>

        {/* Statute */}
        <div className="text-center bg-certo-navy/5 p-8">
          <h2 className="text-xl font-serif font-bold text-certo-navy mb-3">{t('statute_title')}</h2>
          <p className="text-sm text-certo-navy/60 mb-4">{t('statute_desc')}</p>
        </div>
      </section>
    </div>
  );
}
