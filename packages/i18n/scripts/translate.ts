#!/usr/bin/env npx tsx
/**
 * Certo i18n Translation Pipeline
 * Translates pl.json → 23 EU languages using Claude API
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

const SOURCE_FILES = [
  'packages/i18n/messages/pl.json',
  'foundation/platform/apps/web/messages/pl.json',
  'company/platform/apps/web/messages/pl.json',
  'consulting/platform/apps/web/messages/pl.json',
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
  const instrPath = path.resolve(REPO_ROOT, 'packages/i18n/instructions.md');
  return fs.readFileSync(instrPath, 'utf-8');
}

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
  if (block.type !== 'text') {
    throw new Error(`Unexpected response type: ${block.type}`);
  }

  // Strip potential markdown code fences
  const text = block.text.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
  return JSON.parse(text);
}

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

async function translateSourceFile(relPath: string, instructions: string): Promise<void> {
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

async function main(): Promise<void> {
  console.log('🌐 Certo i18n Translation Pipeline');
  console.log(`📦 Model: ${MODEL}`);
  console.log(`🔢 ${SOURCE_FILES.length} pliki × ${TARGET_LOCALES.length} języków\n`);

  const instructions = getInstructions();

  for (const relPath of SOURCE_FILES) {
    await translateSourceFile(relPath, instructions);
  }

  console.log('\n✅ Tłumaczenie zakończone.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
