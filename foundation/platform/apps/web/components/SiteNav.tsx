'use client';

import { useLocale, useTranslations } from 'next-intl';

const links = [
  { href: '/ratings', key: 'ratings' as const },
  { href: '/methodology', key: 'methodology' as const },
  { href: '/about', key: 'about' as const },
];

export default function SiteNav() {
  const locale = useLocale();
  const t = useTranslations('Nav');

  return (
    <nav className="hidden md:flex gap-6 text-sm font-medium tracking-wide items-center">
      {links.map(({ href, key }) => (
        <a
          key={key}
          href={`/${locale}${href}`}
          className="text-certo-cream/80 hover:text-certo-gold transition-colors duration-200"
        >
          {t(key)}
        </a>
      ))}
    </nav>
  );
}
