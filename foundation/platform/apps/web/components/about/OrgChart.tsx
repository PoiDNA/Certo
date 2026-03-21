'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const organs = [
  { key: 'board', color: 'border-certo-gold bg-certo-gold/5' },
  { key: 'supervisory', color: 'border-certo-navy bg-certo-navy/5' },
  { key: 'standard', color: 'border-certo-navy bg-certo-navy/5' },
  { key: 'advisory', color: 'border-certo-navy/30 bg-white' },
  { key: 'international', color: 'border-certo-navy/30 bg-white' },
  { key: 'tribunal', color: 'border-certo-gold/50 bg-certo-gold/5' },
] as const;

export default function OrgChart() {
  const t = useTranslations('About');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`mb-16 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-2xl font-serif font-bold text-certo-navy mb-8">
        {t('structure_title')}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {organs.map(({ key, color }) => (
          <div key={key} className={`p-6 border-l-4 ${color}`}>
            <h3 className="font-serif font-bold text-certo-navy text-sm mb-1">
              {t(`organ_${key}_name`)}
            </h3>
            <p className="text-xs text-certo-navy/60 leading-relaxed">
              {t(`organ_${key}_role`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
