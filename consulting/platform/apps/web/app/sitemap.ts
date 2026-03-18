import { MetadataRoute } from 'next';
import { locales } from '@certo/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://certo.consulting';

  const routes = ['', '/login', '/find-advisor', '/services', '/polityka', '/regulamin'];

  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => {
    const alternates: Record<string, string> = {
      'x-default': `${baseUrl}/pl${route}`,
    };

    locales.forEach((locale) => {
      alternates[locale] = `${baseUrl}/${locale}${route}`;
    });

    return {
      url: `${baseUrl}/pl${route}`,
      lastModified: new Date(),
      alternates: {
        languages: alternates,
      },
    };
  });

  return sitemapEntries;
}