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
        {/* Large title */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream mb-4">
          Certo Fact DeNoiser
        </h2>

        {/* Subtitle — sans-serif like description text */}
        <p className="text-lg md:text-xl text-certo-cream/60 leading-relaxed mb-12">
          {t('denoiser_title')}
        </p>

        {/* 3 layers */}
        <div className="grid md:grid-cols-3 gap-8">
          {(['1', '2', '3'] as const).map((key) => (
            <div key={key} className="flex items-start gap-4 text-left">
              <div className="text-certo-gold font-bold text-6xl md:text-7xl leading-none shrink-0">{key}</div>
              <div>
                <h3 className="text-certo-cream font-serif font-extrabold text-2xl md:text-xl mb-2">
                  {t(`denoiser_layer_${key}_name`)}
                </h3>
                <p className="text-certo-cream/60 text-sm leading-relaxed">
                  {t(`denoiser_layer_${key}_desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollRevealSection>
  );
}
