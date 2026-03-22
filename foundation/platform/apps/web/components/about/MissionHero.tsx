'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

const SESSION_KEY = 'certo_about_typed';

export default function MissionHero() {
  const t = useTranslations('About');
  const mission = t('mission_text_1');
  const belief = t('mission_text_2');

  // Check if already played this session
  const alreadyPlayed = typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';

  const [typed, setTyped] = useState(alreadyPlayed ? mission : '');
  const [showCursor, setShowCursor] = useState(!alreadyPlayed);
  const [typingDone, setTypingDone] = useState(alreadyPlayed);
  const [beliefVisible, setBeliefVisible] = useState(alreadyPlayed);
  const sectionRef = useRef<HTMLElement>(null);
  const started = useRef(alreadyPlayed);

  useEffect(() => {
    if (alreadyPlayed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          startTyping();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  function startTyping() {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(mission.slice(0, i));
      if (i >= mission.length) {
        clearInterval(interval);
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
        setTimeout(() => {
          setShowCursor(false);
          setTypingDone(true);
          setTimeout(() => setBeliefVisible(true), 300);
        }, 400);
      }
    }, 65);
  }

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-36 bg-certo-navy text-center overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="sr-only">{t('title')}</h1>

        {/* Typewriter line */}
        <div className="min-h-[120px] md:min-h-[160px] flex items-center justify-center mb-12">
          <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-certo-cream leading-relaxed max-w-3xl">
            {typed}
            {showCursor && (
              <span className="inline-block w-[3px] h-[1.1em] bg-certo-gold ml-1 align-middle animate-blink" />
            )}
          </p>
        </div>

        {/* Divider line */}
        <div className={`mx-auto transition-all duration-1000 ease-out ${
          typingDone ? 'w-24 opacity-100' : 'w-0 opacity-0'
        }`}>
          <div className="h-px bg-certo-gold/40" />
        </div>

        {/* Belief — slides up */}
        <div className={`transition-all duration-1000 ease-out ${
          beliefVisible
            ? 'opacity-100 translate-y-0 mt-12'
            : 'opacity-0 translate-y-8 mt-12'
        }`}>
          <p className="text-xl md:text-2xl lg:text-3xl font-serif text-certo-gold/80 leading-relaxed max-w-3xl mx-auto italic">
            {belief}
          </p>
        </div>
      </div>
    </section>
  );
}
