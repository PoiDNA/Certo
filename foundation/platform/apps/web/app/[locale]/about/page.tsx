import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import OrgChart from '../../../components/about/OrgChart';
import PrinciplesSection from '../../../components/about/PrinciplesSection';
import MissionHero from '../../../components/about/MissionHero';
import { images } from '../../../lib/images';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return {
    title: t('title'),
    alternates: { canonical: `https://certogov.org/${locale}/about` },
    robots: { index: false, follow: true },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <div className="w-full">
      {/* Hero — typewriter + belief */}
      <MissionHero />

      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Organizational structure */}
        <OrgChart />

        {/* Founder — Preambuła */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-bold text-certo-fg mb-8">
            {t('founder_section_title')}
          </h2>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Portrait */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-certo-gold/30 shadow-lg">
                <img
                  src={images.founderPortrait}
                  alt={t('founder_name')}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-certo-fg">{t('founder_name')}</p>
                <p className="text-sm text-certo-fg-muted">{t('founder_role')}</p>
              </div>
            </div>
            {/* Preamble text */}
            <div className="flex-1">
              <div className="text-certo-gold/30 text-6xl font-serif leading-none mb-4">&ldquo;</div>
              <p className="text-lg font-serif text-certo-fg leading-relaxed mb-6">
                {t('founder_preamble')}
              </p>
              <blockquote className="text-lg font-serif italic text-certo-gold leading-relaxed border-l-4 border-certo-gold pl-6">
                {t('founder_quote')}
              </blockquote>
            </div>
          </div>
        </div>

        {/* Principles */}
        <PrinciplesSection />

        {/* Two entities */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-bold text-certo-fg mb-8">
            {t('entities_title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-certo-card p-6 border border-certo-card-border">
              <h3 className="font-serif font-bold text-certo-fg mb-2">{t('entity_foundation_name')}</h3>
              <p className="text-sm text-certo-fg-muted leading-relaxed">{t('entity_foundation_desc')}</p>
            </div>
            <div className="bg-certo-card p-6 border border-certo-card-border">
              <h3 className="font-serif font-bold text-certo-fg mb-2">{t('entity_company_name')}</h3>
              <p className="text-sm text-certo-fg-muted leading-relaxed">{t('entity_company_desc')}</p>
            </div>
          </div>
        </div>

        {/* Statute */}
        <div className="text-center bg-certo-surface p-8">
          <h2 className="text-xl font-serif font-bold text-certo-fg mb-3">{t('statute_title')}</h2>
          <p className="text-sm text-certo-fg-muted mb-4">{t('statute_desc')}</p>
        </div>
      </section>
    </div>
  );
}
