/**
 * Rules Engine for Certo RAG Agent
 *
 * Evaluates formalized governance rules against matched concepts and sectors.
 * Rules are injected into LLM context for interpretive reasoning.
 */

import { getRulesForConcepts } from "./graph";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AppliedRule {
  id: string;
  name: string;
  description: string;
  ruleType: string;
  sectors: string[];
  condition: Record<string, unknown>;
  consequence: Record<string, unknown>;
  priority: number;
  sourceRegulation?: string;
}

export interface RuleConflict {
  ruleA: AppliedRule;
  ruleB: AppliedRule;
  conflictType: "contradicts" | "overlaps";
  description: string;
}

export interface RuleChain {
  steps: AppliedRule[];
  description: string;
}

export interface RuleEvaluationResult {
  rules: AppliedRule[];
  conflicts: RuleConflict[];
  chains: RuleChain[];
}

// ─── Rule evaluation ────────────────────────────────────────────────────────

/**
 * Evaluate rules matching the given concepts and sector.
 */
export async function evaluateRules(
  conceptIds: string[],
  sector?: string
): Promise<RuleEvaluationResult> {
  if (conceptIds.length === 0) {
    return { rules: [], conflicts: [], chains: [] };
  }

  const rawRules = await getRulesForConcepts(conceptIds, sector);

  const rules: AppliedRule[] = rawRules.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    ruleType: r.rule_type,
    sectors: r.sectors,
    condition: r.condition,
    consequence: r.consequence,
    priority: r.priority,
    sourceRegulation: r.source_regulation,
  }));

  // Detect conflicts
  const conflicts = detectConflicts(rules);

  // Follow chains
  const chains = buildChains(rules);

  return { rules, conflicts, chains };
}

/**
 * Detect conflicting rules (contradicting consequences).
 */
function detectConflicts(rules: AppliedRule[]): RuleConflict[] {
  const conflicts: RuleConflict[] = [];

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i];
      const b = rules[j];

      // Check for direct contradiction: one requires, other prohibits same concept
      const aTarget = (a.consequence as { target_concept?: string }).target_concept;
      const bTarget = (b.consequence as { target_concept?: string }).target_concept;

      if (aTarget && bTarget && aTarget.toLowerCase() === bTarget.toLowerCase()) {
        const aType = (a.consequence as { type?: string }).type;
        const bType = (b.consequence as { type?: string }).type;

        if (
          (aType === "requirement" && bType === "prohibition") ||
          (aType === "prohibition" && bType === "requirement")
        ) {
          conflicts.push({
            ruleA: a,
            ruleB: b,
            conflictType: "contradicts",
            description:
              `Reguła "${a.name}" (${a.sourceRegulation || "—"}) ${aType === "requirement" ? "wymaga" : "zabrania"} "${aTarget}", ` +
              `ale reguła "${b.name}" (${b.sourceRegulation || "—"}) ${bType === "requirement" ? "wymaga" : "zabrania"} tego samego.`,
          });
        }
      }

      // Check for sector-specific overlap (same requirement, different sectors)
      if (
        aTarget &&
        bTarget &&
        aTarget.toLowerCase() === bTarget.toLowerCase() &&
        a.sectors.length > 0 &&
        b.sectors.length > 0 &&
        !a.sectors.some((s) => b.sectors.includes(s))
      ) {
        conflicts.push({
          ruleA: a,
          ruleB: b,
          conflictType: "overlaps",
          description:
            `Reguła "${a.name}" dotyczy sektorów [${a.sectors.join(",")}], ` +
            `a "${b.name}" dotyczy [${b.sectors.join(",")}] — różne wymagania dla "${aTarget}".`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Build requirement chains: A→B→C where A requires B and B requires C.
 */
function buildChains(rules: AppliedRule[]): RuleChain[] {
  const chains: RuleChain[] = [];
  const requirementRules = rules.filter(
    (r) => (r.consequence as { type?: string }).type === "requirement"
  );

  // Build adjacency: consequence.target_concept → rules that trigger on it
  const targetToRules = new Map<string, AppliedRule[]>();
  for (const r of requirementRules) {
    const trigger = (r.condition as { concept?: string }).concept?.toLowerCase();
    if (trigger) {
      const existing = targetToRules.get(trigger) || [];
      existing.push(r);
      targetToRules.set(trigger, existing);
    }
  }

  // Follow chains from each rule
  for (const startRule of requirementRules) {
    const target = (startRule.consequence as { target_concept?: string }).target_concept?.toLowerCase();
    if (!target) continue;

    const nextRules = targetToRules.get(target);
    if (!nextRules || nextRules.length === 0) continue;

    for (const nextRule of nextRules) {
      const chain: AppliedRule[] = [startRule, nextRule];

      // Try one more hop
      const nextTarget = (nextRule.consequence as { target_concept?: string }).target_concept?.toLowerCase();
      if (nextTarget) {
        const thirdRules = targetToRules.get(nextTarget);
        if (thirdRules) chain.push(thirdRules[0]);
      }

      chains.push({
        steps: chain,
        description: chain
          .map((r) => `${r.name} (${r.sourceRegulation || "—"})`)
          .join(" → "),
      });
    }
  }

  return chains;
}
