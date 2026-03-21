import { MetadataRoute } from 'next';
import { locales } from "@certo/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://certogov.org';

  // Możemy mieć tu statyczną listę stron, jak w wytycznych
  const routes = ['', '/ratings', '/pilot', '/experts', '/about', '/contact', '/privacy', '/terms'];

  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => {
    const alternates: Record<string, string> = {
      'x-default': `${baseUrl}/en${route}`,
    };

    locales.forEach((locale) => {
      alternates[locale] = `${baseUrl}/${locale}${route}`;
    });

    return {
      url: `${baseUrl}/pl${route}`, // Domślny URL linkujący do canonicala
      lastModified: new Date(),
      alternates: {
        languages: alternates,
      },
    };
  });

  return sitemapEntries;
}