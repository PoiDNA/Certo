'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const sections = [
  { key: 'deliverables', items: 5, color: 'border-certo-gold' },
  { key: 'internal', items: 5, color: 'border-certo-navy' },
  { key: 'external', items: 5, color: 'border-certo-gold/60' },
] as const;

export default function RatingBenefits() {
  const locale = useLocale();
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`mt-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
    >
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-navy mb-12 text-center">
        {t('benefits_title')}
      </h2>

      <div className="space-y-10">
        {sections.map(({ key, items, color }) => (
          <div key={key} className={`border-l-4 ${color} pl-8 py-2`}>
            <h3 className="font-serif font-bold text-certo-navy text-xl md:text-2xl mb-3">
              {t(`benefits_${key}_title`)}
            </h3>
            <p className="text-base text-certo-navy/60 leading-relaxed mb-5 max-w-3xl">
              {t(`benefits_${key}_intro`)}
            </p>
            <ul className="space-y-2">
              {Array.from({ length: items }, (_, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-certo-navy/70">
                  <span className="text-certo-gold mt-0.5 shrink-0">&#10003;</span>
                  <span>{t(`benefits_${key}_${i + 1}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <a
          href={`/${locale}/pilot`}
          className="inline-block bg-certo-navy text-certo-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg hover:bg-certo-gold hover:text-white transition-colors duration-300"
        >
          {t('benefits_cta')} &rarr;
        </a>
      </div>
    </div>
  );
}
