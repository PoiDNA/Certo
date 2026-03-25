'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';
import ThemeToggle from './ThemeToggle';

export default function SiteNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide items-center" aria-label="Nawigacja główna">
        <a href="#rozwiazania" className="text-certo-fg hover:text-certo-teal transition-colors duration-200">
          {t('solutions')}
        </a>
        <a href="#technologia" className="text-certo-fg hover:text-certo-teal transition-colors duration-200">
          {t('technology')}
        </a>
        <a href="https://certogov.org" className="text-certo-teal hover:text-certo-teal-dark transition-colors duration-200">
          {t('foundation')} →
        </a>
        <a href={`/${locale}/contact`} className="text-certo-fg hover:text-certo-teal transition-colors duration-200">
          {t('contact')}
        </a>
        <LocaleSwitcher />
        <ThemeToggle />
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-certo-fg p-1"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
        <div
          id="mobile-menu"
          className="md:hidden absolute top-full left-0 right-0 bg-certo-header-bg border-b border-certo-card-border shadow-lg z-50"
        >
          <nav className="flex flex-col px-6 py-4 gap-3" aria-label="Menu mobilne">
            <a
              href="#rozwiazania"
              className="text-sm font-semibold text-certo-fg hover:text-certo-teal py-1"
              onClick={() => setOpen(false)}
            >
              {t('solutions')}
            </a>
            <a
              href="#technologia"
              className="text-sm font-semibold text-certo-fg hover:text-certo-teal py-1"
              onClick={() => setOpen(false)}
            >
              {t('technology')}
            </a>
            <a
              href="https://certogov.org"
              className="text-sm font-semibold text-certo-teal hover:text-certo-teal-dark py-1"
            >
              {t('foundation')} →
            </a>
            <a
              href={`/${locale}/contact`}
              className="text-sm font-semibold text-certo-fg hover:text-certo-teal py-1"
              onClick={() => setOpen(false)}
            >
              {t('contact')}
            </a>
            <div className="pt-2 border-t border-certo-card-border flex items-center justify-between">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
