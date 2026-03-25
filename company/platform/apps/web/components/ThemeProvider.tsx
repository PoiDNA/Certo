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

const STORAGE_KEY = 'certo-theme';

const DARK_VARS: Record<string, string> = {
  '--certo-bg':          '#0A1E26',
  '--certo-fg':          '#E0F2F5',
  '--certo-fg-muted':    'rgba(224,242,245,0.6)',
  '--certo-card':        '#132830',
  '--certo-card-border': 'rgba(42,122,140,0.25)',
  '--certo-surface':     'rgba(42,122,140,0.10)',
  '--certo-header-bg':   '#0D2430',
};

const LIGHT_VARS: Record<string, string> = {
  '--certo-bg':          '#F4F6F7',
  '--certo-fg':          '#0D3340',
  '--certo-fg-muted':    'rgba(13,51,64,0.6)',
  '--certo-card':        '#FFFFFF',
  '--certo-card-border': 'rgba(42,122,140,0.12)',
  '--certo-surface':     'rgba(42,122,140,0.04)',
  '--certo-header-bg':   '#FFFFFF',
};

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

function applyClass(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  const vars = resolved === 'dark' ? DARK_VARS : LIGHT_VARS;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;

    if (!saved) {
      loadUserTheme().then((userTheme) => {
        if (userTheme) applyTheme(userTheme);
      });
    }

    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      applyTheme(saved);
    } else {
      applyTheme('system');
    }

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

  function applyTheme(t: Theme) {
    const resolved = resolveTheme(t);
    setThemeState(t);
    setResolvedTheme(resolved);
    applyClass(resolved);
    localStorage.setItem(STORAGE_KEY, t);
  }

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    saveUserTheme(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

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
