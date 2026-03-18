import { notFound } from 'next/navigation';
import { getMdxContent, getMdxFrontmatter } from '@/lib/mdx';
import { locales } from '@certo/i18n/config';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fm = getMdxFrontmatter('about', locale);
  return {
    title: fm?.title ?? 'O Fundacji',
    description: fm?.description,
    alternates: {
      canonical: `https://certogov.org/${locale}/about`,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const mdx = await getMdxContent('about', locale);
  if (!mdx) notFound();

  return (
    <article className="prose prose-certo max-w-4xl mx-auto py-12 px-2">
      {mdx.content}
    </article>
  );
}
