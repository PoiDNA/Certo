import { locales } from '@certo/i18n/config';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales,
  defaultLocale: 'pl',
  localePrefix: 'always'
});