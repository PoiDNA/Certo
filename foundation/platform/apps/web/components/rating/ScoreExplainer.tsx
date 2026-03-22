'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const ICON_BASE = 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1/ico';

const scores = [
  { key: 'score', icon: `${ICON_BASE}/I-I-1.png`, bg: 'from-amber-50 via-amber-50/60 to-white' },
  { key: 'vector', icon: `${ICON_BASE}/I-I-2.png`, bg: 'from-slate-50 via-blue-50/40 to-white' },
  { key: 'index', icon: `${ICON_BASE}/I-I-3.png`, bg: 'from-teal-50 via-emerald-50/50 to-white' },
] as const;

export default function ScoreExplainer() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`grid md:grid-cols-3 gap-6 mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
    >
      {scores.map(({ key, icon, bg }) => (
        <div
          key={key}
          className={`relative bg-gradient-to-br ${bg} rounded-xl p-8 border border-certo-navy/5 hover:shadow-lg transition-shadow duration-300 group`}
        >
          <div className="flex justify-center mb-6">
            <img
              src={icon}
              alt={key}
              className="w-20 h-20 md:w-24 md:h-24 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h3 className="font-serif font-bold text-certo-navy text-2xl md:text-3xl text-center mb-3">
            {t(`${key}_title`)}
          </h3>
          <p className="text-sm md:text-base text-certo-navy/60 leading-relaxed text-center">
            {t(`${key}_desc`)}
          </p>
        </div>
      ))}
    </section>
  );
}
