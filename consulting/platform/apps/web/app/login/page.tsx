'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Suspense } from 'react';

function LoginContent() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  const handleOAuth = async (provider: 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-certo-primary px-4">
      <div className="w-full max-w-sm p-8 bg-white rounded-[8px] shadow-2xl border border-certo-border text-center">
        <div className="mb-8">
          <img 
            src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/consulting/certo-consulting-logo-black-800-120.png" 
            alt="Certo Consulting" 
            className="h-[40px] w-auto mx-auto mb-4 block" 
          />
        </div>
        
        <p className="text-sm text-certo-muted mb-8 font-light">
          Dostęp wyłącznie dla akredytowanych doradców Certo Consulting.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => handleOAuth('google')} 
            className="flex items-center justify-center gap-3 px-6 py-3 border border-certo-primary/20 rounded-md bg-transparent cursor-pointer text-sm font-semibold text-certo-primary hover:bg-certo-surface transition-colors w-full"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Zaloguj przez Google
          </button>
        </div>
        
        <div className="mt-8 flex justify-center gap-6">
          <a href="/polityka" className="text-xs text-certo-muted hover:text-certo-primary transition-colors">
            Polityka Prywatności
          </a>
          <a href="/regulamin" className="text-xs text-certo-muted hover:text-certo-primary transition-colors">
            Warunki Korzystania
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
