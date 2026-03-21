'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const formalOrgans = [
  { key: 'supervisory', color: 'border-certo-navy bg-certo-navy/5' },
  { key: 'board', color: 'border-certo-gold bg-certo-gold/5' },
] as const;

const expertStructures = [
  { key: 'council', color: 'border-certo-gold bg-certo-gold/5' },
  { key: 'standard', color: 'border-certo-navy bg-certo-navy/5' },
  { key: 'tribunal', color: 'border-certo-navy bg-certo-navy/5' },
  { key: 'centre', color: 'border-certo-gold/50 bg-white' },
] as const;

export default function OrgChart() {
  const t = useTranslations('About');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`mb-16 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-2xl font-serif font-bold text-certo-navy mb-8">
        {t('structure_title')}
      </h2>

      {/* Organy Fundacji */}
      <h3 className="text-sm uppercase tracking-[0.15em] text-certo-gold font-semibold mb-4">
        {t('organs_label')}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {formalOrgans.map(({ key, color }) => (
          <div key={key} className={`p-6 border-l-4 ${color}`}>
            <h4 className="font-serif font-extrabold text-certo-navy text-[1.3rem] leading-tight md:text-xl mb-1">
              {t(`organ_${key}_name`)}
            </h4>
            <p className="text-xs text-certo-navy/60 leading-relaxed">
              {t(`organ_${key}_role`)}
            </p>
          </div>
        ))}
      </div>

      {/* Struktury eksperckie */}
      <h3 className="text-sm uppercase tracking-[0.15em] text-certo-gold font-semibold mb-4">
        {t('expert_structures_label')}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {expertStructures.map(({ key, color }) => (
          <div key={key} className={`p-6 border-l-4 ${color}`}>
            <h4 className="font-serif font-extrabold text-certo-navy text-[1.3rem] leading-tight md:text-xl mb-1">
              {t(`organ_${key}_name`)}
            </h4>
            <p className="text-xs text-certo-navy/60 leading-relaxed">
              {t(`organ_${key}_role`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
