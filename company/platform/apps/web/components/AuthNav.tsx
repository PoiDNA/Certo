import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function AuthNav() {
  const cookieStore = await cookies();

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
      <div className="flex items-center gap-4">
        <span className="text-xs text-certo-teal-dark hidden lg:block truncate max-w-[160px]">
          {user.email}
        </span>
        <a
          href="/auth/logout"
          className="text-sm font-medium text-certo-teal hover:text-certo-teal-dark transition-colors duration-300 uppercase tracking-wide"
        >
          Wyloguj
        </a>
      </div>
    );
  }

  return (
    <a
      href="/en/login"
      className="text-sm font-medium text-certo-teal hover:text-certo-teal-dark transition-colors duration-300 uppercase tracking-wide"
    >
      Log In
    </a>
  );
}
