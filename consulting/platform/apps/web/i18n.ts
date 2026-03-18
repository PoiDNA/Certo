import { getRequestConfig } from 'next-intl/server';
import { locales } from '@certo/i18n/config';
import { notFound } from 'next/navigation';

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

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  try {
    const sharedMessages = (await import(`../../../../packages/i18n/messages/${locale}.json`)).default;
    
    let localMessages = {};
    try {
      localMessages = (await import(`./messages/${locale}.json`)).default;
    } catch (e) {
      // Ignore if no local overrides
    }

    return {
      locale: locale as string,
      messages: deepMerge(sharedMessages, localMessages)
    };
  } catch (error) {
    notFound();
  }
});