import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Domain Masking for Olimpiada Certo tenants.
 *
 * Custom domains (e.g. certo.edu) get silently rewritten to
 * /pl/olympiad/schools/... while the user sees certo.edu in the URL bar.
 *
 * Mapping: domain → { tenant_id, default_locale }
 */
const DOMAIN_TENANT_MAP: Record<string, { tenant: string; locale: string }> = {
  'certo.edu': { tenant: 'schools', locale: 'pl' },
  'certo.edu.pl': { tenant: 'schools', locale: 'pl' },
  'certo.school': { tenant: 'schools', locale: 'en' },
  'certo.biz': { tenant: 'corporate', locale: 'en' },
  'certo.ngo': { tenant: 'ngo', locale: 'en' },
};

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] || '';

  // Check if this is a custom tenant domain
  const tenantMapping = DOMAIN_TENANT_MAP[host];
  if (tenantMapping) {
    const { tenant, locale } = tenantMapping;
    const pathname = request.nextUrl.pathname;

    // Skip API routes and static files
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
      return NextResponse.next();
    }

    // Rewrite: certo.edu/survey → /pl/olympiad/schools/survey
    // certo.edu/ → /pl/olympiad/schools
    const cleanPath = pathname === '/' ? '' : pathname;
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}/olympiad/${tenant}${cleanPath}`;

    return NextResponse.rewrite(rewriteUrl);
  }

  // Default: standard i18n middleware for certogov.org
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
