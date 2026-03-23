#!/usr/bin/env npx tsx
/**
 * Pilot Map Bot — Real EU entities submission
 *
 * Submits REAL entities from verified databases (stock exchanges,
 * government registries, major NGO directories).
 *
 * Usage:
 *   npx tsx scripts/pilot-bot.ts --batch 20 --dry-run
 *   npx tsx scripts/pilot-bot.ts --daily 30 --days 5
 *   npx tsx scripts/pilot-bot.ts --batch 100
 *
 * Env:
 *   PILOT_BOT_URL    — base API URL (default: https://www.certogov.org)
 *   PILOT_BOT_SECRET — secret key for backend bot endpoint (required for live)
 */

import { ENTITIES, countEntities, type EntityRecord } from './data/entities-eu';

// ─── Configuration ─────────────────────────────────────────────

const CONFIG = {
  dailyRate: 20,

  countryWeights: {
    PL: 18, DE: 14, FR: 11, IT: 10, ES: 8, NL: 5, RO: 4, BE: 3,
    CZ: 3, PT: 3, SE: 3, HU: 2, AT: 2, BG: 2, DK: 2, FI: 2,
    SK: 1.5, IE: 1.5, HR: 1, LT: 1, SI: 0.8, LV: 0.7, EE: 0.6,
    CY: 0.4, LU: 0.3, MT: 0.2, GR: 2,
  } as Record<string, number>,

  sectorWeights: {
    publiczny: 45,
    prywatny: 35,
    pozarzadowy: 20,
  } as Record<string, number>,
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

// Track used entities to avoid duplicates within session
const usedEntities = new Set<string>();

function pickEntity(country: string, sector: string): EntityRecord | null {
  const countryData = ENTITIES[country];
  if (!countryData) return null;

  const sectorEntities = countryData[sector as keyof typeof countryData];
  if (!sectorEntities || sectorEntities.length === 0) return null;

  // Filter out already used
  const available = sectorEntities.filter(e => !usedEntities.has(`${country}:${e.name}`));
  if (available.length === 0) return null;

  const entity = pick(available);
  usedEntities.add(`${country}:${entity.name}`);
  return entity;
}

// ─── Submission ────────────────────────────────────────────────

async function submitEntity(
  baseUrl: string,
  botSecret: string,
  country: string,
  sector: string,
  entity: EntityRecord,
  dryRun: boolean,
) {
  if (dryRun) {
    console.log(`  [DRY] ${country} | ${sector.padEnd(12)} | ${entity.name} (${entity.city})`);
    return true;
  }

  const payload = {
    organization_name: entity.name,
    sector,
    city: entity.city,
    country,
    applicant_type: 'observer',
    contact_person: 'Certo Bot',
    email: 'bot@certogov.org',
    motivation: 'Automated submission — public entity from verified registry',
    relation: 'automated',
    consent: true,
    bot_secret: botSecret,
  };

  try {
    const res = await fetch(`${baseUrl}/api/pilot-bot-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`  ✅ ${country} | ${sector.padEnd(12)} | ${entity.name}`);
      return true;
    } else {
      console.log(`  ❌ ${country} | ${entity.name} — ${data.error || res.status}`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ ${country} | ${entity.name} — ${(err as Error).message}`);
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
  const botSecret = process.env.PILOT_BOT_SECRET || '';

  if (!dryRun && !botSecret) {
    console.error('❌ PILOT_BOT_SECRET is required for live submissions.');
    console.error('   Set it via: PILOT_BOT_SECRET=xxx npx tsx scripts/pilot-bot.ts ...');
    console.error('   Or use --dry-run for preview.');
    process.exit(1);
  }

  const totalTarget = batch > 0 ? batch : dailyRate * days;
  const variance = batch > 0 ? 0 : Math.floor(totalTarget * 0.2 * (Math.random() * 2 - 1));
  const count = Math.max(1, totalTarget + variance);

  // Database stats
  const stats = countEntities();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       🤖 Pilot Map Bot — Real EU Entities           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  URL:           ${baseUrl}`);
  console.log(`  Database:      ${stats.total} real entities across ${Object.keys(ENTITIES).length} countries`);
  console.log(`  Target:        ${count} submissions`);
  console.log(`  Mode:          ${dryRun ? '🔍 DRY RUN' : '🚀 LIVE'}`);
  console.log('');

  // Distribution preview
  const countryTotal = Object.values(CONFIG.countryWeights).reduce((a, b) => a + b, 0);
  console.log('  Country distribution (top 10):');
  const sorted = Object.entries(CONFIG.countryWeights).sort(([, a], [, b]) => b - a).slice(0, 10);
  for (const [code, weight] of sorted) {
    const pct = ((weight / countryTotal) * 100).toFixed(1);
    const expected = Math.round((weight / countryTotal) * count);
    const available = stats.byCountry[code] || 0;
    console.log(`    ${code}  ${pct.padStart(5)}%  ~${String(expected).padStart(3)}  (${available} in DB)`);
  }
  console.log('');

  console.log('  Sector distribution:');
  for (const [sector, weight] of Object.entries(CONFIG.sectorWeights)) {
    const pct = ((weight / Object.values(CONFIG.sectorWeights).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
    console.log(`    ${sector.padEnd(14)} ${pct.padStart(5)}%  (${stats.bySector[sector]} in DB)`);
  }
  console.log('');

  // Generate and submit
  let ok = 0;
  let fail = 0;
  let skipped = 0;

  console.log('  Submitting...');
  console.log('  ' + '─'.repeat(70));

  for (let i = 0; i < count; i++) {
    // Pick country and sector with retry (in case no entities available)
    let entity: EntityRecord | null = null;
    let country = '';
    let sector = '';
    let attempts = 0;

    while (!entity && attempts < 20) {
      country = weightedPick(CONFIG.countryWeights);
      sector = weightedPick(CONFIG.sectorWeights);
      entity = pickEntity(country, sector);
      attempts++;
    }

    if (!entity) {
      skipped++;
      continue;
    }

    const success = await submitEntity(baseUrl, botSecret, country, sector, entity, dryRun);
    if (success) ok++; else fail++;

    // Rate limiting: ~1-2 per second
    if (!dryRun && i < count - 1) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    }
  }

  console.log('  ' + '─'.repeat(70));
  console.log('');
  console.log(`  Done! ✅ ${ok} succeeded, ❌ ${fail} failed, ⏭️ ${skipped} skipped (DB exhausted)`);
  console.log(`  Unique entities used: ${usedEntities.size}`);
  console.log('');
}

main().catch(console.error);
