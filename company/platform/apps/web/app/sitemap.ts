import { MetadataRoute } from 'next';
import { locales } from '@certo/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://certo.id';

  const routes = ['', '/contact', '/privacy', '/terms'];

  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => {
    const alternates: Record<string, string> = {
      'x-default': `${baseUrl}/en${route}`,
    };

    locales.forEach((locale) => {
      alternates[locale] = `${baseUrl}/${locale}${route}`;
    });

    return {
      url: `${baseUrl}/en${route}`,
      lastModified: new Date(),
      alternates: {
        languages: alternates,
      },
    };
  });

  return sitemapEntries;
}