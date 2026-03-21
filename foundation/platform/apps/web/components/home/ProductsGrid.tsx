'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const products = [
  { key: 'roadmap', icon: '📊' },
  { key: 'whistleblower', icon: '🛡' },
  { key: 'own', icon: '🏛' },
  { key: 'certoid', icon: '🔐' },
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
              <div className="text-3xl mb-4">{icon}</div>
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
