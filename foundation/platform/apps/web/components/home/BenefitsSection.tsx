'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const cards = [
  {
    key: 'card1',
    items: 5,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    iconBg: 'bg-certo-gold',
  },
  {
    key: 'card2',
    items: 4,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    iconBg: 'bg-certo-navy',
  },
  {
    key: 'card3',
    items: 4,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    iconBg: 'bg-certo-navy/70',
  },
] as const;

export default function BenefitsSection() {
  const locale = useLocale();
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="w-full py-20 md:py-32 bg-certo-card">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-fg mb-4">
            {t('benefits_title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map(({ key, items, icon, iconBg }) => (
            <div key={key} className="bg-certo-cream/50 rounded-lg p-8 border border-certo-card-border">
              <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center text-white mb-5`}>
                {icon}
              </div>
              <h3 className="font-serif font-bold text-certo-fg text-xl mb-3">
                {t(`benefits_${key}_title`)}
              </h3>
              <p className="text-sm text-certo-fg-muted leading-relaxed mb-5">
                {t(`benefits_${key}_intro`)}
              </p>
              <ul className="space-y-2">
                {Array.from({ length: items }, (_, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-certo-fg-muted">
                    <span className="text-certo-gold mt-0.5 shrink-0">&#10003;</span>
                    <span>{t(`benefits_${key}_item${i + 1}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={`/${locale}/ratings`}
            className="inline-block text-sm text-certo-gold font-medium hover:text-certo-gold-light transition-colors uppercase tracking-[0.1em]"
          >
            {t('benefits_cta')} &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
