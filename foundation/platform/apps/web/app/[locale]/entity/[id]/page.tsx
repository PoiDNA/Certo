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

// Localized OG descriptions per language
const OG_STRINGS: Record<string, { desc: (name: string, location: string) => string; cta: string }> = {
  pl: { desc: (n, l) => `${n} — ${l}. Podbij, żeby pomóc uruchomić ocenę wiarygodności publicznej.`, cta: 'Ocena wiarygodności publicznej' },
  en: { desc: (n, l) => `${n} — ${l}. Vote to help trigger the public credibility assessment.`, cta: 'Public credibility assessment' },
  de: { desc: (n, l) => `${n} — ${l}. Abstimmen — hilf die Bewertung der öffentlichen Glaubwürdigkeit auszulösen.`, cta: 'Bewertung der öffentlichen Glaubwürdigkeit' },
  fr: { desc: (n, l) => `${n} — ${l}. Votez pour aider à déclencher l'évaluation de la crédibilité publique.`, cta: 'Évaluation de la crédibilité publique' },
  it: { desc: (n, l) => `${n} — ${l}. Vota per aiutare ad avviare la valutazione della credibilità pubblica.`, cta: 'Valutazione della credibilità pubblica' },
  es: { desc: (n, l) => `${n} — ${l}. Vota para ayudar a iniciar la evaluación de la credibilidad pública.`, cta: 'Evaluación de la credibilidad pública' },
  pt: { desc: (n, l) => `${n} — ${l}. Vote para ajudar a iniciar a avaliação da credibilidade pública.`, cta: 'Avaliação da credibilidade pública' },
  nl: { desc: (n, l) => `${n} — ${l}. Stem om de beoordeling van publieke geloofwaardigheid te starten.`, cta: 'Beoordeling van publieke geloofwaardigheid' },
  cs: { desc: (n, l) => `${n} — ${l}. Hlasujte a pomozte spustit hodnocení veřejné důvěryhodnosti.`, cta: 'Hodnocení veřejné důvěryhodnosti' },
  sk: { desc: (n, l) => `${n} — ${l}. Hlasujte a pomôžte spustiť hodnotenie verejnej dôveryhodnosti.`, cta: 'Hodnotenie verejnej dôveryhodnosti' },
  hu: { desc: (n, l) => `${n} — ${l}. Szavazz, hogy segíts elindítani a közhitelesség értékelését.`, cta: 'A közhitelesség értékelése' },
  ro: { desc: (n, l) => `${n} — ${l}. Votează pentru a ajuta la declanșarea evaluării credibilității publice.`, cta: 'Evaluarea credibilității publice' },
  bg: { desc: (n, l) => `${n} — ${l}. Гласувайте, за да помогнете за стартиране на оценката.`, cta: 'Оценка на обществената достоверност' },
  hr: { desc: (n, l) => `${n} — ${l}. Glasajte kako biste pomogli pokrenuti ocjenu javne vjerodostojnosti.`, cta: 'Ocjena javne vjerodostojnosti' },
  sl: { desc: (n, l) => `${n} — ${l}. Glasujte, da pomagate sprožiti oceno javne verodostojnosti.`, cta: 'Ocena javne verodostojnosti' },
  lt: { desc: (n, l) => `${n} — ${l}. Balsuokite ir padėkite pradėti viešojo patikimumo vertinimą.`, cta: 'Viešojo patikimumo vertinimas' },
  lv: { desc: (n, l) => `${n} — ${l}. Balsojiet, lai palīdzētu sākt publiskās uzticamības novērtējumu.`, cta: 'Publiskās uzticamības novērtējums' },
  et: { desc: (n, l) => `${n} — ${l}. Hääleta, et aidata käivitada avaliku usaldusväärsuse hindamist.`, cta: 'Avaliku usaldusväärsuse hindamine' },
  fi: { desc: (n, l) => `${n} — ${l}. Äänestä ja auta käynnistämään julkisen uskottavuuden arviointi.`, cta: 'Julkisen uskottavuuden arviointi' },
  sv: { desc: (n, l) => `${n} — ${l}. Rösta för att hjälpa starta bedömningen av offentlig trovärdighet.`, cta: 'Bedömning av offentlig trovärdighet' },
  da: { desc: (n, l) => `${n} — ${l}. Stem for at hjælpe med at starte vurderingen af offentlig troværdighed.`, cta: 'Vurdering af offentlig troværdighed' },
  el: { desc: (n, l) => `${n} — ${l}. Ψηφίστε για να βοηθήσετε να ξεκινήσει η αξιολόγηση δημόσιας αξιοπιστίας.`, cta: 'Αξιολόγηση δημόσιας αξιοπιστίας' },
  ga: { desc: (n, l) => `${n} — ${l}. Vótáil chun cabhrú an measúnú ar inchreidteacht phoiblí a thosú.`, cta: 'Measúnú ar inchreidteacht phoiblí' },
  mt: { desc: (n, l) => `${n} — ${l}. Ivvota biex tgħin tibda l-valutazzjoni tal-kredibbiltà pubblika.`, cta: 'Valutazzjoni tal-kredibbiltà pubblika' },
};

async function getEntity(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('pilot_applications')
    .select('id, organization_name, sector, city, country, status, process_status, rating_score, votes')
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
  const city = entity.city || '';
  const country = entity.country ? COUNTRY_NAMES[entity.country] || entity.country : '';
  const location = [city, country].filter(Boolean).join(', ');

  const ogStrings = OG_STRINGS[locale] || OG_STRINGS.en;
  const ratingPart = entity.rating_score != null ? ` — Certo ${entity.rating_score}` : '';
  const title = `${name}${ratingPart} | ${ogStrings.cta}`;
  const description = ogStrings.desc(name, location);

  const votes = (entity as Record<string, unknown>).votes as number | null;
  const ogImageUrl = `/api/og/entity?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&votes=${votes || 0}&locale=${locale}`;

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
      type: 'website',
      locale: locale === 'pl' ? 'pl_PL' : locale === 'en' ? 'en_US' : locale,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${name} — ${ogStrings.cta}`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://www.certogov.org/${locale}/entity/${id}`,
      languages: alternates,
    },
    robots: { index: false, follow: false },
  };
}

export default async function EntityPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return <EntityPageClient id={id} locale={locale} />;
}
