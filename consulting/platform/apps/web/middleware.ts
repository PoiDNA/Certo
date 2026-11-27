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
    siteName: 'Certo Consulting',
    defaultLang: 'pl',
  });
  if (locked) return locked;

  const { pathname } = request.nextUrl;

  if (GATE_ONLY.test(pathname)) return NextResponse.next();


  if (pathname.includes('/_next/') || pathname.includes('/favicon.ico') || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)) {
    return NextResponse.next();
  }

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

  // Omijamy autoryzację dla publicznych ścieżek
  const isPublic = ['/', '/login', '/auth/callback', '/auth/logout', '/polityka', '/regulamin', '/contact'].some(p => {
    if (pathname === p || pathname.startsWith(`${p}/`)) return true;
    return locales.some(l => pathname === `/${l}${p === '/' ? '' : p}` || pathname.startsWith(`/${l}${p}/`));
  });

  if (!user && !isPublic && !pathname.includes('/auth/callback')) {
    const url = request.nextUrl.clone();
    const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Everything except build assets, so the password gate covers the whole site.
export const config = {
  matcher: ['/((?!_next/static|_next/webpack-hmr|_vercel|favicon\\.ico).*)'],
};
