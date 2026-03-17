'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function AuthNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  if (!isAuthenticated) return null;

  return (
    <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide items-center">
      <a href="/docs" className="text-certo-cream hover:text-certo-gold transition-colors duration-200 uppercase">Dokumenty</a>
      <a href="/pipeline" className="text-certo-cream hover:text-certo-gold transition-colors duration-200 uppercase">Pipeline</a>
    </nav>
  );
}
