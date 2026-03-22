'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const pillars = [
  { key: '1', weight: 25, color: 'bg-certo-gold' },
  { key: '2', weight: 25, color: 'bg-certo-gold/80' },
  { key: '3', weight: 20, color: 'bg-certo-navy' },
  { key: '4', weight: 15, color: 'bg-certo-navy/70' },
  { key: '5', weight: 15, color: 'bg-certo-navy/50' },
];

export default function PillarsPreview() {
  const locale = useLocale();
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="w-full py-20 md:py-32 bg-white/50">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        <div className="text-center mb-16">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Rating Certo
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-certo-navy mb-4">
            {t('pillars_title')}
          </h2>
          <p className="text-lg text-certo-navy/60 max-w-2xl mx-auto">
            {t('pillars_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pillars.map(({ key, weight, color }) => (
            <div key={key} className="bg-white p-5 border border-certo-navy/5 rounded-lg hover:border-certo-gold/30 transition-colors overflow-hidden">
              <div className={`w-10 h-10 ${color} rounded-sm flex items-center justify-center text-white text-sm font-bold mb-4`}>
                {weight}%
              </div>
              <h3 className="font-serif font-extrabold text-certo-navy text-2xl md:text-base lg:text-lg mb-2">
                {t(`pillar_${key}_name`)}
              </h3>
              <p className="text-xs text-certo-navy/60 leading-relaxed">
                {t(`pillar_${key}_short`)}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={`/${locale}/ratings`}
            className="inline-block text-sm text-certo-gold font-medium hover:text-certo-gold-light transition-colors uppercase tracking-[0.1em]"
          >
            {t('pillars_cta')} &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
