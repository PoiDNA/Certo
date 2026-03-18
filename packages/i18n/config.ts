export const locales = [
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 
  'ga', 'hr', 'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 
  'ro', 'sk', 'sl', 'sv'
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale = 'pl';
export const fallbackLocale = 'en';

export const localeConfig: Record<string, any> = {
  ga: { 
    status: 'machine_translated', 
    review_required: true 
  }
};
