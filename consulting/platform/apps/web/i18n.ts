import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n-config';
import { hasLocale } from 'next-intl';

function deepMerge(target: any, source: any) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return source;

  const result = { ...target };
  Object.keys(source).forEach((key) => {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!result[key]) {
        result[key] = {};
      }
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  });
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const sharedMessages = (await import(`../../../../packages/i18n/messages/${locale}.json`)).default;

  let localMessages = {};
  try {
    localMessages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    // Brak lokalnych tłumaczeń — OK
  }

  return {
    locale,
    messages: deepMerge(sharedMessages, localMessages)
  };
});