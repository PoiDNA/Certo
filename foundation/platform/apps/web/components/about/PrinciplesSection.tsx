'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const principles = ['independence', 'reproducibility', 'transparency'] as const;

export default function PrinciplesSection() {
  const t = useTranslations('About');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`mb-16 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-2xl font-serif font-bold text-certo-navy mb-8">
        {t('principles_title')}
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {principles.map((key) => (
          <div key={key} className="bg-white p-6 border border-certo-navy/5">
            <h3 className="font-serif font-bold text-certo-navy mb-2">
              {t(`principle_${key}_name`)}
            </h3>
            <p className="text-sm text-certo-navy/60 leading-relaxed">
              {t(`principle_${key}_desc`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
