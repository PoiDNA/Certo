'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import LocaleSwitcher from './LocaleSwitcher';

const primaryLinks = [
  { href: '/ratings', key: 'rating' as const },
  { href: '/olympiad', key: 'olympiad' as const },
  { href: '/pilot', key: 'pilot' as const },
  { href: '/about', key: 'about' as const },
];

const moreLinks = [
  { href: '/experts', key: 'experts' as const },
  { href: '/contact', key: 'contact' as const },
];

const allLinks = [...primaryLinks, ...moreLinks];

export default function SiteNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [moreOpen]);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex gap-6 text-sm font-medium tracking-wide items-center">
        {primaryLinks.map(({ href, key }) => {
          const fullHref = `/${locale}${href}`;
          const isActive = pathname === fullHref;
          return (
            <a
              key={key}
              href={fullHref}
              className={isActive
                ? 'text-certo-gold border-b border-certo-gold pb-0.5'
                : 'text-certo-cream/80 hover:text-certo-gold transition-colors duration-200'
              }
            >
              {t(key)}
            </a>
          );
        })}

        {/* More dropdown */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`text-certo-cream/80 hover:text-certo-gold transition-colors duration-200 p-1 ${
              moreOpen ? 'text-certo-gold' : ''
            }`}
            aria-label={t('more')}
            aria-expanded={moreOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="3" y="3" width="6" height="6" rx="1" />
              <rect x="11" y="3" width="6" height="6" rx="1" />
              <rect x="3" y="11" width="6" height="6" rx="1" />
              <rect x="11" y="11" width="6" height="6" rx="1" />
            </svg>
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full mt-2 bg-certo-navy border border-certo-gold/30 rounded-[2px] shadow-xl z-50 min-w-[180px]">
              {moreLinks.map(({ href, key }) => {
                const fullHref = `/${locale}${href}`;
                const isActive = pathname === fullHref;
                return (
                  <a
                    key={key}
                    href={fullHref}
                    className={`block px-4 py-2.5 text-sm tracking-wide transition-colors duration-200 ${
                      isActive
                        ? 'text-certo-gold bg-certo-gold/10'
                        : 'text-certo-cream/80 hover:text-certo-gold hover:bg-certo-gold/5'
                    }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    {t(key)}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-certo-cream p-1"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" role="navigation" aria-label="Menu główne" className="md:hidden absolute top-full left-0 right-0 bg-certo-navy border-b-[3px] border-certo-gold z-50">
          <nav className="flex flex-col px-6 py-4 gap-3">
            {allLinks.map(({ href, key }) => {
              const fullHref = `/${locale}${href}`;
              const isActive = pathname === fullHref;
              return (
                <a
                  key={key}
                  href={fullHref}
                  className={`text-sm font-medium tracking-wide py-1 ${
                    isActive
                      ? 'text-certo-gold'
                      : 'text-certo-cream/80 hover:text-certo-gold transition-colors'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {t(key)}
                </a>
              );
            })}
            <div className="pt-2 border-t border-certo-gold/20">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
