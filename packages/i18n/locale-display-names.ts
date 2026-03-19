import type { Locale } from './config';

/**
 * Native language names for all 24 EU locales.
 * Each language is displayed in its own script/language.
 */
export const localeDisplayNames: Record<Locale, string> = {
  bg: 'Български',
  cs: 'Čeština',
  da: 'Dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  en: 'English',
  es: 'Español',
  et: 'Eesti',
  fi: 'Suomi',
  fr: 'Français',
  ga: 'Gaeilge',
  hr: 'Hrvatski',
  hu: 'Magyar',
  it: 'Italiano',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  mt: 'Malti',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ro: 'Română',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  sv: 'Svenska',
};

/**
 * Regional grouping of EU locales for organized display.
 */
export const localeGroups: { label: string; locales: Locale[] }[] = [
  { label: 'Popular', locales: ['en', 'pl', 'de', 'fr', 'es', 'it'] },
  { label: 'Western Europe', locales: ['nl', 'pt'] },
  { label: 'Northern Europe', locales: ['da', 'fi', 'sv'] },
  { label: 'Central Europe', locales: ['cs', 'hu', 'sk', 'sl'] },
  { label: 'Eastern Europe', locales: ['bg', 'hr', 'ro'] },
  { label: 'Baltic', locales: ['et', 'lt', 'lv'] },
  { label: 'Other', locales: ['el', 'ga', 'mt'] },
];
