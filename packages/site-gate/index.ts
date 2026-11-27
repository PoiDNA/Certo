/**
 * Site-wide password gate for the Certo web apps.
 *
 * Called first thing from each app's Edge middleware. While a password is
 * configured, every request without the access cookie gets the password page
 * (or a JSON 401 under /api) instead of the site. With no password configured
 * the gate is off and the app behaves as if it were not there.
 *
 * Uses only Web platform APIs so it runs unchanged in the Edge runtime.
 */

const COOKIE_NAME = 'certo_gate';
const FIELD_NAME = 'site_password';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type Lang = 'pl' | 'en';

export interface SiteGateOptions {
  /** Password that opens the site. Empty or undefined turns the gate off. */
  password: string | undefined;
  /** Name shown on the password page. */
  siteName: string;
  /** Language of the password page when the request does not say. */
  defaultLang?: Lang;
  /**
   * Path prefixes that skip the gate: machine endpoints that carry their own
   * authentication and are never opened in a browser.
   */
  bypass?: readonly string[];
}

const COPY: Record<Lang, { title: string; lead: string; label: string; submit: string; error: string }> = {
  pl: {
    title: 'Dostęp chroniony hasłem',
    lead: 'Serwis jest obecnie dostępny wyłącznie po podaniu hasła.',
    label: 'Hasło',
    submit: 'Wejdź',
    error: 'Nieprawidłowe hasło. Spróbuj ponownie.',
  },
  en: {
    title: 'Password required',
    lead: 'This site is currently available only with a password.',
    label: 'Password',
    submit: 'Enter',
    error: 'Incorrect password. Please try again.',
  },
};

/**
 * Returns the response to send when the request must not reach the site yet,
 * or null when it may continue.
 */
export async function siteGate(request: Request, options: SiteGateOptions): Promise<Response | null> {
  const password = options.password?.trim();
  if (!password) return null;

  const url = new URL(request.url);
  const { pathname } = url;

  if (options.bypass?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  const expected = await tokenFor(password);
  const presented = readCookie(request.headers.get('cookie'), COOKIE_NAME);
  if (presented && safeEqual(presented, expected)) return null;

  let rejected = false;
  if (request.method === 'POST' && isFormPost(request)) {
    const form = await request.formData().catch(() => null);
    const submitted = form?.get(FIELD_NAME);
    if (typeof submitted === 'string') {
      if (safeEqual(await tokenFor(submitted.trim()), expected)) {
        // Back to the same address as a GET, now carrying the cookie.
        return new Response(null, {
          status: 303,
          headers: {
            Location: url.toString(),
            'Set-Cookie': accessCookie(expected, url.protocol === 'https:'),
            'Cache-Control': 'no-store',
          },
        });
      }
      rejected = true;
    }
  }

  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'site_locked' }), {
      status: 401,
      headers: { ...LOCKED_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const lang = pickLang(pathname, request.headers.get('accept-language'), options.defaultLang ?? 'en');
  return new Response(renderPage(lang, options.siteName, rejected), {
    status: 401,
    headers: { ...LOCKED_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

const LOCKED_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
};

/** The cookie holds a digest of the password, so changing the password signs everyone out. */
async function tokenFor(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`certo-site-gate:v1:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function accessCookie(token: string, secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');
    if (separator !== -1 && pair.slice(0, separator).trim() === name) {
      return pair.slice(separator + 1).trim();
    }
  }
  return null;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

function isFormPost(request: Request): boolean {
  const type = request.headers.get('content-type') ?? '';
  return type.startsWith('application/x-www-form-urlencoded') || type.startsWith('multipart/form-data');
}

function pickLang(pathname: string, acceptLanguage: string | null, fallback: Lang): Lang {
  const fromPath = /^\/([a-z]{2})(?:\/|$)/.exec(pathname)?.[1];
  if (fromPath === 'pl' || fromPath === 'en') return fromPath;
  const preferred = /^\s*([a-z]{2})/i.exec(acceptLanguage ?? '')?.[1]?.toLowerCase();
  if (preferred) return preferred === 'pl' ? 'pl' : 'en';
  return fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Rendered outside the app's Tailwind build, so the brand colours are written
// out here: navy #1A2744, cream #F5F0E8, gold #C49A3C (see app/globals.css).
function renderPage(lang: Lang, siteName: string, rejected: boolean): string {
  const copy = COPY[lang];
  const name = escapeHtml(siteName);
  const error = rejected ? `<p class="error" id="gate-error" role="alert">${copy.error}</p>` : '';
  const invalid = rejected ? ' aria-invalid="true" aria-describedby="gate-error"' : '';

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${copy.title} — ${name}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; min-height: 100dvh; padding: 24px;
    display: grid; place-items: center;
    background: #1A2744; color: #F5F0E8;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  main { width: 100%; max-width: 380px; }
  .brand {
    margin: 0 0 32px; color: #C49A3C;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase;
  }
  h1 {
    margin: 0 0 12px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 28px; font-weight: 400; line-height: 1.2;
  }
  .lead { margin: 0 0 28px; font-size: 15px; line-height: 1.55; color: rgba(245, 240, 232, 0.72); }
  label { display: block; margin-bottom: 8px; font-size: 13px; color: rgba(245, 240, 232, 0.72); }
  input {
    width: 100%; padding: 13px 14px;
    font: inherit; font-size: 16px; color: #F5F0E8;
    background: rgba(245, 240, 232, 0.06);
    border: 1px solid rgba(245, 240, 232, 0.28); border-radius: 8px;
  }
  input:focus-visible { outline: 2px solid #C49A3C; outline-offset: 2px; }
  .error { margin: 10px 0 0; font-size: 14px; color: #F3B8AC; }
  button {
    width: 100%; margin-top: 16px; padding: 13px 16px;
    font: inherit; font-size: 15px; font-weight: 600; color: #1A2744;
    background: #C49A3C; border: 0; border-radius: 8px; cursor: pointer;
  }
  button:hover { background: #D4AF6A; }
  button:focus-visible { outline: 2px solid #F5F0E8; outline-offset: 2px; }
</style>
</head>
<body>
<main>
  <p class="brand">${name}</p>
  <h1>${copy.title}</h1>
  <p class="lead">${copy.lead}</p>
  <form method="post">
    <label for="${FIELD_NAME}">${copy.label}</label>
    <input id="${FIELD_NAME}" name="${FIELD_NAME}" type="password" autocomplete="current-password" required autofocus${invalid}>
    ${error}
    <button type="submit">${copy.submit}</button>
  </form>
</main>
</body>
</html>`;
}
