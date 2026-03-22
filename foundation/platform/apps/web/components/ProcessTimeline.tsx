'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const SWIPE_THRESHOLD = 50;

const steps = [1, 2, 3, 4] as const;

const icons = [
  // 1 — Zgłoszenie (clipboard)
  <svg key="1" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>,
  // 2 — Analiza (magnifying glass)
  <svg key="2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <path d="M11 8v6M8 11h6" />
  </svg>,
  // 3 — Ocena (chart)
  <svg key="3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>,
  // 4 — Raport (document)
  <svg key="4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>,
];

export default function ProcessTimeline() {
  const t = useTranslations('Pilot');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback((i: number) => {
    setActive(Math.max(0, Math.min(i, steps.length - 1)));
  }, []);

  // Auto-cycle every 1.5s, loop back to start
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [paused]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    if (diff > 0) goTo(active + 1);
    else goTo(active - 1);
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy mb-8">
        {t('timeline_title')}
      </h2>

      {/* Progress bar + step indicators */}
      <div className="relative mb-10">
        {/* Track */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-certo-navy/10" />
        {/* Active track */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-certo-gold transition-all duration-500 ease-out"
          style={{ width: `${(active / (steps.length - 1)) * 100}%` }}
        />

        {/* Step circles */}
        <div className="relative flex justify-between">
          {steps.map((step, i) => (
            <button
              key={step}
              onClick={() => { setActive(i); setPaused(true); }}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i <= active
                    ? 'bg-certo-gold text-white shadow-md shadow-certo-gold/30'
                    : 'bg-white border-2 border-certo-navy/15 text-certo-navy/40'
                } ${i === active ? 'scale-125 ring-4 ring-certo-gold/20' : ''}`}
              >
                {step}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors hidden md:block ${
                  i === active ? 'text-certo-navy' : 'text-certo-navy/40'
                }`}
              >
                {t(`step_${step}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active step content */}
      <div
        className="bg-white rounded-xl border border-certo-navy/5 p-8 md:p-10 cursor-grab active:cursor-grabbing select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10 animate-fadeIn" key={active}>
          {/* Icon */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-certo-gold/10 flex items-center justify-center text-certo-gold shrink-0">
            {icons[active]}
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-4xl md:text-5xl font-serif font-bold text-certo-gold/30">
                0{steps[active]}
              </span>
              <h3 className="font-serif font-extrabold text-certo-navy text-xl md:text-2xl">
                {t(`step_${steps[active]}`)}
              </h3>
            </div>
            <p className="text-base md:text-lg text-certo-navy/60 leading-relaxed">
              {t(`step_${steps[active]}_desc`)}
            </p>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-between mt-8 pt-6 border-t border-certo-navy/5">
          <button
            onClick={() => { goTo(active - 1); setPaused(true); }}
            disabled={active === 0}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              active === 0 ? 'text-certo-navy/20 cursor-not-allowed' : 'text-certo-navy/60 hover:text-certo-gold'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {active > 0 && t(`step_${steps[active - 1]}`)}
          </button>
          <button
            onClick={() => { goTo(active + 1); setPaused(true); }}
            disabled={active === steps.length - 1}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              active === steps.length - 1 ? 'text-certo-navy/20 cursor-not-allowed' : 'text-certo-navy/60 hover:text-certo-gold'
            }`}
          >
            {active < steps.length - 1 && t(`step_${steps[active + 1]}`)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
