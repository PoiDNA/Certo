/**
 * Transnational Peer-Review engine for Olimpiada Certo.
 *
 * Ring Topology: each org reviews the next one in the ring.
 * Cross-border: orgs from different countries are paired.
 * Double-blind: no org names, no location data.
 * Country Context Cards: auto-generated context for the reviewer.
 */

// Country Context Cards — basic governance context per EU country
const COUNTRY_CONTEXT: Record<string, Record<string, string>> = {
  PL: {
    pl: "Polska: system oświaty zarządzany przez kuratoria oświaty i organy prowadzące (gminy/powiaty). Dyrektor szkoły pełni rolę jednoosobowego organu wykonawczego. Rada pedagogiczna ma charakter opiniodawczo-doradczy. Samorząd uczniowski jest obligatoryjny.",
    en: "Poland: education system managed by regional education authorities (kuratoria) and local governments. School principal acts as a single executive body. Teaching council has advisory role. Student council is mandatory.",
  },
  DE: {
    pl: "Niemcy: system oświaty zdecentralizowany — 16 landów ma własne ministerstwa edukacji. Szkoły mają dużą autonomię. Rady szkolne (Schulkonferenz) z udziałem rodziców, nauczycieli i uczniów.",
    en: "Germany: decentralized education system — 16 Länder have own education ministries. Schools have significant autonomy. School conferences (Schulkonferenz) include parents, teachers, and students.",
  },
  FR: {
    pl: "Francja: silnie scentralizowany system edukacji pod kontrolą Ministerstwa Edukacji Narodowej. Szkoły mają ograniczoną autonomię. Rady szkolne (conseil d'école) z udziałem rodziców.",
    en: "France: highly centralized education system under Ministry of National Education. Schools have limited autonomy. School councils (conseil d'école) include parents.",
  },
  ES: {
    pl: "Hiszpania: system zdecentralizowany — wspólnoty autonomiczne zarządzają oświatą. Szkoły mają rady szkolne (consejo escolar) z wybieralnymi przedstawicielami rodziców i uczniów.",
    en: "Spain: decentralized system — autonomous communities manage education. Schools have school councils (consejo escolar) with elected parent and student representatives.",
  },
  IT: {
    pl: "Włochy: scentralizowany system z elementami autonomii szkolnej od reformy 1997. Dyrektor szkoły (dirigente scolastico) ma silną pozycję. Rada instytutu z udziałem rodziców i uczniów.",
    en: "Italy: centralized system with school autonomy elements since 1997 reform. School principal (dirigente scolastico) has strong position. Institute council includes parents and students.",
  },
  SE: {
    pl: "Szwecja: zdecentralizowany system — gminy zarządzają szkołami. Płaska struktura zarządzania. Silna tradycja partycypacji uczniów i rodziców. Inspektorat Szkolny prowadzi regularne kontrole.",
    en: "Sweden: decentralized system — municipalities manage schools. Flat management structure. Strong tradition of student and parent participation. School Inspectorate conducts regular reviews.",
  },
  NL: {
    pl: "Holandia: system 'wolności edukacji' — szkoły mają dużą autonomię programową i zarządczą. Rady szkolne (medezeggenschapsraad) z silną pozycją rodziców.",
    en: "Netherlands: 'freedom of education' system — schools have significant curricular and managerial autonomy. School councils (medezeggenschapsraad) with strong parent position.",
  },
  CZ: {
    pl: "Czechy: dwustopniowy system — szkoły podlegają gminom (podstawowe) lub krajom (średnie). Rada szkoły (školská rada) z udziałem rodziców, nauczycieli i gminy.",
    en: "Czech Republic: two-tier system — schools under municipalities (primary) or regions (secondary). School council (školská rada) with parents, teachers, and municipality.",
  },
};

// Default context for countries without specific card
const DEFAULT_CONTEXT: Record<string, string> = {
  pl: "Kraj UE: system oświaty zgodny z europejskimi standardami governance. Szczegółowe uwarunkowania prawne mogą się różnić od Twojego kraju.",
  en: "EU country: education system aligned with European governance standards. Specific legal frameworks may differ from your country.",
};

/**
 * Get Country Context Card for a reviewer.
 */
export function getCountryContextCard(
  targetCountry: string,
  reviewerLocale: string
): string {
  const context = COUNTRY_CONTEXT[targetCountry.toUpperCase()];
  if (context) {
    return context[reviewerLocale] || context.en || context.pl || "";
  }
  return DEFAULT_CONTEXT[reviewerLocale] || DEFAULT_CONTEXT.en;
}

/**
 * Ring Topology assignment.
 * Given a list of org_ids, assign each org to review the next one in the ring.
 * Cross-border: shuffle so adjacent orgs are from different countries when possible.
 *
 * Returns: array of { reviewer_org_id, target_org_id, ring_position }
 */
export function assignRingTopology(
  orgs: { org_id: string; country: string }[]
): { reviewer_org_id: string; target_org_id: string; ring_position: number }[] {
  if (orgs.length < 2) return [];

  // Shuffle with cross-border priority
  const shuffled = crossBorderShuffle(orgs);

  return shuffled.map((org, i) => ({
    reviewer_org_id: org.org_id,
    target_org_id: shuffled[(i + 1) % shuffled.length].org_id,
    ring_position: i,
  }));
}

/**
 * Cross-border shuffle: try to alternate countries so no two adjacent orgs
 * are from the same country.
 */
function crossBorderShuffle(
  orgs: { org_id: string; country: string }[]
): { org_id: string; country: string }[] {
  // Group by country
  const byCountry: Record<string, { org_id: string; country: string }[]> = {};
  for (const org of orgs) {
    const c = org.country.toUpperCase();
    if (!byCountry[c]) byCountry[c] = [];
    byCountry[c].push(org);
  }

  // Shuffle within each country group
  for (const key of Object.keys(byCountry)) {
    byCountry[key] = fisherYatesShuffle(byCountry[key]);
  }

  // Interleave: pick from largest country first, alternate
  const countries = Object.keys(byCountry).sort(
    (a, b) => byCountry[b].length - byCountry[a].length
  );

  const result: { org_id: string; country: string }[] = [];
  let lastCountry = "";

  while (result.length < orgs.length) {
    let placed = false;
    for (const country of countries) {
      if (byCountry[country].length === 0) continue;
      if (country === lastCountry && countries.some((c) => c !== country && byCountry[c].length > 0)) {
        continue; // Skip same country if alternatives exist
      }
      result.push(byCountry[country].shift()!);
      lastCountry = country;
      placed = true;
      break;
    }
    if (!placed) {
      // Fallback: no cross-border option, just append remaining
      for (const country of countries) {
        while (byCountry[country].length > 0) {
          result.push(byCountry[country].shift()!);
        }
      }
    }
  }

  return result;
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * API helper: assign peer-review for a tenant's Phase III.
 */
export async function assignPeerReviewForTenant(
  tenantId: string,
  supabase: ReturnType<typeof import("./supabase").getOlympiadSupabase>
): Promise<{ assignments: number; error?: string }> {
  if (!supabase) return { assignments: 0, error: "No Supabase" };

  // Get all orgs with submitted Certo Actions
  const { data: actions, error } = await supabase
    .from("olympiad_actions")
    .select("org_id")
    .eq("tenant_id", tenantId)
    .not("what_to_change", "is", null);

  if (error || !actions || actions.length < 2) {
    return { assignments: 0, error: "Not enough actions for peer-review" };
  }

  // Get org countries
  const orgIds = actions.map((a) => a.org_id);
  const { data: orgs } = await supabase
    .from("olympiad_organizations")
    .select("org_id, country")
    .in("org_id", orgIds);

  if (!orgs || orgs.length < 2) {
    return { assignments: 0, error: "Not enough orgs" };
  }

  // Assign ring
  const assignments = assignRingTopology(orgs);

  // Insert peer-review assignments (empty scores, to be filled by reviewers)
  for (const a of assignments) {
    const targetOrg = orgs.find((o) => o.org_id === a.target_org_id);
    await supabase.from("olympiad_peer_reviews").insert({
      reviewer_org_id: a.reviewer_org_id,
      target_org_id: a.target_org_id,
      tenant_id: tenantId,
      country: targetOrg?.country || "unknown",
      checklist_scores: {},
      total_score: 0,
      ring_position: a.ring_position,
    });
  }

  return { assignments: assignments.length };
}
