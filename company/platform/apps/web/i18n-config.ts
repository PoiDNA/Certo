import { createNavigation } from 'next-intl/navigation';
import { locales } from '@certo/i18n/config';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

export const i18nConfig = {
  locales,
  defaultLocale: 'en',
};