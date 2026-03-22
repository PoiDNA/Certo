'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const ICON_BASE = 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1/ico';

const scores = [
  {
    key: 'score',
    icon: `${ICON_BASE}/I-I-1.png`,
    gradient: 'from-amber-50 via-amber-100/40 to-white',
    activeBorder: 'border-certo-gold',
    accentColor: 'text-certo-gold',
  },
  {
    key: 'vector',
    icon: `${ICON_BASE}/I-I-3.png`,
    gradient: 'from-slate-100 via-blue-50/40 to-white',
    activeBorder: 'border-certo-navy/60',
    accentColor: 'text-certo-navy',
  },
] as const;

export default function ScoreExplainer() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      className={`mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {scores.map(({ key, icon, gradient, activeBorder, accentColor }, i) => {
          const isActive = active === i;
          return (
            <button
              key={key}
              onClick={() => setActive(isActive ? null : i)}
              onMouseEnter={() => setActive(i)}
              className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-8 md:p-10 text-left transition-all duration-500 border-2 ${
                isActive
                  ? `${activeBorder} shadow-2xl scale-[1.02]`
                  : 'border-transparent hover:shadow-lg'
              }`}
            >
              {/* Decorative glow */}
              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`} style={{
                background: `radial-gradient(circle at 30% 30%, ${key === 'score' ? 'rgba(204,155,48,0.08)' : 'rgba(10,22,40,0.05)'}, transparent 70%)`,
              }} />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Diamond image */}
                <div className="shrink-0">
                  <img
                    src={icon}
                    alt={key}
                    className={`w-24 h-24 md:w-32 md:h-32 object-contain transition-transform duration-500 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="text-center md:text-left flex-1">
                  <h3 className={`font-serif font-bold text-3xl md:text-4xl mb-3 transition-colors duration-300 ${
                    isActive ? accentColor : 'text-certo-navy'
                  }`}>
                    {t(`${key}_title`)}
                  </h3>
                  <p className="text-base md:text-lg text-certo-navy/60 leading-relaxed">
                    {t(`${key}_desc`)}
                  </p>
                </div>
              </div>

              {/* Expand indicator */}
              <div className={`absolute bottom-4 right-6 transition-all duration-300 ${
                isActive ? 'opacity-0' : 'opacity-40'
              }`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-certo-navy/30">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
