import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import EntityPageClient from './EntityPageClient';

const SECTOR_LABELS: Record<string, string> = {
  publiczny: 'sektor publiczny',
  prywatny: 'sektor prywatny',
  pozarzadowy: 'sektor pozarządowy',
};

const COUNTRY_NAMES: Record<string, string> = {
  PL: 'Polska', AT: 'Austria', BE: 'Belgia', BG: 'Bułgaria', HR: 'Chorwacja',
  CY: 'Cypr', CZ: 'Czechy', DK: 'Dania', EE: 'Estonia', FI: 'Finlandia',
  FR: 'Francja', DE: 'Niemcy', GR: 'Grecja', HU: 'Węgry', IE: 'Irlandia',
  IT: 'Włochy', LV: 'Łotwa', LT: 'Litwa', LU: 'Luksemburg', MT: 'Malta',
  NL: 'Holandia', PT: 'Portugalia', RO: 'Rumunia', SK: 'Słowacja',
  SI: 'Słowenia', ES: 'Hiszpania', SE: 'Szwecja',
};

async function getEntity(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('pilot_applications')
    .select('id, organization_name, sector, city, country, status, process_status, rating_score')
    .eq('id', id)
    .neq('status', 'rejected')
    .single();

  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const entity = await getEntity(id);

  if (!entity) {
    return {
      title: 'Podmiot nie znaleziony | Certo Governance Institute',
      robots: { index: false },
    };
  }

  const name = entity.organization_name;
  const sector = SECTOR_LABELS[entity.sector] || entity.sector;
  const city = entity.city || '';
  const country = entity.country ? COUNTRY_NAMES[entity.country] || entity.country : '';
  const location = [city, country].filter(Boolean).join(', ');

  const ratingPart = entity.rating_score != null ? ` — Certo ${entity.rating_score}` : '';
  const title = `${name}${ratingPart} | Rating Certo`;
  const description = `${name} — ${sector}, ${location}. Profil podmiotu w procesie oceny wiarygodności publicznej Rating Certo.`;

  const locales = ['pl', 'en', 'de', 'fr', 'es', 'it', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'lt', 'lv', 'et', 'fi', 'sv', 'da', 'nl', 'pt', 'el', 'ga', 'mt'];
  const alternates: Record<string, string> = {};
  for (const loc of locales) {
    alternates[loc] = `https://www.certogov.org/${loc}/entity/${id}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.certogov.org/${locale}/entity/${id}`,
      siteName: 'Certo Governance Institute',
      type: 'profile',
      locale: locale === 'pl' ? 'pl_PL' : locale === 'en' ? 'en_US' : locale,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.certogov.org/${locale}/entity/${id}`,
      languages: alternates,
    },
    robots: { index: true, follow: true },
  };
}

export default async function EntityPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return <EntityPageClient id={id} locale={locale} />;
}
