'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

export default function PilotCTA() {
  const locale = useLocale();
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-br from-certo-navy via-certo-navy to-[#2a3a5c]">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-6 text-center reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-6 font-medium">
          Q4 2026
        </p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-cream mb-6">
          {t('pilot_cta_title')}
        </h2>
        <p className="text-lg text-certo-cream/70 mb-10 leading-relaxed">
          {t('pilot_cta_text')}
        </p>
        <a
          href={`/${locale}/pilot`}
          className="inline-block px-10 py-4 bg-certo-gold text-white text-sm uppercase tracking-[0.15em] font-medium hover:bg-certo-gold-light transition-colors duration-300"
        >
          {t('pilot_cta_button')}
        </a>
      </div>
    </section>
  );
}
