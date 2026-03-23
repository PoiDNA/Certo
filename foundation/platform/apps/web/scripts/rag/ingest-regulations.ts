#!/usr/bin/env npx tsx
/**
 * Curated Regulation Ingestion — fetches and ingests key governance regulations
 *
 * Usage:
 *   npx tsx scripts/rag/ingest-regulations.ts [--category eu|oecd|pl|all]
 *
 * Categories:
 *   eu   — EU directives/regulations (EUR-Lex)
 *   oecd — OECD governance principles
 *   pl   — Polish law (Dz.U., ISAP)
 *   all  — everything (default)
 */

import { parseHtml } from "./parsers/html.js";
import { chunkSections } from "./chunker.js";
import { embedTexts } from "./embedder.js";
import { upsertDocument, insertChunks, getDocumentByHash } from "./store.js";
import crypto from "crypto";

// CLI
const args = process.argv.slice(2);
const category = args.includes("--category")
  ? args[args.indexOf("--category") + 1]
  : "all";

interface RegulationSource {
  title: string;
  url: string;
  sourceType: "regulation" | "oecd" | "academic";
  sectors: string[];
  language: string;
  description: string;
}

// ─── Curated sources ────────────────────────────────────────────────────────

const EU_SOURCES: RegulationSource[] = [
  {
    title: "Corporate Sustainability Reporting Directive (CSRD) 2022/2464",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2464",
    sourceType: "regulation",
    sectors: ["corporate"],
    language: "en",
    description: "EU ESG reporting directive for corporate governance",
  },
  {
    title: "NIS2 Directive 2022/2555 — Cybersecurity",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555",
    sourceType: "regulation",
    sectors: ["corporate", "defense", "medical"],
    language: "en",
    description: "EU network and information security directive",
  },
  {
    title: "Shareholder Rights Directive II 2017/828",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32017L0828",
    sourceType: "regulation",
    sectors: ["corporate"],
    language: "en",
    description: "EU directive on shareholder engagement and governance",
  },
  {
    title: "EU AI Act Regulation 2024/1689",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689",
    sourceType: "regulation",
    sectors: ["corporate", "medical", "defense", "jst"],
    language: "en",
    description: "EU Artificial Intelligence regulation",
  },
  {
    title: "Digital Operational Resilience Act (DORA) 2022/2554",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2554",
    sourceType: "regulation",
    sectors: ["corporate"],
    language: "en",
    description: "EU financial sector ICT resilience regulation",
  },
  {
    title: "GDPR — General Data Protection Regulation 2016/679",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679",
    sourceType: "regulation",
    sectors: ["corporate", "jst", "medical", "ngo", "defense"],
    language: "en",
    description: "EU data protection regulation — all sectors",
  },
];

const OECD_SOURCES: RegulationSource[] = [
  {
    title: "OECD G20 Principles of Corporate Governance 2023",
    url: "https://www.oecd.org/en/publications/g20-oecd-principles-of-corporate-governance-2023_ed750b30-en.html",
    sourceType: "oecd",
    sectors: ["corporate"],
    language: "en",
    description: "OECD principles for corporate governance",
  },
  {
    title: "OECD Guidelines on Anti-Corruption and Integrity in SOEs 2019",
    url: "https://www.oecd.org/en/publications/guidelines-on-anti-corruption-and-integrity-in-state-owned-enterprises_315f5693-en.html",
    sourceType: "oecd",
    sectors: ["corporate", "jst"],
    language: "en",
    description: "OECD integrity guidelines for state-owned enterprises",
  },
];

const PL_SOURCES: RegulationSource[] = [
  {
    title: "Ustawa o samorządzie gminnym (Dz.U. 1990 nr 16 poz. 95)",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19900160095",
    sourceType: "regulation",
    sectors: ["jst"],
    language: "pl",
    description: "Polish local government act — municipal level",
  },
  {
    title: "Ustawa o samorządzie powiatowym (Dz.U. 1998 nr 91 poz. 578)",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19980910578",
    sourceType: "regulation",
    sectors: ["jst"],
    language: "pl",
    description: "Polish local government act — county level",
  },
  {
    title: "Kodeks spółek handlowych (KSH, Dz.U. 2000 nr 94 poz. 1037)",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20000941037",
    sourceType: "regulation",
    sectors: ["corporate"],
    language: "pl",
    description: "Polish Commercial Companies Code",
  },
  {
    title: "Ustawa o działalności leczniczej (Dz.U. 2011 nr 112 poz. 654)",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20111120654",
    sourceType: "regulation",
    sectors: ["medical"],
    language: "pl",
    description: "Polish medical activity regulation",
  },
  {
    title: "Ustawa Prawo o stowarzyszeniach (Dz.U. 1989 nr 20 poz. 104)",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19890200104",
    sourceType: "regulation",
    sectors: ["ngo"],
    language: "pl",
    description: "Polish law on associations",
  },
  {
    title: "Ustawa o fundacjach (Dz.U. 1984 nr 21 poz. 97)",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19840210097",
    sourceType: "regulation",
    sectors: ["ngo"],
    language: "pl",
    description: "Polish foundation law",
  },
];

// ─── Ingestion ──────────────────────────────────────────────────────────────

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(url, {
        headers: {
          "User-Agent": "CertoRAGBot/1.0 (governance research; contact: admin@certogov.org)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`   Retry ${i + 1}/${retries}...`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error("Unreachable");
}

async function ingestRegulation(source: RegulationSource): Promise<boolean> {
  console.log(`\n📜 ${source.title}`);
  console.log(`   ${source.url}`);

  // Check dedup by URL hash
  const urlHash = crypto.createHash("sha256").update(source.url).digest("hex");
  const existing = await getDocumentByHash(urlHash);
  if (existing) {
    console.log("   ⏭️  Already ingested (use --force to re-ingest)");
    return false;
  }

  // Fetch
  console.log("   Fetching...");
  let html: string;
  try {
    html = await fetchWithRetry(source.url);
  } catch (err) {
    console.error(`   ❌ Fetch failed: ${err instanceof Error ? err.message : err}`);
    console.log("   💡 You can manually download the HTML and use ingest.ts instead");
    return false;
  }

  // Parse
  console.log("   Parsing HTML...");
  const sections = parseHtml(html, source.url);
  console.log(`   Found ${sections.length} sections`);

  if (sections.length === 0) {
    console.log("   ⚠️  No content extracted, skipping");
    return false;
  }

  // Chunk
  console.log("   Chunking...");
  const chunks = chunkSections(sections);
  console.log(`   Created ${chunks.length} chunks`);

  // Embed
  console.log("   Embedding...");
  const texts = chunks.map((c) => c.content);
  const embeddings = await embedTexts(texts);

  // Store
  console.log("   Storing...");
  const documentId = await upsertDocument({
    title: source.title,
    sourceType: source.sourceType,
    sector: source.sectors,
    language: source.language,
    filePath: source.url,
    fileHash: urlHash,
    confidential: false,
    metadata: {
      url: source.url,
      description: source.description,
      chunkCount: chunks.length,
      totalTokens: chunks.reduce((sum, c) => sum + c.tokenCount, 0),
      fetchedAt: new Date().toISOString(),
    },
  });

  await insertChunks(
    chunks.map((chunk, i) => ({
      documentId,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      tokenCount: chunk.tokenCount,
      embedding: embeddings[i],
      metadata: chunk.metadata,
    }))
  );

  console.log(`   ✅ Done (${chunks.length} chunks, ID: ${documentId})`);
  return true;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("📜 Certo Regulation Ingestion Pipeline");
  console.log(`   Category: ${category}`);

  const sources: RegulationSource[] = [];
  if (category === "all" || category === "eu") sources.push(...EU_SOURCES);
  if (category === "all" || category === "oecd") sources.push(...OECD_SOURCES);
  if (category === "all" || category === "pl") sources.push(...PL_SOURCES);

  console.log(`\nFound ${sources.length} regulations to process\n`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const source of sources) {
    try {
      const ingested = await ingestRegulation(source);
      if (ingested) success++;
      else skipped++;
    } catch (err) {
      console.error(`   ❌ Error: ${err instanceof Error ? err.message : err}`);
      errors++;
    }

    // Rate-limit: 2s between fetches to be polite
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n📊 Summary: ${success} ingested, ${skipped} skipped, ${errors} errors`);
  console.log(`\n💡 For Polish law: ISAP may require manual HTML download.`);
  console.log(`   Save as .html and use: npx tsx scripts/rag/ingest.ts --source file.html --type regulation --sector jst`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
