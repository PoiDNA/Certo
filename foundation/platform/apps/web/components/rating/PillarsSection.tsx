'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const pillars = [
  { key: '1', weight: 25 },
  { key: '2', weight: 25 },
  { key: '3', weight: 20 },
  { key: '4', weight: 15 },
  { key: '5', weight: 15 },
];

export default function PillarsSection() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-3xl font-serif font-bold text-certo-navy mb-10">
        {t('pillars_title')}
      </h2>

      <div className="space-y-6">
        {pillars.map(({ key, weight }) => (
          <div key={key} className="bg-white p-6 border border-certo-navy/5">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="text-2xl font-bold text-certo-gold">{weight}%</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-serif font-bold text-certo-navy text-lg mb-2">
                  {t(`pillar_${key}_name`)}
                </h3>
                <p className="text-sm text-certo-navy/60 leading-relaxed">
                  {t(`pillar_${key}_desc`)}
                </p>
              </div>
            </div>
            {/* Weight bar */}
            <div className="mt-4 ml-[5.5rem] h-1.5 bg-certo-navy/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-certo-gold rounded-full transition-all duration-1000"
                style={{ width: `${weight * 4}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
