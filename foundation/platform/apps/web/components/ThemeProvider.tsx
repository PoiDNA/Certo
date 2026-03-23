'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Storage key for theme preference.
 * For logged-in users, preference is also saved to Supabase user metadata.
 */
const STORAGE_KEY = 'certo-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load saved theme on mount
  useEffect(() => {
    // 1. Try localStorage first
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;

    // 2. Try Supabase user metadata (for logged-in users)
    if (!saved) {
      loadUserTheme().then((userTheme) => {
        if (userTheme) {
          applyTheme(userTheme);
        }
      });
    }

    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      applyTheme(saved);
    } else {
      applyTheme('system');
    }

    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme());
        applyClass(getSystemTheme());
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyClass(resolved: 'light' | 'dark') {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  function applyTheme(t: Theme) {
    const resolved = resolveTheme(t);
    setThemeState(t);
    setResolvedTheme(resolved);
    applyClass(resolved);
    localStorage.setItem(STORAGE_KEY, t);
  }

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    // Save to Supabase for logged-in users (fire and forget)
    saveUserTheme(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Supabase persistence for logged-in users ───────────────────────────────

async function loadUserTheme(): Promise<Theme | null> {
  try {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const saved = user.user_metadata?.theme;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return null;
  } catch {
    return null;
  }
}

async function saveUserTheme(theme: Theme) {
  try {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    await sb.auth.updateUser({ data: { theme } });
  } catch {
    // silent fail — localStorage is the fallback
  }
}
