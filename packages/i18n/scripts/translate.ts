#!/usr/bin/env npx tsx
/**
 * Certo i18n Translation Pipeline
 * Translates pl.json → 23 EU languages and content/pl/*.mdx → content/{locale}/*.mdx
 *
 * Usage (from repo root):
 *   npx tsx packages/i18n/scripts/translate.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const MODEL = 'claude-haiku-4-5-20251001';
const CONCURRENCY = 5;

const client = new Anthropic();

const JSON_SOURCE_FILES = [
  'packages/i18n/messages/pl.json',
  'foundation/platform/apps/web/messages/pl.json',
  'company/platform/apps/web/messages/pl.json',
  'consulting/platform/apps/web/messages/pl.json',
];

/** Katalogi z plikami MDX — skrypt wykrywa *.mdx w podkatalogu pl/ */
const MDX_CONTENT_DIRS = [
  'foundation/platform/apps/web/content',
];

const TARGET_LOCALES = [
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr',
  'ga', 'hr', 'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pt', 'ro', 'sk', 'sl', 'sv',
];

const LANGUAGE_NAMES: Record<string, string> = {
  bg: 'bułgarski', cs: 'czeski', da: 'duński', de: 'niemiecki',
  el: 'grecki', en: 'angielski', es: 'hiszpański', et: 'estoński',
  fi: 'fiński', fr: 'francuski', ga: 'irlandzki (Gaeilge)', hr: 'chorwacki',
  hu: 'węgierski', it: 'włoski', lt: 'litewski', lv: 'łotewski',
  mt: 'maltański', nl: 'niderlandzki', pt: 'portugalski', ro: 'rumuński',
  sk: 'słowacki', sl: 'słoweński', sv: 'szwedzki',
};

const REPO_ROOT = process.cwd();

function getInstructions(): string {
  return fs.readFileSync(path.resolve(REPO_ROOT, 'packages/i18n/instructions.md'), 'utf-8');
}

// ─── JSON translation ────────────────────────────────────────────────────────

async function translateJson(
  source: Record<string, unknown>,
  targetLocale: string,
  instructions: string,
): Promise<Record<string, unknown>> {
  const langName = LANGUAGE_NAMES[targetLocale] ?? targetLocale;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: instructions,
    messages: [{
      role: 'user',
      content: `Przetłumacz poniższy JSON z języka polskiego na ${langName} (kod ISO: ${targetLocale}).\n\n${JSON.stringify(source, null, 2)}`,
    }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error(`Unexpected response type: ${block.type}`);

  const text = block.text.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
  return JSON.parse(text);
}

async function translateJsonFile(relPath: string, instructions: string): Promise<void> {
  const srcPath = path.resolve(REPO_ROOT, relPath);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠️  Pominięto (brak pliku): ${relPath}`);
    return;
  }

  const source = JSON.parse(fs.readFileSync(srcPath, 'utf-8')) as Record<string, unknown>;
  const { _meta, ...translatable } = source;
  const dir = path.dirname(srcPath);

  console.log(`\n📄 ${relPath}`);

  await processInBatches(TARGET_LOCALES, CONCURRENCY, async (locale) => {
    const outPath = path.resolve(dir, `${locale}.json`);
    try {
      const translated = await translateJson(translatable, locale, instructions);

      const output: Record<string, unknown> = _meta
        ? {
            _meta: {
              language: locale,
              status: 'machine_translated',
              reviewed: false,
              source: 'pl',
              model: MODEL,
            },
            ...translated,
          }
        : translated;

      fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
      console.log(`  ✓ ${locale}`);
    } catch (err) {
      console.error(`  ✗ ${locale}: ${err instanceof Error ? err.message : err}`);
    }
  });
}

// ─── MDX translation ─────────────────────────────────────────────────────────

const MDX_EXTRA_RULES = `

DODATKOWE REGUŁY DLA PLIKÓW MDX:
- Zachowaj bez zmian: frontmatter keys (tytuły kluczy YAML), JSX komponenty i ich props, bloki kodu (\`\`\` i \`), import/export statements
- Tłumacz TYLKO: wartości frontmatter (title, description), tekst paragrafów, tekst nagłówków (#, ##, ###), tekst list
- Zwróć plik MDX w oryginalnym formacie — bez owijania w markdown code fence
- Zachowaj wszystkie puste linie i formatowanie struktury MDX
`;

async function translateMdx(
  source: string,
  targetLocale: string,
  instructions: string,
): Promise<string> {
  const langName = LANGUAGE_NAMES[targetLocale] ?? targetLocale;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: instructions + MDX_EXTRA_RULES,
    messages: [{
      role: 'user',
      content: `Przetłumacz poniższy plik MDX z języka polskiego na ${langName} (kod ISO: ${targetLocale}).\n\n${source}`,
    }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error(`Unexpected response type: ${block.type}`);

  // Strip code fence if Claude wrapped output despite instructions
  return block.text.replace(/^```(?:mdx?)?\n?|\n?```$/g, '').trim();
}

async function translateMdxDir(contentDir: string, instructions: string): Promise<void> {
  const plDir = path.resolve(REPO_ROOT, contentDir, 'pl');
  if (!fs.existsSync(plDir)) {
    console.warn(`  ⚠️  Brak katalogu źródłowego MDX: ${contentDir}/pl`);
    return;
  }

  const mdxFiles = fs.readdirSync(plDir).filter((f) => f.endsWith('.mdx'));
  if (mdxFiles.length === 0) return;

  console.log(`\n📁 ${contentDir}/pl/ (${mdxFiles.length} pliki MDX)`);

  for (const filename of mdxFiles) {
    const srcPath = path.resolve(plDir, filename);
    const source = fs.readFileSync(srcPath, 'utf-8');

    console.log(`  📝 ${filename}`);

    await processInBatches(TARGET_LOCALES, CONCURRENCY, async (locale) => {
      const outDir = path.resolve(REPO_ROOT, contentDir, locale);
      fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.resolve(outDir, filename);

      try {
        const translated = await translateMdx(source, locale, instructions);
        fs.writeFileSync(outPath, translated + '\n');
        console.log(`    ✓ ${locale}`);
      } catch (err) {
        console.error(`    ✗ ${locale}: ${err instanceof Error ? err.message : err}`);
      }
    });
  }
}

// ─── Concurrency helper ───────────────────────────────────────────────────────

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(fn));
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌐 Certo i18n Translation Pipeline');
  console.log(`📦 Model: ${MODEL}`);
  console.log(`🔢 ${JSON_SOURCE_FILES.length} JSON × ${TARGET_LOCALES.length} języków`);
  console.log(`📝 ${MDX_CONTENT_DIRS.length} katalogi MDX × ${TARGET_LOCALES.length} języków\n`);

  const instructions = getInstructions();

  for (const relPath of JSON_SOURCE_FILES) {
    await translateJsonFile(relPath, instructions);
  }

  for (const dir of MDX_CONTENT_DIRS) {
    await translateMdxDir(dir, instructions);
  }

  console.log('\n✅ Tłumaczenie zakończone.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
