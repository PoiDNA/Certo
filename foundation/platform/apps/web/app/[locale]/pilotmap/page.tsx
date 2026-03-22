import { locales } from '@certo/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import PilotMapClient from './PilotMapClient';

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
      {/* Hero */}
      <section className="py-16 md:py-24 bg-certo-navy text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-cream mb-4">
            Mapa Zgłoszeń
          </h1>
          <p className="text-lg text-certo-cream/60">
            Podmioty zgłoszone do bezpłatnego procesu oceny wiarygodności publicznej w ramach Rating Certo
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <PilotMapClient />
      </section>
    </div>
  );
}
