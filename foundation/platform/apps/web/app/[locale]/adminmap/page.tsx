import { locales } from '@certo/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import AdminDashboard from './AdminDashboard';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Admin — Zgłoszenia pilotażowe',
    robots: { index: false, follow: false },
  };
}

export default async function AdminMapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full">
      <section className="py-12 md:py-16 bg-certo-navy text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-certo-cream mb-2">
            Panel administracyjny
          </h1>
          <p className="text-sm text-certo-cream/50">Zarządzanie zgłoszeniami pilotażowymi</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-8">
        <AdminDashboard />
      </section>
    </div>
  );
}
