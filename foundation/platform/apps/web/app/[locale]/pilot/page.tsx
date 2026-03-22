import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import PilotApplicationForm from '../../../components/PilotApplicationForm';
import ProcessTimeline from '../../../components/ProcessTimeline';
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

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* Program description */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy mb-4">{t('program_title')}</h2>
          <p className="text-base text-certo-navy/70 leading-relaxed">{t('program_description')}</p>
        </div>

        {/* Who can apply — two paths */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy mb-3">{t('who_title')}</h2>
          <p className="text-base text-certo-navy/60 leading-relaxed mb-8">{t('who_intro')}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Representative path */}
            <div className="bg-white p-6 border border-certo-navy/5 hover:border-certo-gold/30 transition-colors">
              <div className="w-10 h-10 bg-certo-navy text-certo-gold flex items-center justify-center text-lg mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-certo-navy text-xl mb-2">{t('path_representative_title')}</h3>
              <p className="text-sm text-certo-navy/60 leading-relaxed mb-3">{t('path_representative_desc')}</p>
              <p className="text-sm text-certo-gold/80 italic">{t('path_representative_note')}</p>
            </div>

            {/* Observer path */}
            <div className="bg-white p-6 border border-certo-navy/5 hover:border-certo-gold/30 transition-colors">
              <div className="w-10 h-10 bg-certo-gold text-white flex items-center justify-center text-lg mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-certo-navy text-xl mb-2">{t('path_observer_title')}</h3>
              <p className="text-sm text-certo-navy/60 leading-relaxed mb-3">{t('path_observer_desc')}</p>
              <p className="text-sm text-certo-gold/80 italic">{t('path_observer_note')}</p>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy mb-6">{t('form_sector')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(['public', 'corporate', 'ngo'] as const).map((sector) => (
              <div key={sector} className="bg-certo-navy/[0.02] p-5 border border-certo-navy/5">
                <h3 className="font-serif font-bold text-certo-navy text-base mb-2">{t(`sector_${sector}`)}</h3>
                <p className="text-sm text-certo-navy/50 leading-relaxed">{t(`sector_${sector}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline — interactive stepper */}
        <ProcessTimeline />

        {/* Benefits */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy mb-6">{t('benefits_title')}</h2>
          <ul className="space-y-3">
            {([1, 3, 4] as const).map((i) => (
              <li key={i} className="flex items-start gap-3 text-base text-certo-navy/70">
                <span className="text-certo-gold mt-0.5">&#10003;</span>
                <span>{t(`benefit_${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy mb-6 text-center">{t('form_title')}</h2>
          <PilotApplicationForm />
        </div>
      </section>
    </div>
  );
}
