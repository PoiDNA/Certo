import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import PilotApplicationForm from '../../../components/PilotApplicationForm';
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream mb-6">
            {t('title')}
          </h1>
          <p className="text-lg text-certo-cream/70 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Program description */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-serif font-bold text-certo-navy mb-4">{t('program_title')}</h2>
        <p className="text-certo-navy/70 leading-relaxed mb-12">{t('program_description')}</p>

        {/* Who can apply */}
        <h2 className="text-2xl font-serif font-bold text-certo-navy mb-8">{t('who_title')}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {(['public', 'corporate', 'ngo'] as const).map((sector) => (
            <div key={sector} className="bg-white p-6 border border-certo-navy/5 hover:border-certo-gold/30 transition-colors">
              <h3 className="font-serif font-bold text-certo-navy mb-2">{t(`sector_${sector}`)}</h3>
              <p className="text-sm text-certo-navy/60 leading-relaxed">{t(`sector_${sector}_desc`)}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 className="text-2xl font-serif font-bold text-certo-navy mb-8">{t('timeline_title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {([1, 2, 3, 4] as const).map((step) => (
            <div key={step} className="relative">
              <div className="w-10 h-10 bg-certo-gold text-white flex items-center justify-center font-bold text-sm mb-4">
                {step}
              </div>
              <h3 className="font-serif font-bold text-certo-navy text-sm mb-1">{t(`step_${step}`)}</h3>
              <p className="text-xs text-certo-navy/60 leading-relaxed">{t(`step_${step}_desc`)}</p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <h2 className="text-2xl font-serif font-bold text-certo-navy mb-6">{t('benefits_title')}</h2>
        <ul className="space-y-3 mb-16">
          {([1, 2, 3, 4] as const).map((i) => (
            <li key={i} className="flex items-start gap-3 text-certo-navy/70">
              <span className="text-certo-gold mt-0.5">&#10003;</span>
              <span>{t(`benefit_${i}`)}</span>
            </li>
          ))}
        </ul>

        {/* Form */}
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-serif font-bold text-certo-navy mb-6 text-center">{t('form_title')}</h2>
          <PilotApplicationForm />
        </div>
      </section>
    </div>
  );
}
