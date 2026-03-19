'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

export default function AuthNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Avoid hydration mismatch by not rendering until session state is determined
  if (isAuthenticated === null) return <nav className="flex gap-8" />;

  if (!isAuthenticated) {
    return (
      <nav className="flex gap-8 text-sm font-medium tracking-wide items-center">
        <a href={`/${locale}/login`} className="text-certo-gold hover:text-certo-gold-light transition-colors duration-300 uppercase">
          {t('login')}
        </a>
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide items-center">
      <a href={`/${locale}/docs`} className="text-certo-cream hover:text-certo-gold transition-colors duration-200 uppercase">{t('documents')}</a>
      <a href={`/${locale}/pipeline`} className="text-certo-cream hover:text-certo-gold transition-colors duration-200 uppercase">{t('pipeline')}</a>
      <a href={`/${locale}/docs`} className="border border-certo-gold/50 text-certo-gold bg-certo-navy px-5 py-2 hover:bg-certo-gold hover:text-white transition-colors duration-300 rounded-[2px] uppercase">
        {t('dashboard')}
      </a>
    </nav>
  );
}
