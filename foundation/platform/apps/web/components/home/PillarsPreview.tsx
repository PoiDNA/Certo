'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const pillars = [
  { key: '1', weight: 25, accent: 'text-certo-gold', bar: 'bg-certo-gold', border: 'border-certo-gold' },
  { key: '2', weight: 25, accent: 'text-certo-gold', bar: 'bg-certo-gold/80', border: 'border-certo-gold/60' },
  { key: '3', weight: 20, accent: 'text-certo-navy', bar: 'bg-certo-navy', border: 'border-certo-navy' },
  { key: '4', weight: 15, accent: 'text-certo-navy/70', bar: 'bg-certo-navy/70', border: 'border-certo-navy/50' },
  { key: '5', weight: 15, accent: 'text-certo-navy/50', bar: 'bg-certo-navy/50', border: 'border-certo-navy/30' },
];

const SWIPE_THRESHOLD = 50;

export default function PillarsPreview() {
  const locale = useLocale();
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseStartX = useRef(0);
  const isDragging = useRef(false);

  const goTo = useCallback((i: number) => {
    setActive(((i % pillars.length) + pillars.length) % pillars.length);
  }, []);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused || !isVisible) return;
    const timer = setInterval(() => goTo(active + 1), 4000);
    return () => clearInterval(timer);
  }, [paused, isVisible, active, goTo]);

  const handleSwipe = useCallback((startX: number, endX: number) => {
    const diff = startX - endX;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    setPaused(true);
    if (diff > 0) next();
    else prev();
  }, [next, prev]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    handleSwipe(touchStartX.current, touchEndX.current);
  };

  // Mouse drag events
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };
  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleSwipe(mouseStartX.current, touchEndX.current);
  };
  const onMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      handleSwipe(mouseStartX.current, touchEndX.current);
    }
    setPaused(false);
  };

  const current = pillars[active];

  return (
    <section className="w-full py-20 md:py-32 bg-certo-card/50">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        <div className="text-center mb-16">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Rating Certo
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-certo-fg mb-4">
            {t('pillars_title')}
          </h2>
          <p className="text-lg text-certo-fg-muted max-w-2xl mx-auto">
            {t('pillars_subtitle')}
          </p>
        </div>

        {/* Slider with swipe/drag */}
        <div
          className="relative cursor-grab active:cursor-grabbing select-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={onMouseLeave}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Main slide */}
          <div className={`bg-certo-card rounded-xl border-l-4 ${current.border} p-8 md:p-12 min-h-[220px] flex items-center transition-all duration-500`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 w-full">
              <div className="shrink-0">
                <span className={`text-7xl md:text-8xl lg:text-9xl font-serif font-bold ${current.accent} leading-none`}>
                  {current.weight}%
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-extrabold text-certo-fg text-2xl md:text-3xl mb-3">
                  {t(`pillar_${current.key}_name`)}
                </h3>
                <p className="text-base md:text-lg text-certo-fg-muted leading-relaxed">
                  {t(`pillar_${current.key}_short`)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {pillars.map((pillar, i) => (
              <button
                key={pillar.key}
                onClick={() => { setActive(i); setPaused(true); }}
                className={`relative h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'w-10 bg-certo-gold' : 'w-2 bg-certo-fg-muted/20 hover:bg-certo-fg-muted/40'
                }`}
                aria-label={t(`pillar_${pillar.key}_name`)}
              />
            ))}
          </div>

          {/* Mini thumbnails */}
          <div className="hidden md:grid grid-cols-5 gap-3 mt-8">
            {pillars.map((pillar, i) => (
              <button
                key={pillar.key}
                onClick={() => { setActive(i); setPaused(true); }}
                className={`text-left p-4 rounded-lg transition-all duration-300 ${
                  i === active
                    ? 'bg-certo-navy text-white'
                    : 'bg-certo-card border border-certo-card-border hover:border-certo-gold/30 text-certo-fg'
                }`}
              >
                <span className={`text-lg font-bold ${i === active ? 'text-certo-gold' : pillar.accent}`}>
                  {pillar.weight}%
                </span>
                <span className={`block text-xs font-medium mt-1 ${i === active ? 'text-white/80' : 'text-certo-fg-muted'}`}>
                  {t(`pillar_${pillar.key}_name`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <a
            href={`/${locale}/ratings`}
            className="inline-block text-sm text-certo-gold font-medium hover:text-certo-gold-light transition-colors uppercase tracking-[0.1em]"
          >
            {t('pillars_cta')} &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
