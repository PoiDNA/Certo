import { Suspense } from 'react';
import { locales } from '@certo/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import LoginContent from './LoginContent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Suspense><LoginContent /></Suspense>;
}
