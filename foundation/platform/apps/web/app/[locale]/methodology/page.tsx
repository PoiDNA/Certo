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
  const fm = getMdxFrontmatter('methodology', locale);
  return {
    title: fm?.title ?? 'Metodologia',
    description: fm?.description,
    alternates: {
      canonical: `https://certogov.org/${locale}/methodology`,
    },
  };
}

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const mdx = await getMdxContent('methodology', locale);
  if (!mdx) notFound();

  return (
    <article className="prose prose-certo max-w-4xl mx-auto py-12 px-6">
      {mdx.content}
    </article>
  );
}
