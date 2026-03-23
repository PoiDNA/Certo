import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import PilotApplicationForm from '../../../components/PilotApplicationForm';
import ProcessTimeline from '../../../components/ProcessTimeline';
import WhoCanApply from '../../../components/WhoCanApply';
import { images } from '../../../lib/images';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Pilot' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `https://certogov.org/${locale}/pilot` },
  };
}

export default async function PilotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Pilot' });

  return (
    <div className="w-full">
      {/* Hero with background image */}
      <section className="relative py-24 md:py-32 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed-cover"
          style={{
            backgroundImage: `url(${images.pilotHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-certo-navy/85 via-certo-navy/75 to-certo-navy/90" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-6 font-medium">Q4 2026</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-certo-cream mb-6">
            {t('title')}
          </h1>
          <p className="text-lg text-certo-cream/70 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Form — right after hero, overlapping slightly */}
      <section className="relative -mt-8 z-10 px-6 pb-16">
        <PilotApplicationForm />
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 pb-16 space-y-16">

        {/* Program description */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-4">{t('program_title')}</h2>
          <p className="text-base text-certo-navy/70 dark:text-certo-dark-text/70 leading-relaxed">{t('program_description')}</p>
        </div>

        {/* Who can apply — interactive paths */}
        <WhoCanApply />

        {/* Sectors */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-6">{t('form_sector')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(['public', 'corporate', 'ngo'] as const).map((sector) => (
              <div key={sector} className="bg-certo-navy/[0.02] dark:bg-certo-dark-card p-5 border border-certo-navy/5 dark:border-certo-dark-border rounded-xl">
                <h3 className="font-serif font-bold text-certo-navy dark:text-certo-dark-text text-base mb-2">{t(`sector_${sector}`)}</h3>
                <p className="text-sm text-certo-navy/50 dark:text-certo-dark-muted leading-relaxed">{t(`sector_${sector}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline — interactive stepper */}
        <ProcessTimeline />

        {/* Benefits */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-6">{t('benefits_title')}</h2>
          <ul className="space-y-3">
            {([1, 3, 4] as const).map((i) => (
              <li key={i} className="flex items-start gap-3 text-base text-certo-navy/70 dark:text-certo-dark-text/70">
                <span className="text-certo-gold mt-0.5">&#10003;</span>
                <span>{t(`benefit_${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
