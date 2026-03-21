'use client';

import { useLocale, useTranslations } from 'next-intl';
import { images } from '../../lib/images';

export default function HeroSection() {
  const locale = useLocale();
  const t = useTranslations('Home');

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-b from-certo-navy/80 via-certo-navy/60 to-certo-navy/90" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-8 font-medium">
          Certo Governance Institute
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-certo-cream leading-tight mb-8">
          {t('hero_title')}
        </h1>

        <p className="text-lg md:text-xl text-certo-cream/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('hero_subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollDown}
            className="px-8 py-3 border border-certo-gold text-certo-gold text-sm uppercase tracking-[0.15em] font-medium hover:bg-certo-gold hover:text-white transition-colors duration-300"
          >
            {t('hero_cta_learn')}
          </button>
          <a
            href={`/${locale}/pilot`}
            className="px-8 py-3 bg-certo-gold text-white text-sm uppercase tracking-[0.15em] font-medium hover:bg-certo-gold-light transition-colors duration-300 text-center"
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
