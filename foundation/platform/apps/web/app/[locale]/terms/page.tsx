import { notFound } from 'next/navigation';
import { getMdxContent, getMdxFrontmatter } from '@/lib/mdx';
import { locales } from '@certo/i18n/config';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const fm = getMdxFrontmatter('terms', locale);
  return {
    title: fm?.title ?? 'Warunki Korzystania',
    description: fm?.description,
    alternates: {
      canonical: `https://certogov.org/${locale}/terms`,
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const mdx = await getMdxContent('terms', locale);
  if (!mdx) notFound();

  return (
    <article className="prose prose-certo max-w-4xl mx-auto py-12 px-6">
      {mdx.content}
    </article>
  );
}
