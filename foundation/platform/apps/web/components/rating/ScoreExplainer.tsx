'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const scores = [
  { key: 'score', color: 'bg-certo-gold', icon: '◆' },
  { key: 'vector', color: 'bg-certo-navy', icon: '◈' },
  { key: 'index', color: 'bg-certo-navy/70', icon: '◇' },
] as const;

export default function ScoreExplainer() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`grid md:grid-cols-3 gap-8 mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
    >
      {scores.map(({ key, color, icon }) => (
        <div key={key} className="bg-white p-8 border border-certo-navy/5">
          <div className={`w-12 h-12 ${color} rounded-sm flex items-center justify-center text-white text-xl mb-4`}>
            {icon}
          </div>
          <h3 className="font-serif font-bold text-certo-navy text-lg mb-2">
            {t(`${key}_title`)}
          </h3>
          <p className="text-sm text-certo-navy/60 leading-relaxed">
            {t(`${key}_desc`)}
          </p>
        </div>
      ))}
    </section>
  );
}
