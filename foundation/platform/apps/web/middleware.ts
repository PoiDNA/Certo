import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n-config';

export default createMiddleware(routing);

export const config = {
  // Omiń wszystkie ścieżki niezwiązane z routingiem aplikacji (API, pliki statyczne, obrazy, it/next)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};