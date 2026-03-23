'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';

export default function AuthNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    setMenuOpen(false);
    window.location.href = `/${locale}`;
  };

  // Avoid hydration mismatch
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
    <nav className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        onMouseEnter={() => setMenuOpen(true)}
        className="border border-certo-gold/50 text-certo-gold bg-certo-navy dark:bg-certo-dark-header px-5 py-2 hover:bg-certo-gold hover:text-white transition-colors duration-300 rounded-[2px] uppercase text-sm font-medium tracking-wide"
      >
        {t('dashboard')}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-48 bg-certo-navy dark:bg-certo-dark-header border border-certo-gold/30 rounded-[2px] shadow-xl z-50 overflow-hidden"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <a
            href={`/${locale}/docs`}
            className="block px-4 py-3 text-sm text-certo-cream/80 hover:text-certo-gold hover:bg-certo-gold/5 transition-colors uppercase tracking-wide"
            onClick={() => setMenuOpen(false)}
          >
            {t('documents')}
          </a>
          <a
            href={`/${locale}/pipeline`}
            className="block px-4 py-3 text-sm text-certo-cream/80 hover:text-certo-gold hover:bg-certo-gold/5 transition-colors uppercase tracking-wide"
            onClick={() => setMenuOpen(false)}
          >
            {t('pipeline')}
          </a>
          <div className="border-t border-certo-gold/20" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/5 transition-colors uppercase tracking-wide"
          >
            Wyloguj
          </button>
        </div>
      )}
    </nav>
  );
}
