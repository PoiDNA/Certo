import { locales } from '@certo/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import HomeContent from './HomeContent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}
