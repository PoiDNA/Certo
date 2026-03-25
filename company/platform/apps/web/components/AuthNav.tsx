import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

export default async function AuthNav() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = headerStore.get('x-next-intl-locale') ?? 'en';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return (
      <a
        href={`/${locale}/auth/logout`}
        className="text-sm font-medium text-certo-teal hover:text-certo-teal-dark transition-colors duration-300 uppercase tracking-wide"
        aria-label="Wyloguj się"
      >
        Wyloguj
      </a>
    );
  }

  return (
    <a
      href={`/${locale}/login`}
      className="text-sm font-medium text-certo-teal hover:text-certo-teal-dark transition-colors duration-300 uppercase tracking-wide"
      aria-label="Zaloguj się"
    >
      Log In
    </a>
  );
}
