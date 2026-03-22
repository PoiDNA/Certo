'use client';

import { useTranslations } from 'next-intl';
import ScrollRevealSection from './ScrollRevealSection';
import { images } from '../../lib/images';

const BANNER_URL =
  'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1/Certo-Fact-DeNoiser-2.png';

export default function FactDeNoiserSection() {
  const t = useTranslations('Home');

  return (
    <ScrollRevealSection
      imageUrl={images.dataAnalysis}
      alt="Wizualizacja danych analitycznych"
      overlay="bg-certo-navy/92"
    >
      <div className="text-center">
        {/* Fixed-height banner — no scaling, overflow hidden */}
        <div className="w-full h-[200px] overflow-hidden mb-8 -mx-6 md:mx-0">
          <img
            src={BANNER_URL}
            alt="Certo Fact DeNoiser"
            className="w-full h-[200px] object-cover object-center"
            style={{ minWidth: '2000px', maxHeight: '200px' }}
          />
        </div>

        {/* Large title */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream mb-12">
          Certo Fact DeNoiser
        </h2>

        {/* 3 layers */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {(['1', '2', '3'] as const).map((key) => (
            <div key={key} className="text-left">
              <div className="text-certo-gold font-bold text-2xl mb-2">{key}</div>
              <h3 className="text-certo-cream font-serif font-extrabold text-2xl md:text-xl mb-2">
                {t(`denoiser_layer_${key}_name`)}
              </h3>
              <p className="text-certo-cream/60 text-sm leading-relaxed">
                {t(`denoiser_layer_${key}_desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* Subtitle moved below the 3 layers */}
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-certo-cream/80">
          {t('denoiser_title')}
        </h3>
      </div>
    </ScrollRevealSection>
  );
}
