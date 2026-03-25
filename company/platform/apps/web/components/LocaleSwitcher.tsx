'use client';

import { useRef, useEffect, useState, useTransition, useMemo } from 'react';
import { localeDisplayNames, localeGroups } from '@certo/i18n/locale-display-names';
import { locales, type Locale } from '@certo/i18n/config';
import { useRouter, usePathname } from '../i18n-config';
import { useLocale } from 'next-intl';

export default function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState('');

  const switchTo = (locale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  const filteredGroups = useMemo(() => {
    if (!filter) return localeGroups;
    const q = filter.toLowerCase();
    return localeGroups
      .map((g) => ({
        ...g,
        locales: g.locales.filter((l) => {
          const name = localeDisplayNames[l].toLowerCase();
          return l.includes(q) || name.includes(q);
        }),
      }))
      .filter((g) => g.locales.length > 0);
  }, [filter]);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilter('');
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setFilter('');
      }
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, setFilter]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-certo-fg hover:text-certo-teal transition-colors duration-200 text-sm font-medium py-2 md:py-0 ${isPending ? 'opacity-50' : ''}`}
        aria-label="Switch language"
      >
        <svg className="w-6 h-6 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {currentLocale.toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-certo-card border border-certo-card-border rounded shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-2 text-base md:text-xs bg-transparent border border-certo-card-border rounded text-certo-fg placeholder:text-certo-fg-muted focus:outline-none focus:border-certo-teal/60"
            />
          </div>
          <div className="max-h-80 md:max-h-64 overflow-y-auto px-1 pb-2">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-certo-fg-muted font-medium">
                  {group.label}
                </div>
                {group.locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => {
                      switchTo(locale);
                      setIsOpen(false);
                      setFilter('');
                    }}
                    className={`w-full text-left px-2 py-2.5 md:py-1 text-sm md:text-xs rounded transition-colors duration-150 flex items-center gap-2 ${
                      locale === currentLocale
                        ? 'text-certo-teal font-semibold border-l-2 border-certo-teal pl-1.5'
                        : 'text-certo-fg hover:text-certo-teal hover:bg-certo-surface'
                    }`}
                  >
                    <span className="w-5 text-certo-fg-muted font-mono">{locale.toUpperCase()}</span>
                    <span>{localeDisplayNames[locale]}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
