#!/usr/bin/env npx tsx
/**
 * Pilot Bot — Vote simulator
 *
 * Adds random votes to accepted entities on the pilot map.
 * Distributes votes naturally — popular entities get more.
 *
 * Usage:
 *   npx tsx scripts/pilot-bot-votes.ts --votes 15
 *   npx tsx scripts/pilot-bot-votes.ts --votes 10 --dry-run
 *
 * Env:
 *   PILOT_BOT_SECRET — required for live
 *   PILOT_BOT_URL    — default: https://www.certogov.org
 */

type App = { id: string; organization_name: string; votes: number; sector: string };

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string, def: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
  };

  const targetVotes = parseInt(getArg('--votes', '10'), 10);
  const dryRun = args.includes('--dry-run');
  const baseUrl = process.env.PILOT_BOT_URL || 'https://www.certogov.org';
  const botSecret = process.env.PILOT_BOT_SECRET || '';

  if (!dryRun && !botSecret) {
    console.error('❌ PILOT_BOT_SECRET required. Use --dry-run for preview.');
    process.exit(1);
  }

  // Fetch all accepted applications
  const res = await fetch(`${baseUrl}/api/pilot-applications-public`);
  const { data: apps } = await res.json() as { data: App[] };

  if (!apps || apps.length === 0) {
    console.log('No applications found.');
    return;
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       👍 Pilot Bot — Vote Simulator                 ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  URL:        ${baseUrl}`);
  console.log(`  Entities:   ${apps.length}`);
  console.log(`  Votes:      ${targetVotes}`);
  console.log(`  Mode:       ${dryRun ? '🔍 DRY RUN' : '🚀 LIVE'}`);
  console.log('');

  // Distribute votes with natural bias — some entities get more
  // Weight: entities with fewer votes are slightly more likely (catch-up)
  // but also random spikes for some entities
  let ok = 0;
  let fail = 0;

  console.log('  Voting...');
  console.log('  ' + '─'.repeat(60));

  for (let i = 0; i < targetVotes; i++) {
    // Pick a random entity — slight bias toward less-voted ones
    const maxVotes = Math.max(...apps.map(a => a.votes || 0), 1);
    const weights = apps.map(a => {
      const v = a.votes || 0;
      // Inverse weight: fewer votes = higher chance, but with randomness
      return Math.max(1, maxVotes - v + 3) + Math.random() * 5;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    let picked = apps[0];
    for (let j = 0; j < apps.length; j++) {
      r -= weights[j];
      if (r <= 0) { picked = apps[j]; break; }
    }

    // Random vote count: usually 1, sometimes 2-3
    const voteCount = Math.random() < 0.7 ? 1 : (Math.random() < 0.6 ? 2 : 3);

    if (dryRun) {
      console.log(`  [DRY] +${voteCount} → ${picked.organization_name} (current: ${picked.votes || 0})`);
      picked.votes = (picked.votes || 0) + voteCount;
      ok++;
    } else {
      try {
        const voteRes = await fetch(`${baseUrl}/api/pilot-bot-vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bot_secret: botSecret, id: picked.id, votes: voteCount }),
        });
        const data = await voteRes.json();
        if (voteRes.ok) {
          console.log(`  ✅ +${voteCount} → ${data.name} (total: ${data.newTotal})`);
          picked.votes = data.newTotal;
          ok++;
        } else {
          console.log(`  ❌ ${picked.organization_name} — ${data.error}`);
          fail++;
        }
      } catch (err) {
        console.log(`  ❌ ${picked.organization_name} — ${(err as Error).message}`);
        fail++;
      }

      // Rate limit
      if (i < targetVotes - 1) {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
      }
    }
  }

  console.log('  ' + '─'.repeat(60));
  console.log('');
  console.log(`  Done! ✅ ${ok} votes added, ❌ ${fail} failed`);
  console.log('');
}

main().catch(console.error);
