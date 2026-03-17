'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/docs';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleOAuth = async (provider: 'google' | 'azure') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        scopes: provider === 'azure' ? 'email profile' : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-certo-cream font-serif px-4">
      <div className="bg-white border-[2px] border-certo-gold/30 rounded-sm p-10 w-full max-w-md text-center shadow-lg">
        <div className="mb-8">
          <img 
            src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/certo-logo-black-200-120.png" 
            alt="Certo Governance Institute" 
            className="h-16 w-auto mx-auto mb-4"
          />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-certo-navy">
          Zaloguj się
        </h1>
        <p className="text-sm text-certo-navy/60 mb-8 font-sans">
          Dostęp do dokumentów Fundacji wymaga weryfikacji tożsamości.
        </p>
        
        <div className="flex flex-col gap-3 font-sans">
          <button onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-3 px-6 py-3 border border-certo-navy/20 rounded-sm bg-white cursor-pointer text-sm font-semibold text-certo-navy w-full hover:bg-certo-navy/5 hover:border-certo-navy/40 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Zaloguj przez Google
          </button>
          
          <button onClick={() => handleOAuth('azure')} className="flex items-center justify-center gap-3 px-6 py-3 border border-certo-navy/20 rounded-sm bg-white cursor-pointer text-sm font-semibold text-certo-navy w-full hover:bg-certo-navy/5 hover:border-certo-navy/40 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#0078D4" d="M11.4 24H0l9.6-9.6L0 4.8h11.4L24 24H11.4z"/>
              <path fill="#50E6FF" d="M12.6 0H24L14.4 9.6 24 19.2H12.6L0 0h12.6z"/>
            </svg>
            Zaloguj przez Microsoft
          </button>
        </div>
        
        <p className="mt-8 text-xs text-certo-navy/40 font-sans tracking-wide">
          Governance, certain. © {new Date().getFullYear()}
        </p>
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
