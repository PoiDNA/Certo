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
        className={`flex items-center gap-1.5 text-certo-cream/80 hover:text-certo-gold transition-colors duration-200 text-sm font-medium py-2 md:py-0 ${isPending ? 'opacity-50' : ''}`}
        aria-label="Wybierz język"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <svg aria-hidden="true" className="w-6 h-6 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {currentLocale.toUpperCase()}
      </button>

      {isOpen && (
        <div role="listbox" aria-label="Wybór języka" className="absolute right-0 top-full mt-2 w-56 bg-certo-navy border border-certo-gold/30 rounded-[2px] shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search..."
              aria-label="Szukaj języka"
              className="w-full px-2 py-2 text-base md:text-xs bg-transparent border border-certo-gold/20 rounded-[2px] text-certo-cream/80 placeholder:text-certo-cream/30 focus:outline-none focus:border-certo-gold/50"
            />
          </div>
          <div className="max-h-80 md:max-h-64 overflow-y-auto px-1 pb-2">
            {filteredGroups.map((group) => (
              <div key={group.label} role="group" aria-label={group.label}>
                <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-certo-cream/40 font-medium">
                  {group.label}
                </div>
                {group.locales.map((locale) => (
                  <button
                    key={locale}
                    role="option"
                    aria-selected={locale === currentLocale}
                    onClick={() => {
                      switchTo(locale);
                      setIsOpen(false);
                      setFilter('');
                    }}
                    className={`w-full text-left px-2 py-2.5 md:py-1 text-sm md:text-xs rounded-[2px] transition-colors duration-150 flex items-center gap-2 ${
                      locale === currentLocale
                        ? 'text-certo-gold border-l-2 border-certo-gold pl-1.5'
                        : 'text-certo-cream/80 hover:text-certo-gold hover:bg-certo-gold/5'
                    }`}
                  >
                    <span className="w-5 text-certo-cream/40 font-mono">{locale.toUpperCase()}</span>
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
