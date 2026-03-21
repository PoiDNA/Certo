'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';
import { images } from '../../lib/images';

export default function WhySection() {
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="w-full py-20 md:py-32 bg-certo-cream">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        {/* Text */}
        <div>
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            {t('why_label')}
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-navy mb-6 leading-tight">
            {t('why_title')}
          </h2>
          <p className="text-certo-navy/70 leading-relaxed mb-6">
            {t('why_text')}
          </p>
          <p className="text-xl font-serif italic text-certo-navy/80">
            {t('why_rhetorical')}
          </p>
        </div>

        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={images.whyGovernance}
            alt="Obywatele w nowoczesnym urzędzie publicznym"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
