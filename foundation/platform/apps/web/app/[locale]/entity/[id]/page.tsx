import EntityPageClient from './EntityPageClient';

export default function EntityPage({ params }: { params: { locale: string; id: string } }) {
  return <EntityPageClient id={params.id} locale={params.locale} />;
}
