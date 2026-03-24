'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import LocaleSwitcher from './LocaleSwitcher';

const allLinks = [
  { href: '/ratings', key: 'rating' as const },
  { href: '/olympiad', key: 'olympiad' as const },
  { href: '/pilot', key: 'pilot' as const },
  { href: '/about', key: 'about' as const },
  { href: '/experts', key: 'experts' as const },
  { href: '/contact', key: 'contact' as const },
];

export default function SiteNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Desktop — menu icon only */}
      <div ref={menuRef} className="relative hidden md:block">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`text-certo-cream/80 hover:text-certo-gold transition-colors duration-200 p-1 ${
            menuOpen ? 'text-certo-gold' : ''
          }`}
          aria-label={t('more')}
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <rect x="11" y="3" width="6" height="6" rx="1" />
            <rect x="3" y="11" width="6" height="6" rx="1" />
            <rect x="11" y="11" width="6" height="6" rx="1" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 bg-certo-navy border border-certo-gold/30 rounded-[2px] shadow-xl z-50 min-w-[200px]">
            {allLinks.map(({ href, key }) => {
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
                  onClick={() => setMenuOpen(false)}
                >
                  {t(key)}
                </a>
              );
            })}
          </div>
        )}
      </div>

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
