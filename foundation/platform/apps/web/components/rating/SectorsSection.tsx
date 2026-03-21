'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const sectors = ['public', 'corporate', 'medical', 'defense', 'ngo'] as const;

export default function SectorsSection() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();
  const [active, setActive] = useState<(typeof sectors)[number]>('public');

  return (
    <section ref={ref} className={`mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-3xl font-serif font-bold text-certo-navy mb-10">
        {t('sectors_title')}
      </h2>

      <div className="flex flex-wrap gap-2 mb-8">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setActive(sector)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active === sector
                ? 'bg-certo-navy text-certo-gold'
                : 'bg-certo-navy/5 text-certo-navy/60 hover:bg-certo-navy/10'
            }`}
          >
            {t(`sector_${sector}`)}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 border border-certo-navy/5 min-h-[120px]">
        <h3 className="font-serif font-bold text-certo-navy text-lg mb-2">
          {t(`sector_${active}`)}
        </h3>
        <p className="text-sm text-certo-navy/60">
          Kryteria oceny dla sektora: {t(`sector_${active}`).toLowerCase()} — szczegóły w metodologii.
        </p>
      </div>
    </section>
  );
}
