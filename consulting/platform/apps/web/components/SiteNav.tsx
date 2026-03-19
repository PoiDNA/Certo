'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

export default function SiteNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-8">
        <a href="#doradcy" className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent transition-colors duration-300">
          {t('advisors')}
        </a>
        <a href="#ekspertyza" className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent transition-colors duration-300">
          {t('expertise')}
        </a>
        <a href={`/${locale}/contact`} className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent transition-colors duration-300">
          {t('contact')}
        </a>
        <LocaleSwitcher />
        <a href={`/${locale}/login`} className="text-white hover:text-certo-accent transition-colors duration-300 uppercase text-xs tracking-[0.1em] font-semibold">
          {t('login')}
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-1"
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-certo-primary/95 backdrop-blur z-50">
          <nav className="flex flex-col px-6 py-4 gap-3">
            <a
              href="#doradcy"
              className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent py-2"
              onClick={() => setOpen(false)}
            >
              {t('advisors')}
            </a>
            <a
              href="#ekspertyza"
              className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent py-2"
              onClick={() => setOpen(false)}
            >
              {t('expertise')}
            </a>
            <a
              href={`/${locale}/contact`}
              className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent py-2"
              onClick={() => setOpen(false)}
            >
              {t('contact')}
            </a>
            <a
              href={`/${locale}/login`}
              className="text-white hover:text-certo-accent uppercase text-xs tracking-[0.1em] font-semibold py-2"
              onClick={() => setOpen(false)}
            >
              {t('login')}
            </a>
            <div className="pt-2 border-t border-certo-accent/20">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
