import { locales } from '@certo/i18n/config';
import HomeContent from './HomeContent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function Home() {
  return <HomeContent />;
}
