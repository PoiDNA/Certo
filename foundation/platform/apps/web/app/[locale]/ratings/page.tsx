import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import ScoreExplainer from '../../../components/rating/ScoreExplainer';
import PillarsSection from '../../../components/rating/PillarsSection';
import DeFactoSection from '../../../components/rating/DeFactoSection';
import SectorsSection from '../../../components/rating/SectorsSection';
import StandardsSection from '../../../components/rating/StandardsSection';
import RatingBenefits from '../../../components/rating/RatingBenefits';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Rating' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `https://certogov.org/${locale}/ratings`,
    },
  };
}

export default async function RatingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Rating' });

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-20 md:py-28 bg-certo-navy text-center">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Certo Governance Institute
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream mb-6">
            {t('title')}
          </h1>
          <p className="text-lg text-certo-cream/70 max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <ScoreExplainer />
        <PillarsSection />
        <DeFactoSection />
        <SectorsSection />
        <StandardsSection />

        {/* Certo Accord */}
        <div className="bg-certo-gold/5 border-l-4 border-certo-gold p-8">
          <h2 className="text-2xl font-serif font-bold text-certo-navy mb-3">
            {t('accord_title')}
          </h2>
          <p className="text-sm text-certo-navy/70 leading-relaxed">
            {t('accord_desc')}
          </p>
        </div>

        {/* Benefits */}
        <RatingBenefits />
      </section>
    </div>
  );
}
