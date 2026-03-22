'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const ICON_BASE = 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1/ico';

const products = [
  { key: 'roadmap', icon: `${ICON_BASE}/I1.png` },
  { key: 'whistleblower', icon: `${ICON_BASE}/I2.png` },
  { key: 'own', icon: `${ICON_BASE}/I3.png` },
  { key: 'certoid', icon: `${ICON_BASE}/I4.png` },
] as const;

export default function ProductsGrid() {
  const t = useTranslations('Home');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="w-full py-20 md:py-32 bg-certo-cream">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        <div className="text-center mb-16">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Ekosystem
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-navy">
            {t('products_title')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(({ key, icon }) => (
            <div
              key={key}
              className="bg-white p-8 border border-certo-navy/5 hover:border-certo-gold/30 transition-colors"
            >
              <img
                src={icon}
                alt={key}
                className="w-12 h-12 mb-4 object-contain"
              />
              <h3 className="font-serif font-bold text-certo-navy mb-3">
                {t(`product_${key}_name`)}
              </h3>
              <p className="text-sm text-certo-navy/60 leading-relaxed">
                {t(`product_${key}_desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
