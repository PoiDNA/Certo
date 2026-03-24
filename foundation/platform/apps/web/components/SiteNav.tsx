'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import LocaleSwitcher from './LocaleSwitcher';

const links = [
  { href: '/ratings', key: 'rating' as const },
  { href: '/pilot', key: 'pilot' as const },
  { href: '/experts', key: 'experts' as const },
  { href: '/about', key: 'about' as const },
  { href: '/contact', key: 'contact' as const },
];

export default function SiteNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex gap-6 text-sm font-medium tracking-wide items-center">
        {links.map(({ href, key }) => {
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
        <LocaleSwitcher />
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
            {links.map(({ href, key }) => {
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
