import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getUser() {
  const cookieStore = await cookies();
  const sb = createServerClient(
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
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export default async function DocumentPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="py-8">
      <div className="mb-12 border-b-[3px] border-certo-gold pb-6">
        <h1 className="text-4xl font-serif font-bold text-certo-navy tracking-tight">{slug}</h1>
      </div>
    </div>
  );
}
