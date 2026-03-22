'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const standards = [
  { name: 'ISO 9001:2015', desc: 'Zarządzanie jakością' },
  { name: 'ISO/IEC 27001:2022', desc: 'Bezpieczeństwo informacji' },
  { name: 'ISO 37001:2025', desc: 'Zarządzanie antykorupcyjne' },
  { name: 'ISO 37301:2021', desc: 'Zarządzanie zgodnością' },
  { name: 'ISO/IEC 42001:2023', desc: 'Zarządzanie AI' },
  { name: 'IOSCO + Peer Review', desc: 'Nadzór metodologiczny' },
];

export default function StandardsSection() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-3xl font-serif font-bold text-certo-navy mb-10">
        {t('standards_title')}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {standards.map(({ name, desc }) => (
          <div key={name} className="bg-white p-6 border border-certo-navy/5 rounded-lg hover:border-certo-gold/30 transition-colors">
            <h3 className="font-mono text-sm font-bold text-certo-navy mb-1">{name}</h3>
            <p className="text-xs text-certo-navy/60">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
