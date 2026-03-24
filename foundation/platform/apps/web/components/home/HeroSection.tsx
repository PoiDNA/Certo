'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { images } from '../../lib/images';

export default function HeroSection() {
  const locale = useLocale();
  const t = useTranslations('Home');
  const [activeLayer, setActiveLayer] = useState<'citizen' | 'institution'>('citizen');

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 bg-fixed-cover scale-105"
        style={{
          backgroundImage: `url(${images.heroMain})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-certo-navy/95 via-certo-navy/90 to-certo-navy/98" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-12">
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-certo-navy/50 backdrop-blur-sm border border-certo-gold/30 rounded-full p-1">
            <button
              onClick={() => setActiveLayer('citizen')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeLayer === 'citizen'
                  ? 'bg-certo-gold text-white shadow-lg'
                  : 'text-certo-cream/70 hover:text-certo-cream hover:bg-white/5'
              }`}
            >
              {t('hero_toggle_citizen')}
            </button>
            <button
              onClick={() => setActiveLayer('institution')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeLayer === 'institution'
                  ? 'bg-certo-gold text-white shadow-lg'
                  : 'text-certo-cream/70 hover:text-certo-cream hover:bg-white/5'
              }`}
            >
              {t('hero_toggle_institution')}
            </button>
          </div>
        </div>

        <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-6 font-medium">
          Certo Governance Institute
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-certo-cream leading-tight mb-8 transition-opacity duration-300 min-h-[120px] sm:min-h-[96px] md:min-h-[120px] flex items-center justify-center">
          {activeLayer === 'citizen' ? t('hero_title') : t('hero_title_prof')}
        </h1>

        <p className="text-lg md:text-xl text-certo-cream/70 max-w-2xl mx-auto mb-12 leading-relaxed transition-opacity duration-300 min-h-[90px]">
          {activeLayer === 'citizen' ? t('hero_subtitle_kowalski') : t('hero_subtitle_prof')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollDown}
            className="px-8 py-3 border border-certo-gold text-certo-gold text-sm uppercase tracking-[0.15em] font-medium hover:bg-certo-gold hover:text-white transition-colors duration-300 rounded-lg"
          >
            {t('hero_cta_learn')}
          </button>
          <a
            href={`/${locale}/pilot`}
            className="px-8 py-3 bg-certo-gold text-white text-sm uppercase tracking-[0.15em] font-medium hover:bg-certo-gold-light transition-colors duration-300 text-center rounded-lg"
          >
            {t('hero_cta_pilot')}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-certo-gold/60 hover:text-certo-gold transition-colors animate-bounce"
        aria-label="Przewiń w dół"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </button>
    </section>
  );
}
