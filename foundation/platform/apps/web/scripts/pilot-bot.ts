#!/usr/bin/env npx tsx
/**
 * Pilot Map Bot — Symulacja zgłoszeń obserwatora publicznego
 *
 * Generuje realistyczne zgłoszenia podmiotów z krajów UE
 * z konfiguralnym rozkładem terytorialnym i sektorowym.
 *
 * Użycie:
 *   npx tsx scripts/pilot-bot.ts --daily 20 --days 1
 *   npx tsx scripts/pilot-bot.ts --daily 50 --days 7 --dry-run
 *   npx tsx scripts/pilot-bot.ts --batch 10
 *
 * Env:
 *   PILOT_BOT_URL  — bazowy URL API (domyślnie https://www.certogov.org)
 */

// ─── Configuration ─────────────────────────────────────────────

const CONFIG = {
  /** Average daily submissions */
  dailyRate: 20,

  /** Country weights (population-proportional + EU relevance) */
  countryWeights: {
    PL: 18,   // Polska — rynek docelowy
    DE: 14,   // Niemcy
    FR: 11,   // Francja
    IT: 10,   // Włochy
    ES: 8,    // Hiszpania
    NL: 5,    // Holandia
    RO: 4,    // Rumunia
    BE: 3,    // Belgia
    CZ: 3,    // Czechy
    PT: 3,    // Portugalia
    SE: 3,    // Szwecja
    HU: 2,    // Węgry
    AT: 2,    // Austria
    BG: 2,    // Bułgaria
    DK: 2,    // Dania
    FI: 2,    // Finlandia
    SK: 1.5,  // Słowacja
    IE: 1.5,  // Irlandia
    HR: 1,    // Chorwacja
    LT: 1,    // Litwa
    SI: 0.8,  // Słowenia
    LV: 0.7,  // Łotwa
    EE: 0.6,  // Estonia
    CY: 0.4,  // Cypr
    LU: 0.3,  // Luksemburg
    MT: 0.2,  // Malta
    GR: 2,    // Grecja
  } as Record<string, number>,

  /** Sector weights */
  sectorWeights: {
    publiczny: 45,     // sektor publiczny dominuje
    prywatny: 35,      // sektor prywatny
    pozarzadowy: 20,   // NGO
  } as Record<string, number>,
};

// ─── Entity Name Templates per Country + Sector ────────────────

const TEMPLATES: Record<string, Record<string, string[]>> = {
  // POLSKA
  PL: {
    publiczny: [
      'Urząd Miasta {city}', 'Starostwo Powiatowe w {city}', 'Urząd Gminy {city}',
      'Szpital Miejski w {city}', 'Szpital Wojewódzki w {city}',
      'Urząd Marszałkowski Województwa {region}', 'Powiatowy Urząd Pracy w {city}',
      'Centrum Usług Społecznych w {city}', 'Zarząd Dróg Miejskich w {city}',
      'Miejski Ośrodek Pomocy Społecznej w {city}', 'Regionalny Ośrodek Kultury w {city}',
      'Komenda Miejska Policji w {city}', 'Inspektorat Sanitarny w {city}',
    ],
    prywatny: [
      '{city} Tech S.A.', '{city} Development Sp. z o.o.', 'Grupa {surname} S.A.',
      '{surname} & Partners Sp. z o.o.', '{city} Logistics S.A.',
      'Baltic {industry} Group S.A.', 'Central European {industry} Sp. z o.o.',
      '{surname} Capital S.A.', 'Nova {industry} Sp. z o.o.',
    ],
    pozarzadowy: [
      'Fundacja Rozwoju {city}', 'Stowarzyszenie na Rzecz {cause}',
      'Fundacja {cause} im. {surname}', 'Towarzystwo Przyjaciół {city}',
      'Stowarzyszenie {cause} Polska', 'Fundacja Edukacji i Rozwoju {city}',
    ],
  },

  // NIEMCY
  DE: {
    publiczny: [
      'Stadtverwaltung {city}', 'Landratsamt {city}', 'Universitätsklinikum {city}',
      'Bezirksregierung {city}', 'Finanzamt {city}', 'Stadtwerke {city}',
    ],
    prywatny: [
      '{city} Technologie GmbH', '{surname} Gruppe AG', '{surname} & Co. KG',
      'Deutsche {industry} AG', '{city} Digital GmbH',
    ],
    pozarzadowy: [
      '{city} Stiftung', 'Verein für {cause} e.V.', 'Deutsche {cause} Stiftung',
    ],
  },

  // FRANCJA
  FR: {
    publiczny: [
      'Mairie de {city}', 'Conseil Départemental de {city}', 'CHU de {city}',
      'Préfecture de {city}', 'Communauté d\'Agglomération de {city}',
    ],
    prywatny: [
      '{city} Technologies SAS', 'Groupe {surname} SA', '{surname} & Associés SAS',
      'Société {industry} de {city}',
    ],
    pozarzadowy: [
      'Fondation {city}', 'Association {cause} France', 'Institut {cause} de {city}',
    ],
  },

  // WŁOCHY
  IT: {
    publiczny: [
      'Comune di {city}', 'ASL di {city}', 'Provincia di {city}',
      'Ospedale Civile di {city}', 'Camera di Commercio di {city}',
    ],
    prywatny: [
      '{city} Innovazione S.r.l.', 'Gruppo {surname} S.p.A.', '{surname} & Figli S.r.l.',
    ],
    pozarzadowy: [
      'Fondazione {city}', 'Associazione {cause} Italia', 'Centro {cause} di {city}',
    ],
  },

  // HISZPANIA
  ES: {
    publiczny: [
      'Ayuntamiento de {city}', 'Diputación de {city}', 'Hospital Universitario de {city}',
      'Junta de {region}',
    ],
    prywatny: [
      '{city} Tecnología S.L.', 'Grupo {surname} S.A.', '{surname} Inversiones S.L.',
    ],
    pozarzadowy: [
      'Fundación {city}', 'Asociación {cause} España',
    ],
  },
};

// Generic template for countries without specific templates
const GENERIC_TEMPLATES: Record<string, string[]> = {
  publiczny: [
    'Municipality of {city}', 'City Hospital {city}', 'Regional Authority of {city}',
    'Public Services Agency {city}', 'District Administration {city}',
  ],
  prywatny: [
    '{city} Solutions Ltd.', '{surname} Group {suffix}', '{city} Industries {suffix}',
    'European {industry} {suffix}', '{surname} Capital {suffix}',
  ],
  pozarzadowy: [
    'Foundation for {cause} in {city}', '{city} Development Foundation',
    'Association for {cause}', 'Institute of {cause} {city}',
  ],
};

// ─── Data pools ────────────────────────────────────────────────

const CITIES: Record<string, { cities: string[]; regions?: string[] }> = {
  PL: {
    cities: ['Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk', 'Łódź', 'Katowice', 'Szczecin',
      'Bydgoszcz', 'Lublin', 'Białystok', 'Rzeszów', 'Toruń', 'Olsztyn', 'Kielce', 'Radom',
      'Gliwice', 'Opole', 'Częstochowa', 'Sosnowiec', 'Elbląg', 'Zielona Góra', 'Tarnów',
      'Legnica', 'Kalisz', 'Płock', 'Grudziądz', 'Słupsk', 'Jaworzno', 'Nowy Sącz'],
    regions: ['Mazowieckiego', 'Małopolskiego', 'Śląskiego', 'Wielkopolskiego', 'Dolnośląskiego',
      'Pomorskiego', 'Łódzkiego', 'Podkarpackiego', 'Lubelskiego', 'Kujawsko-Pomorskiego'],
  },
  DE: {
    cities: ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
      'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg',
      'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Mannheim'],
  },
  FR: {
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
      'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Grenoble', 'Dijon'],
  },
  IT: {
    cities: ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze',
      'Bari', 'Catania', 'Venezia', 'Verona', 'Padova', 'Trieste', 'Brescia'],
  },
  ES: {
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia',
      'Palma', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón'],
    regions: ['Andalucía', 'Cataluña', 'Madrid', 'Valencia', 'Galicia', 'Castilla y León'],
  },
  NL: { cities: ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Breda'] },
  BE: { cities: ['Bruxelles', 'Antwerpen', 'Gent', 'Charleroi', 'Liège', 'Brugge', 'Namur'] },
  RO: { cities: ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați'] },
  CZ: { cities: ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice'] },
  PT: { cities: ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Funchal', 'Faro', 'Aveiro'] },
  SE: { cities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Linköping', 'Örebro', 'Västerås'] },
  HU: { cities: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza'] },
  AT: { cities: ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt'] },
  BG: { cities: ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora'] },
  DK: { cities: ['København', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers'] },
  FI: { cities: ['Helsinki', 'Espoo', 'Tampere', 'Turku', 'Oulu', 'Jyväskylä'] },
  SK: { cities: ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Nitra', 'Banská Bystrica'] },
  IE: { cities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'] },
  HR: { cities: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'] },
  LT: { cities: ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'] },
  SI: { cities: ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper'] },
  LV: { cities: ['Rīga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala'] },
  EE: { cities: ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve'] },
  CY: { cities: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'] },
  LU: { cities: ['Luxembourg', 'Esch-sur-Alzette', 'Differdange'] },
  MT: { cities: ['Valletta', 'Birkirkara', 'Sliema'] },
  GR: { cities: ['Athína', 'Thessaloníki', 'Pátra', 'Irákleio', 'Lárisa', 'Vólos'] },
};

const SURNAMES: Record<string, string[]> = {
  PL: ['Kowalski', 'Nowak', 'Wiśniewski', 'Dąbrowski', 'Lewandowski', 'Kamiński', 'Zieliński'],
  DE: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker'],
  FR: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Moreau'],
  IT: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo'],
  ES: ['García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández'],
  _default: ['Anderson', 'Johansson', 'Nielsen', 'Hansen', 'Berg', 'Virtanen', 'Novák'],
};

const INDUSTRIES = ['Technology', 'Energy', 'Infrastructure', 'Healthcare', 'Finance',
  'Logistics', 'Manufacturing', 'Real Estate', 'Consulting', 'Media'];

const CAUSES: Record<string, string[]> = {
  PL: ['Edukacji', 'Zdrowia', 'Kultury', 'Ochrony Środowiska', 'Rozwoju Społecznego',
    'Transparentności', 'Innowacji', 'Praw Obywatelskich'],
  DE: ['Bildung', 'Gesundheit', 'Kultur', 'Umweltschutz', 'Demokratie'],
  FR: ['Éducation', 'Santé', 'Culture', 'Environnement', 'Solidarité'],
  IT: ['Educazione', 'Salute', 'Cultura', 'Ambiente', 'Trasparenza'],
  ES: ['Educación', 'Salud', 'Cultura', 'Medio Ambiente', 'Transparencia'],
  _default: ['Education', 'Healthcare', 'Culture', 'Environment', 'Transparency', 'Innovation'],
};

const SUFFIXES: Record<string, string[]> = {
  DE: ['GmbH', 'AG'], FR: ['SAS', 'SA', 'SARL'], IT: ['S.r.l.', 'S.p.A.'],
  ES: ['S.L.', 'S.A.'], NL: ['B.V.', 'N.V.'], BE: ['SA', 'SPRL'],
  _default: ['Ltd.', 'S.A.', 'Group'],
};

const OBSERVER_NAMES: Record<string, string[]> = {
  PL: ['Jan', 'Anna', 'Piotr', 'Maria', 'Tomasz', 'Katarzyna', 'Marcin', 'Agnieszka'],
  DE: ['Hans', 'Anna', 'Thomas', 'Maria', 'Klaus', 'Ursula', 'Stefan', 'Petra'],
  FR: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Michel', 'Isabelle', 'Philippe', 'Catherine'],
  _default: ['Alex', 'Maria', 'Jan', 'Eva', 'Peter', 'Anna', 'Martin', 'Sofia'],
};

// ─── Helpers ───────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [key, weight] of Object.entries(weights)) {
    r -= weight;
    if (r <= 0) return key;
  }
  return Object.keys(weights)[0];
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || key);
}

function generateEntity(country: string, sector: string) {
  const cityData = CITIES[country] || CITIES.PL;
  const city = pick(cityData.cities);
  const region = cityData.regions ? pick(cityData.regions) : city;
  const surname = pick(SURNAMES[country] || SURNAMES._default);
  const industry = pick(INDUSTRIES);
  const cause = pick(CAUSES[country] || CAUSES._default);
  const suffix = pick(SUFFIXES[country] || SUFFIXES._default);

  const templates = TEMPLATES[country]?.[sector] || GENERIC_TEMPLATES[sector];
  const template = pick(templates);

  const name = fillTemplate(template, { city, region, surname, industry, cause, suffix });

  const observerFirst = pick(OBSERVER_NAMES[country] || OBSERVER_NAMES._default);
  const observerLast = pick(SURNAMES[country] || SURNAMES._default);
  const contactPerson = `${observerFirst} ${observerLast}`;
  const email = `${observerFirst.toLowerCase()}.${observerLast.toLowerCase()}@example.org`;

  const motivations: Record<string, string[]> = {
    PL: [
      'Chcę poznać jakość zarządzania tej instytucji jako mieszkaniec regionu.',
      'Jako obywatel chciałbym wiedzieć jak zarządzana jest ta organizacja.',
      'Interesuje mnie transparentność tej instytucji publicznej.',
      'Uważam, że ocena jakości zarządzania jest ważna dla społeczeństwa.',
    ],
    _default: [
      'I am interested in the governance quality of this institution.',
      'As a citizen, I want to know about this organization\'s management standards.',
      'Transparency of public institutions matters to our community.',
    ],
  };
  const motivation = pick(motivations[country] || motivations._default);

  return {
    applicant_type: 'observer',
    organization_name: name,
    sector,
    city: city.toUpperCase(),
    country,
    contact_person: contactPerson,
    email,
    motivation,
    relation: 'mieszkaniec regionu',
    consent: true,
  };
}

// ─── Submission ────────────────────────────────────────────────

async function submitEntity(baseUrl: string, entity: ReturnType<typeof generateEntity>, dryRun: boolean) {
  if (dryRun) {
    console.log(`  [DRY] ${entity.country} | ${entity.sector.padEnd(12)} | ${entity.organization_name}`);
    return true;
  }

  try {
    const res = await fetch(`${baseUrl}/api/pilot-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`  ✅ ${entity.country} | ${entity.sector.padEnd(12)} | ${entity.organization_name}`);
      return true;
    } else {
      console.log(`  ❌ ${entity.country} | ${entity.organization_name} — ${data.error || res.status}`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ ${entity.country} | ${entity.organization_name} — ${(err as Error).message}`);
    return false;
  }
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string, def: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
  };

  const dailyRate = parseInt(getArg('--daily', String(CONFIG.dailyRate)), 10);
  const days = parseInt(getArg('--days', '1'), 10);
  const batch = parseInt(getArg('--batch', '0'), 10);
  const dryRun = args.includes('--dry-run');
  const baseUrl = process.env.PILOT_BOT_URL || 'https://www.certogov.org';

  const totalEntities = batch > 0 ? batch : dailyRate * days;

  // Add some randomness: ±20%
  const variance = batch > 0 ? 0 : Math.floor(totalEntities * 0.2 * (Math.random() * 2 - 1));
  const count = Math.max(1, totalEntities + variance);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║          🤖 Pilot Map Bot — Certo                   ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Target URL:    ${baseUrl}`);
  console.log(`  Daily rate:    ${dailyRate}`);
  console.log(`  Days:          ${days}`);
  console.log(`  Total:         ${count} entities`);
  console.log(`  Dry run:       ${dryRun ? 'YES' : 'no'}`);
  console.log('');

  // Show distribution
  const countryTotal = Object.values(CONFIG.countryWeights).reduce((a, b) => a + b, 0);
  const sectorTotal = Object.values(CONFIG.sectorWeights).reduce((a, b) => a + b, 0);

  console.log('  Country distribution (top 10):');
  const sorted = Object.entries(CONFIG.countryWeights).sort(([, a], [, b]) => b - a).slice(0, 10);
  for (const [code, weight] of sorted) {
    const pct = ((weight / countryTotal) * 100).toFixed(1);
    const expected = Math.round((weight / countryTotal) * count);
    const bar = '█'.repeat(Math.ceil(expected / 2));
    console.log(`    ${code}  ${pct.padStart(5)}%  ~${String(expected).padStart(3)} ${bar}`);
  }
  console.log('');

  console.log('  Sector distribution:');
  for (const [sector, weight] of Object.entries(CONFIG.sectorWeights)) {
    const pct = ((weight / sectorTotal) * 100).toFixed(1);
    const expected = Math.round((weight / sectorTotal) * count);
    console.log(`    ${sector.padEnd(14)} ${pct.padStart(5)}%  ~${expected}`);
  }
  console.log('');

  // Generate and submit
  let ok = 0;
  let fail = 0;

  console.log('  Submitting...');
  console.log('  ' + '─'.repeat(70));

  for (let i = 0; i < count; i++) {
    const country = weightedPick(CONFIG.countryWeights);
    const sector = weightedPick(CONFIG.sectorWeights);
    const entity = generateEntity(country, sector);

    const success = await submitEntity(baseUrl, entity, dryRun);
    if (success) ok++; else fail++;

    // Rate limiting: ~2 per second
    if (!dryRun && i < count - 1) {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
    }
  }

  console.log('  ' + '─'.repeat(70));
  console.log('');
  console.log(`  Done! ✅ ${ok} succeeded, ❌ ${fail} failed`);
  console.log('');
}

main().catch(console.error);
