'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const ICON_BASE = 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1/ico';

const scores = [
  { key: 'score', icon: `${ICON_BASE}/Q1.png` },
  { key: 'vector', icon: `${ICON_BASE}/Q2.png` },
  { key: 'index', icon: `${ICON_BASE}/Q3.png` },
] as const;

export default function ScoreExplainer() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`grid md:grid-cols-3 gap-8 mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
    >
      {scores.map(({ key, icon }) => (
        <div key={key} className="bg-white p-8 border border-certo-navy/5">
          <img
            src={icon}
            alt={key}
            className="w-12 h-12 object-contain mb-4"
          />
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
