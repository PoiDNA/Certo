import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { locales, defaultLocale, fallbackLocale } from '../config';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY environment variable is not set. Translation pipeline aborted.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: API_KEY });

const MESSAGES_DIR = path.resolve(__dirname, '../messages');
const IGNORED_NAMESPACES = ['Common'];
const TARGET_LOCALES = locales.filter(lang => lang !== defaultLocale && lang !== fallbackLocale);

const LOCALE_NAMES: Record<string, string> = {
  bg: 'Bulgarian', cs: 'Czech', da: 'Danish', de: 'German',
  el: 'Greek', es: 'Spanish', et: 'Estonian', fi: 'Finnish',
  fr: 'French', ga: 'Irish', hr: 'Croatian', hu: 'Hungarian',
  it: 'Italian', lt: 'Lithuanian', lv: 'Latvian', mt: 'Maltese',
  nl: 'Dutch', pt: 'Portuguese', ro: 'Romanian', sk: 'Slovak',
  sl: 'Slovenian', sv: 'Swedish'
};

const SYSTEM_PROMPT = `TOŻSAMOŚĆ INSTYTUCJI:
Fundacja Certo Governance Institute to niezależna instytucja ratingowa 
z siedzibą w Warszawie, działająca na podstawie prawa polskiego 
i standardów EU. Ocenia jakość zarządzania (governance) w sektorze 
publicznym, korporacyjnym, medycznym, obronnym i pozarządowym.

Ekosystem składa się z dwóch podmiotów:
- Fundacja CGI (certogov.org) — niezależny organ ratingowy, 
  właściciel metodologii, wydaje ratingi
- Certo ID PSA (certo.id) — operator technologiczny platformy,
  utrzymuje systemy IT Fundacji

Językiem roboczym jest polski i angielski.

ZASADA FUNDAMENTALNA CERTO:
"Instytucja, która ocenia jakość zarządzania innych, 
musi sama praktykować to, co mierzy."

TERMINOLOGIA ZASTRZEŻONA — nigdy nie tłumacz, zachowaj w oryginale:

Nazwy własne platformy i produktów:
- Rating Certo / Certo Rating
- Certo Score
- Certo Vector (++ / + / brak / − / −−)
- Certo Delegate
- Certo Accord
- Certo Action
- Certo Advisor
- Certo Index
- Certo Online
- CertoGov
- Certo Governance Institute
- Certo ID
- Certo Consulting
- Delegate ID

Terminy techniczne architektury (anglojęzyczne — nie tłumacz):
- Dual-Brain Engine
- Compliance Engine
- Break-Glass Protocol
- Hard Gates
- Trust Badge Certo

TERMINY TŁUMACZALNE — tłumacz na język docelowy:
- "Mandat Systemowy" → tłumacz jako lokalny odpowiednik 
  prawnego terminu "mandat systemowy / konstytucja systemu"
- "Karta Faktów" → tłumacz jako lokalny odpowiednik 
  "karta faktów / arkusz parametrów"
  Przykład: DE: "Faktenblatt", FR: "Fiche de faits"

PRODUKTY I USŁUGI — tłumacz opisowo, zachowaj nazwy własne:
- "Verified Digital Plenipotentiary Platform"
  → tłumacz opisowo w danym języku + zachowaj angielską nazwę 
  w nawiasie przy pierwszym wystąpieniu
- "Certo ID" — nigdy nie tłumacz, zachowaj w oryginale

KONTEKST SEKTOROWY:
Certo ocenia instytucje w pięciu sektorach:
1. Sektor publiczny — JST, urzędy, administracja państwowa
2. Sektor korporacyjny — spółki, zarządy, rady nadzorcze
3. Sektor medyczny — szpitale, placówki ochrony zdrowia
4. Sektor obronny — podmioty przemysłu obronnego, MON
5. Sektor pozarządowy — organizacje pozarządowe, 
   stowarzyszenia, fundacje

Tłumaczenia muszą być zrozumiałe dla:
- Dyrektorów i prezesów instytucji publicznych
- Urzędników administracji publicznej szczebla EU
- Prawników i compliance officerów
- Członków rad nadzorczych i zarządów

ZASADY TŁUMACZENIA:

1. TON: instytucjonalny, formalny, precyzyjny prawniczo.
   NIE: korporacyjny, marketingowy, startupowy.
   TAK: język dokumentów EU, aktów prawnych, raportów NIK/ETO.

2. TERMINOLOGIA PRAWNA: używaj ekwiwalentów stosowanych 
   w oficjalnych dokumentach UE w danym języku.
   Przykład: "pełnomocnictwo" → DE: "Vollmacht" (nie "Proxy")

3. GOVERNANCE: termin "governance" tłumacz jako:
   - PL: "ład korporacyjny" lub "jakość zarządzania"
   - DE: "Corporate Governance" lub "Unternehmensführung"
   - FR: "gouvernance d'entreprise"
   - inne języki: lokalny odpowiednik z dokumentów EU

4. RATING: w kontekście finansowym zachowaj "rating",
   w kontekście oceny governance używaj lokalnego słowa
   na "ocenę jakości zarządzania"

5. SPÓJNOŚĆ: te same pojęcia tłumacz identycznie 
   przez cały dokument. Nigdy nie stosuj synonimów 
   dla terminów technicznych.

6. KLUCZE JSON: nigdy nie tłumacz kluczy — 
   tylko wartości (string values).

7. ZMIENNE INTERPOLACJI: zachowaj bez zmian:
   {variable}, {{variable}}, %s, %d, {0}, {1}

8. HTML/MARKDOWN w wartościach: zachowaj tagi bez zmian,
   tłumacz tylko tekst między tagami.

9. LICZBA MNOGA I RODZAJ GRAMATYCZNY: dostosuj do zasad 
   gramatycznych docelowego języka, zachowując sens.

10. SKRÓTY EU: używaj oficjalnych skrótów stosowanych 
    przez Komisję Europejską w danym języku.

11. NAMESPACE "Common": nie tłumacz żadnych wartości 
    z namespace "Common" — zawiera terminologię zastrzeżoną.

12. FLAGA "do_not_translate": jeśli klucz zawiera 
    właściwość "do_not_translate": true — 
    zachowaj wartość bez zmian.

FORMAT ODPOWIEDZI:
Zwróć WYŁĄCZNIE poprawny JSON.
Bez komentarzy, bez markdown, bez wyjaśnień.
Bez znaczników \`\`\`json.
Zachowaj dokładną strukturę wejściowego JSON.
Każda wartość string musi być przetłumaczona 
zgodnie z powyższymi zasadami.`;

async function translateWithClaude(jsonPayload: any, targetLanguage: string): Promise<any> {
  const userMessage = `Przetłumacz poniższy JSON z języka polskiego na język ${targetLanguage}.\n\n${JSON.stringify(jsonPayload, null, 2)}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 4096,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error(`No text block in Claude response for ${targetLanguage}`);
  }

  return JSON.parse(textBlock.text);
}

async function runTranslation() {
  console.log('--- Starting Anthropic Claude Translation Pipeline ---');
  
  const sourceFilePath = path.join(MESSAGES_DIR, `${defaultLocale}.json`);
  if (!fs.existsSync(sourceFilePath)) {
    console.error(`Source file not found: ${sourceFilePath}`);
    process.exit(1);
  }

  const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));

  // Prepare the translatable payload (skip Common and _meta)
  const translatableData: any = {};
  const preservedData: any = {};

  for (const namespace of Object.keys(sourceData)) {
    if (namespace === '_meta') continue;
    if (IGNORED_NAMESPACES.includes(namespace)) {
      preservedData[namespace] = sourceData[namespace];
    } else {
      translatableData[namespace] = sourceData[namespace];
    }
  }

  for (const lang of TARGET_LOCALES) {
    const langName = LOCALE_NAMES[lang] || lang;
    console.log(`[${lang}] Translating to ${langName}...`);

    try {
      const translated = await translateWithClaude(translatableData, langName);

      const outputData: any = {
        _meta: {
          status: "machine_translated",
          source: "claude",
          reviewed: false,
          generated_at: new Date().toISOString(),
          source_language: defaultLocale
        },
        ...preservedData,
        ...translated
      };

      const outputFilePath = path.join(MESSAGES_DIR, `${lang}.json`);
      fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), 'utf-8');
      console.log(`[${lang}] Saved successfully.`);
    } catch (error) {
      console.error(`[${lang}] Translation failed:`, error);
    }
  }

  console.log('--- Translation Pipeline Finished ---');
}

runTranslation().catch(err => {
  console.error('Critical error in translation pipeline:', err);
  process.exit(1);
});
