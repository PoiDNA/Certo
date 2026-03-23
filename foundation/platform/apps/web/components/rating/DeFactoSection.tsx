'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

export default function DeFactoSection() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-3xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-4">
        {t('defacto_title')}
      </h2>
      <p className="text-lg text-certo-navy/60 dark:text-certo-dark-text/60 mb-10">
        {t('defacto_subtitle')}
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* De iure */}
        <div className="bg-certo-navy/5 dark:bg-certo-dark-card p-8 border-l-4 border-certo-navy/20 dark:border-certo-dark-border rounded-lg">
          <h3 className="font-serif font-bold text-certo-navy dark:text-certo-dark-text text-lg mb-3">
            {t('defacto_iure')}
          </h3>
          <p className="text-sm text-certo-navy/60 dark:text-certo-dark-text/60 leading-relaxed">
            {t('defacto_iure_desc')}
          </p>
        </div>

        {/* De facto */}
        <div className="bg-certo-gold/5 p-8 border-l-4 border-certo-gold">
          <h3 className="font-serif font-bold text-certo-navy dark:text-certo-dark-text text-lg mb-3">
            {t('defacto_facto')}
          </h3>
          <p className="text-sm text-certo-navy/60 dark:text-certo-dark-text/60 leading-relaxed">
            {t('defacto_facto_desc')}
          </p>
        </div>
      </div>

      {/* Human Control */}
      <div className="bg-certo-navy p-8 rounded-lg text-certo-cream">
        <h3 className="font-serif font-bold text-certo-gold text-lg mb-3">
          {t('human_control_title')}
        </h3>
        <p className="text-sm text-certo-cream/70 leading-relaxed">
          {t('human_control_desc')}
        </p>
      </div>
    </section>
  );
}
