'use client';

import { useTranslations } from 'next-intl';
import ScrollRevealSection from './ScrollRevealSection';
import { images } from '../../lib/images';

export default function FactDeNoiserSection() {
  const t = useTranslations('Home');

  return (
    <ScrollRevealSection
      imageUrl={images.dataAnalysis}
      alt="Wizualizacja danych analitycznych"
      overlay="bg-certo-navy/92"
    >
      <div className="text-center">
        <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-6 font-medium">
          Certo Fact DeNoiser
        </p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-cream mb-8">
          {t('denoiser_title')}
        </h2>

        {/* 3 layers */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {(['1', '2', '3'] as const).map((key) => (
            <div key={key} className="text-left">
              <div className="text-certo-gold font-bold text-2xl mb-2">{key}</div>
              <h3 className="text-certo-cream font-serif font-bold mb-2">
                {t(`denoiser_layer_${key}_name`)}
              </h3>
              <p className="text-certo-cream/60 text-sm leading-relaxed">
                {t(`denoiser_layer_${key}_desc`)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-lg font-serif italic text-certo-gold leading-relaxed">
          {t('denoiser_quote')}
        </p>
      </div>
    </ScrollRevealSection>
  );
}
