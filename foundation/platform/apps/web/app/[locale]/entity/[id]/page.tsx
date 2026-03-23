import EntityPageClient from './EntityPageClient';

export default async function EntityPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return <EntityPageClient id={id} locale={locale} />;
}
