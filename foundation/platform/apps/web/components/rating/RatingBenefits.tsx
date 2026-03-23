'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const tabs = [
  {
    key: 'deliverables',
    items: 5,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    accent: 'bg-certo-gold',
    lightBg: 'bg-certo-gold/5',
  },
  {
    key: 'internal',
    items: 5,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    accent: 'bg-certo-navy',
    lightBg: 'bg-certo-navy/5',
  },
  {
    key: 'external',
    items: 5,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    accent: 'bg-certo-gold/70',
    lightBg: 'bg-amber-50/50',
  },
] as const;

export default function RatingBenefits() {
  const locale = useLocale();
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();
  const [active, setActive] = useState(0);

  const current = tabs[active];

  return (
    <div
      ref={ref}
      className={`mt-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
    >
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-10 text-center">
        {t('benefits_title')}
      </h2>

      {/* Tab buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActive(i)}
            className={`flex-1 flex items-center gap-3 p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 text-left ${
              i === active
                ? 'border-certo-gold bg-white dark:bg-certo-dark-card shadow-lg shadow-certo-gold/10'
                : 'border-transparent bg-white/60 dark:bg-certo-dark-surface hover:bg-white dark:hover:bg-certo-dark-card hover:border-certo-navy/10'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg ${i === active ? tab.accent : 'bg-certo-navy/10'} flex items-center justify-center text-white shrink-0 transition-colors duration-300`}>
              {tab.icon}
            </div>
            <span className={`font-serif font-bold text-sm sm:text-base transition-colors duration-300 ${
              i === active ? 'text-certo-navy dark:text-certo-dark-text' : 'text-certo-navy/50 dark:text-certo-dark-text/50'
            }`}>
              {t(`benefits_${tab.key}_title`)}
            </span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className={`${current.lightBg} rounded-xl p-8 md:p-10 animate-fadeIn`} key={active}>
        <p className="text-base md:text-lg text-certo-navy/70 dark:text-certo-dark-text/70 leading-relaxed mb-8 max-w-3xl">
          {t(`benefits_${current.key}_intro`)}
        </p>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {Array.from({ length: current.items }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full ${tabs[active].accent} flex items-center justify-center shrink-0 mt-0.5`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-sm md:text-base text-certo-navy/70 dark:text-certo-dark-text/70 leading-relaxed">
                {t(`benefits_${current.key}_${i + 1}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
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
