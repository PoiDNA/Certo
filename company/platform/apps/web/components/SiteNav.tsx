'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import LocaleSwitcher from './LocaleSwitcher';

export default function SiteNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide items-center">
        <a href="#rozwiazania" className="text-certo-gray-dark hover:text-certo-teal transition-colors duration-200">
          {t('solutions')}
        </a>
        <a href="#technologia" className="text-certo-gray-dark hover:text-certo-teal transition-colors duration-200">
          {t('technology')}
        </a>
        <a href="https://certogov.org" className="text-certo-teal hover:text-certo-teal-dark transition-colors duration-200">
          {t('foundation')} →
        </a>
        <LocaleSwitcher />
        <Link
          href={`/${locale}/login`}
          className="px-5 py-2 border border-certo-teal bg-certo-teal text-white rounded-[2px] hover:bg-certo-teal-dark hover:border-certo-teal-dark transition-colors duration-200"
        >
          {t('login')}
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-certo-teal-darker p-1"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-certo-gray shadow-lg z-50">
          <nav className="flex flex-col px-6 py-4 gap-3">
            <a
              href="#rozwiazania"
              className="text-sm font-semibold text-certo-gray-dark hover:text-certo-teal py-1"
              onClick={() => setOpen(false)}
            >
              {t('solutions')}
            </a>
            <a
              href="#technologia"
              className="text-sm font-semibold text-certo-gray-dark hover:text-certo-teal py-1"
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
            <Link
              href={`/${locale}/login`}
              className="text-sm font-semibold text-center px-5 py-2 border border-certo-teal bg-certo-teal text-white rounded-[2px] mt-1"
              onClick={() => setOpen(false)}
            >
              {t('login')}
            </Link>
            <div className="pt-2 border-t border-gray-200">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
