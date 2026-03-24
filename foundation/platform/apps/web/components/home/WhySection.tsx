'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';
import { images } from '../../lib/images';

const differentiators = [
  { key: 'moodys', icon: 'M' },
  { key: 'iso', icon: 'I' },
  { key: 'esg', icon: 'E' },
] as const;

export default function WhySection() {
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();
  const { ref: ref2, isVisible: isVisible2 } = useScrollReveal();

  return (
    <>
      <section className="w-full py-20 md:py-32 bg-certo-bg">
        <div
          ref={ref}
          className={`max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center reveal-base ${isVisible ? 'reveal-visible' : ''}`}
        >
          <div>
            <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-4 font-medium">
              {t('why_label')}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-fg mb-6 leading-tight">
              {t('why_title')}
            </h2>
            <p className="text-certo-fg-muted leading-relaxed mb-6">
              {t('why_text')}
            </p>
            <p className="text-xl font-serif italic text-certo-fg-muted">
              {t('why_rhetorical')}
            </p>
          </div>

          <div className="aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src={images.whyGovernance}
              alt="Obywatele w nowoczesnym urzędzie publicznym"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-certo-navy">
        <div
          ref={ref2}
          className={`max-w-5xl mx-auto px-6 reveal-base ${isVisible2 ? 'reveal-visible' : ''}`}
        >
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-6 font-medium text-center">
            Czym Certo nie jest
          </p>
          <p className="text-lg md:text-xl text-certo-cream/80 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
            {t('manifest_text')}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {differentiators.map(({ key, icon }) => (
              <div
                key={key}
                className="bg-white/5 backdrop-blur-sm border border-certo-gold/20 rounded-lg p-6 hover:border-certo-gold/40 transition-colors duration-300"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-certo-gold/10 text-certo-gold font-serif font-bold text-lg mb-4">
                  {icon}
                </span>
                <p className="text-certo-cream/90 text-sm leading-relaxed">
                  {t(`differentiation_${key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
