import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { images } from '../../../lib/images';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Experts' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `https://certogov.org/${locale}/experts` },
  };
}

export default async function ExpertsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Experts' });

  const profiles = ['governance', 'academic', 'practitioners'] as const;

  return (
    <div className="w-full">
      {/* Hero with background image */}
      <section className="relative py-24 md:py-32 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed-cover"
          style={{
            backgroundImage: `url(${images.expertsHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-certo-navy/85 via-certo-navy/75 to-certo-navy/90" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Certo Governance Institute
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream mb-6">
            {t('title')}
          </h1>
          <p className="text-lg text-certo-cream/70 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Profiles */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-serif font-bold text-certo-navy mb-8">{t('profiles_title')}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {profiles.map((profile) => (
            <div key={profile} className="bg-white p-6 border border-certo-navy/5 hover:border-certo-gold/30 transition-colors">
              <h3 className="font-serif font-extrabold text-certo-navy text-[2.625rem] leading-tight md:text-xl mb-2">{t(`profile_${profile}`)}</h3>
              <p className="text-sm text-certo-navy/60 leading-relaxed">{t(`profile_${profile}_desc`)}</p>
            </div>
          ))}
        </div>

        {/* Accreditation */}
        <div className="bg-certo-gold/5 border-l-4 border-certo-gold p-8 mb-16">
          <h2 className="text-2xl font-serif font-bold text-certo-navy mb-3">{t('accreditation_title')}</h2>
          <p className="text-sm text-certo-navy/70 leading-relaxed">{t('accreditation_desc')}</p>
        </div>

        {/* CTA to certo.consulting */}
        <div className="text-center bg-certo-navy p-10 rounded-lg">
          <h2 className="text-2xl font-serif font-bold text-certo-cream mb-3">{t('cta_title')}</h2>
          <p className="text-sm text-certo-cream/70 mb-6">{t('cta_desc')}</p>
          <a
            href="https://certo.consulting"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-certo-gold text-white text-sm uppercase tracking-[0.15em] font-medium hover:bg-certo-gold-light transition-colors"
          >
            {t('cta_button')}
          </a>
        </div>
      </section>
    </div>
  );
}
