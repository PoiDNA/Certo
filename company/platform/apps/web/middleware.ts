import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n-config';
import { locales } from '@certo/i18n/config';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
