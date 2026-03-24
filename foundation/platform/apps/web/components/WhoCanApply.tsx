'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const paths = [
  {
    key: 'representative',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    activeBg: 'bg-certo-navy',
    activeText: 'text-white',
    activeIcon: 'text-certo-gold',
    panelBg: 'bg-certo-navy',
    panelText: 'text-certo-cream',
    panelNote: 'text-certo-gold/80',
  },
  {
    key: 'observer',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    activeBg: 'bg-certo-gold',
    activeText: 'text-white',
    activeIcon: 'text-white',
    panelBg: 'bg-certo-gold',
    panelText: 'text-white',
    panelNote: 'text-white/70',
  },
] as const;

export default function WhoCanApply() {
  const t = useTranslations('Pilot');
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-fg mb-3">
        {t('who_title')}
      </h2>
      <p className="text-base text-certo-fg-muted leading-relaxed mb-8">
        {t('who_intro')}
      </p>

      {/* Two path selectors */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {paths.map((path, i) => {
          const isActive = active === i;
          return (
            <button
              key={path.key}
              onClick={() => setActive(isActive ? null : i)}
              className={`relative overflow-hidden rounded-xl p-6 md:p-8 text-left transition-all duration-500 ${
                isActive
                  ? `${path.activeBg} ${path.activeText} shadow-xl scale-[1.02]`
                  : 'bg-certo-card border border-certo-card-border hover:border-certo-gold/30 hover:shadow-md text-certo-fg'
              }`}
            >
              {/* Decorative circle */}
              <div
                className={`absolute -right-8 -top-8 w-32 h-32 rounded-full transition-all duration-500 ${
                  isActive ? 'bg-certo-card/10 scale-100' : 'bg-certo-navy/[0.02] scale-75'
                }`}
              />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
                  isActive
                    ? 'bg-certo-card/20 ' + path.activeIcon
                    : 'bg-certo-navy/5 text-certo-fg/60'
                }`}>
                  {path.icon}
                </div>

                <h3 className="font-serif font-bold text-2xl md:text-3xl mb-3">
                  {t(`path_${path.key}_title`)}
                </h3>

                <p className={`text-sm md:text-base leading-relaxed mb-4 transition-colors duration-300 ${
                  isActive ? 'text-white/80' : 'text-certo-fg-muted'
                }`}>
                  {t(`path_${path.key}_desc`)}
                </p>

                {/* Expandable note */}
                <div className={`overflow-hidden transition-all duration-500 ${
                  isActive ? 'max-h-40 opacity-100 mt-4 pt-4 border-t border-white/20' : 'max-h-0 opacity-0'
                }`}>
                  <p className={`text-sm italic leading-relaxed ${path.panelNote}`}>
                    {t(`path_${path.key}_note`)}
                  </p>
                </div>

                {/* Expand indicator */}
                <div className={`flex items-center gap-2 mt-4 text-xs font-medium uppercase tracking-wider transition-colors ${
                  isActive ? 'text-white/60' : 'text-certo-gold'
                }`}>
                  <span>{isActive ? '▲' : '▼'}</span>
                  <span>{isActive ? '' : t(`path_${path.key}_title`)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
