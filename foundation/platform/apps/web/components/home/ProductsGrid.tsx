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
    <section className="w-full py-20 md:py-32 bg-certo-bg">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        <div className="text-center mb-16">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Ekosystem
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-certo-fg">
            {t('products_title')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {products.map(({ key, icon }) => (
            <div
              key={key}
              className="bg-certo-card p-8 border border-certo-card-border rounded-lg hover:border-certo-gold/30 transition-colors"
            >
              {/* Icon + Title side by side */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={icon}
                  alt={key}
                  className="w-12 h-12 object-contain flex-shrink-0"
                />
                <h3 className="font-serif font-bold text-certo-fg text-xl md:text-2xl">
                  {t(`product_${key}_name`)}
                </h3>
              </div>
              <p className="text-sm text-certo-fg-muted leading-relaxed">
                {t(`product_${key}_desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
