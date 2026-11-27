import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n-config';
import { locales } from '@certo/i18n/config';
import { siteGate } from '@certo/site-gate';

const intlMiddleware = createMiddleware(routing);

// API routes, Next internals and files: the gate covers them, routing does not.
const GATE_ONLY = /^\/(?:api|_next|_vercel)|\./;

export async function middleware(request: NextRequest) {
  const locked = await siteGate(request, {
    password: process.env.SITE_PASSWORD,
    siteName: 'Certo ID',
    defaultLang: 'en',
  });
  if (locked) return locked;

  const { pathname } = request.nextUrl;

  if (GATE_ONLY.test(pathname)) return NextResponse.next();

  // Zwróć od razu jeśli to statyki
  if (pathname.includes('/_next/') || pathname.includes('/favicon.ico') || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)) {
    return NextResponse.next();
  }

  // Logout: pomiń intlMiddleware żeby uniknąć redirect /auth/logout → /pl/auth/logout → 404
  const isLogoutPath = pathname === '/auth/logout' ||
    locales.some(l => pathname === `/${l}/auth/logout`);
  if (isLogoutPath) {
    return NextResponse.next();
  }

  // Uruchamiamy middleware i18n najpierw, on nadpisze cookies locale jeśli trzeba
  const response = await intlMiddleware(request);

  let supabaseResponse = response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Tylko strony logowania/wylogowania są publiczne
  const isPublic = ['/login', '/auth/callback', '/auth/logout'].some(p => {
    if (pathname === p || pathname.startsWith(`${p}/`)) return true;
    return locales.some(l => pathname === `/${l}${p}` || pathname.startsWith(`/${l}${p}/`));
  });

  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // Sprawdzamy czy zalogowany użytkownik ma rolę admina
  if (user && !isPublic) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes((user.email ?? '').toLowerCase());
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // Cache-Control: no-store dla chronionych stron — uniknięcie "cofnij = zalogowany"
  supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  supabaseResponse.headers.set('Pragma', 'no-cache');
  supabaseResponse.headers.set('Expires', '0');

  return supabaseResponse;
}

// Everything except build assets, so the password gate covers the whole site.
export const config = {
  matcher: ['/((?!_next/static|_next/webpack-hmr|_vercel|favicon\\.ico).*)'],
};
