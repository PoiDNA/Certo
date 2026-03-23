#!/usr/bin/env npx tsx
/**
 * Stale Document Detector
 *
 * Queries rag_documents for documents ingested more than 90 days ago.
 * Outputs a report of potentially stale documents that may need re-ingestion.
 *
 * Usage:
 *   npx tsx scripts/rag/check-stale.ts [--days 90]
 */

import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const daysIdx = args.indexOf("--days");
const staleDays = daysIdx >= 0 ? parseInt(args[daysIdx + 1], 10) : 90;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key);
}

async function main() {
  console.log("📋 Certo Stale Document Detector");
  console.log(`   Threshold: ${staleDays} days\n`);

  const sb = getSupabase();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - staleDays);
  const cutoffISO = cutoffDate.toISOString();

  const { data, error } = await sb
    .from("rag_documents")
    .select("id, title, source_type, sector, language, file_path, created_at, updated_at")
    .lt("updated_at", cutoffISO)
    .order("updated_at", { ascending: true });

  if (error) {
    console.error("Error querying documents:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("No stale documents found. All documents are up to date.");
    return;
  }

  console.log(`Found ${data.length} potentially stale document(s):\n`);
  console.log("─".repeat(100));
  console.log(
    "ID".padEnd(38) +
      "Title".padEnd(40) +
      "Type".padEnd(12) +
      "Last Updated"
  );
  console.log("─".repeat(100));

  for (const doc of data) {
    const updatedAt = new Date(doc.updated_at);
    const daysAgo = Math.floor(
      (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log(
      (doc.id as string).padEnd(38) +
        (doc.title as string).slice(0, 38).padEnd(40) +
        (doc.source_type as string).padEnd(12) +
        `${updatedAt.toISOString().slice(0, 10)} (${daysAgo}d ago)`
    );
  }

  console.log("─".repeat(100));
  console.log(`\nTotal: ${data.length} stale document(s)`);
  console.log(
    `\nTo re-ingest a document, use:\n  npx tsx scripts/rag/ingest.ts --source <path> --type <type> --force`
  );

  // Group by source type for summary
  const byType = new Map<string, number>();
  for (const doc of data) {
    const t = doc.source_type as string;
    byType.set(t, (byType.get(t) || 0) + 1);
  }

  console.log("\nBy source type:");
  for (const [type, count] of byType) {
    console.log(`  ${type}: ${count}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
