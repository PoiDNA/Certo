import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from "@certo/i18n/config";
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

export const i18nConfig = {
  locales,
  defaultLocale,
};
