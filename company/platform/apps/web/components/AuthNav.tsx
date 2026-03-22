'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function AuthNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');

  return (
    <a
      href={`/${locale}/login`}
      className="text-sm font-medium text-certo-teal hover:text-certo-teal-dark transition-colors duration-300 uppercase tracking-wide"
    >
      {t('login')}
    </a>
  );
}
