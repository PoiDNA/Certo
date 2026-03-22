'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function AuthNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');

  return (
    <a
      href={`/${locale}/login`}
      className="text-white hover:text-certo-accent transition-colors duration-300 uppercase text-xs tracking-[0.1em] font-semibold"
    >
      {t('login')}
    </a>
  );
}
