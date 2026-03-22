import { locales } from '@certo/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import PilotMapClient from './PilotMapClient';
import { images } from '../../../lib/images';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Mapa Zgłoszeń — Rating Certo',
    description: 'Podmioty zgłoszone do bezpłatnego procesu oceny wiarygodności publicznej w ramach Rating Certo',
    robots: { index: false, follow: false },
  };
}

export default async function PilotMapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full">
      {/* Hero with background image */}
      <section className="relative py-14 md:py-20 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed-cover"
          style={{
            backgroundImage: `url(${images.pilotHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-certo-navy/85 via-certo-navy/75 to-certo-navy/90" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <p className="text-certo-gold text-xs uppercase tracking-[0.25em] mb-4 font-medium">Q4 2026</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream">
            Mapa Zgłoszeń
          </h1>
        </div>
      </section>

      {/* Map + Table — overlapping hero */}
      <section className="relative -mt-10 z-10 max-w-6xl mx-auto px-6 pb-16">
        <PilotMapClient />
      </section>

      {/* CTA — apply */}
      <section className="bg-certo-navy/[0.03] border-t border-certo-navy/5">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-certo-navy mb-4">
            Zgłoś podmiot do pilotażu
          </h2>
          <p className="text-base text-certo-navy/60 max-w-xl mx-auto mb-8">
            Bezpłatny proces oceny wiarygodności publicznej na bazie jakości zarządzania — Q4 2026
          </p>
          <a
            href={`/${locale}/pilot`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-certo-gold text-white font-semibold rounded-full hover:bg-certo-gold/90 transition-colors shadow-lg shadow-certo-gold/20"
          >
            Zgłoś podmiot
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
