import { locales } from '@certo/i18n/config';
import LoginContent from './LoginContent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LoginPage() {
  return <LoginContent />;
}
