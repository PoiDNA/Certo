'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';
import { images } from '../../lib/images';

export default function FounderPreamble() {
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="w-full py-20 md:py-32 bg-certo-cream dark:bg-certo-dark-bg">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-6 text-center reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        {/* Decorative quote mark */}
        <div className="text-certo-gold/30 text-8xl font-serif leading-none mb-6">&ldquo;</div>

        <p className="text-xl md:text-2xl font-serif text-certo-navy dark:text-certo-dark-text leading-relaxed mb-8">
          {t('founder_quote')}
        </p>

        <blockquote className="text-lg md:text-xl font-serif italic text-[#5C3D2E] leading-relaxed mb-10 border-l-4 border-[#5C3D2E]/30 pl-6 text-left">
          {t('founder_certo_quote')}
        </blockquote>

        {/* Founder info */}
        <div className="flex flex-col items-center gap-4">
          {/* Portrait */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-certo-gold/30 shadow-lg">
            <img
              src={images.founderPortrait}
              alt={t('founder_name')}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="font-serif font-bold text-certo-navy dark:text-certo-dark-text">{t('founder_name')}</p>
            <p className="text-sm text-certo-navy/60 dark:text-certo-dark-text/60">{t('founder_title')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
