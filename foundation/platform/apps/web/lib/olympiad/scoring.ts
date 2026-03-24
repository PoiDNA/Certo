import {
  EMOJI_WEIGHTS,
  ACHIEVEMENT_LEVELS,
  type TenantConfig,
  type AchievementLevel,
} from "./types";

/**
 * Calculate Certo Score from survey responses.
 *
 * Algorithm:
 * 1. For each pillar, average all emoji responses (weighted: 👍=2, 🤷=0, 👎=-1)
 * 2. Normalize pillar averages to 0-100 scale
 * 3. Apply pillar weights from TenantConfig
 * 4. Sum weighted scores → Certo Score (0-100)
 * 5. Apply Community Bonus if participation exceeds bonus threshold
 * 6. Enforce k-anonymity (groups with <5 respondents → suppressed)
 */

interface PillarResponses {
  [pillarId: string]: number[]; // array of emoji values (-1, 0, 2)
}

interface GroupParticipation {
  groupId: string;
  respondents: number;
  declaredPopulation: number;
}

interface ScoringResult {
  pillarScores: Record<string, number>; // 0-100 per pillar
  certoScore: number; // 0-100
  certoVector: string; // "++", "+", "→", "−", "−−"
  participationRates: Record<string, number>; // % per group
  communityBonus: number;
  kAnonymitySuppressed: number; // count of suppressed groups
  achievementLevel: AchievementLevel | null;
}

const K_ANONYMITY_THRESHOLD = 5;

/**
 * Normalize emoji average (-1 to 2) to 0-100 scale.
 * -1 → 0, 0 → 33, 2 → 100
 */
function normalizeEmojiToPercent(avg: number): number {
  // Map from [-1, 2] to [0, 100]
  const min = EMOJI_WEIGHTS.negative; // -1
  const max = EMOJI_WEIGHTS.positive; // 2
  const normalized = ((avg - min) / (max - min)) * 100;
  return Math.round(Math.max(0, Math.min(100, normalized)));
}

/**
 * Determine Certo Vector from score.
 * In a real implementation, this would compare with previous score.
 * For MVP, we derive it from the score itself.
 */
function calculateVector(score: number): string {
  if (score >= 90) return "++";
  if (score >= 75) return "+";
  if (score >= 50) return "→";
  if (score >= 30) return "−";
  return "−−";
}

/**
 * Determine achievement level from Certo Score.
 */
function getAchievementLevel(score: number): AchievementLevel | null {
  for (const [key, level] of Object.entries(ACHIEVEMENT_LEVELS)) {
    if (score >= level.min && score <= level.max) {
      return key as AchievementLevel;
    }
  }
  return null;
}

/**
 * Calculate Community Bonus.
 * If participation exceeds bonus threshold for any group, add bonus points.
 */
function calculateCommunityBonus(
  participation: GroupParticipation[],
  config: TenantConfig
): number {
  let bonus = 0;
  for (const p of participation) {
    const threshold = config.thresholds[p.groupId];
    if (!threshold) continue;
    const rate = (p.respondents / p.declaredPopulation) * 100;
    if (rate >= threshold.bonus_pct) {
      bonus += 2; // +2 points per group exceeding bonus threshold
    }
  }
  return Math.min(bonus, 10); // cap at 10 bonus points
}

/**
 * Main scoring function.
 */
export function calculateCertoScore(
  pillarResponses: PillarResponses,
  participation: GroupParticipation[],
  config: TenantConfig
): ScoringResult {
  // k-Anonymity: suppress groups with <5 respondents
  let kAnonymitySuppressed = 0;
  const suppressedGroups = new Set<string>();
  for (const p of participation) {
    if (p.respondents < K_ANONYMITY_THRESHOLD) {
      suppressedGroups.add(p.groupId);
      kAnonymitySuppressed++;
    }
  }

  // Calculate pillar scores
  const pillarScores: Record<string, number> = {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const pillar of config.pillars) {
    const responses = pillarResponses[pillar.id];
    if (!responses || responses.length === 0) {
      pillarScores[pillar.id] = 0;
      continue;
    }

    const avg = responses.reduce((a, b) => a + b, 0) / responses.length;
    const normalized = normalizeEmojiToPercent(avg);
    pillarScores[pillar.id] = normalized;
    weightedSum += normalized * pillar.weight;
    totalWeight += pillar.weight;
  }

  // Base Certo Score (weighted average)
  let certoScore =
    totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Participation rates
  const participationRates: Record<string, number> = {};
  for (const p of participation) {
    participationRates[p.groupId] =
      p.declaredPopulation > 0
        ? Math.round((p.respondents / p.declaredPopulation) * 100)
        : 0;
  }

  // Community Bonus
  const communityBonus = calculateCommunityBonus(participation, config);
  certoScore = Math.min(100, certoScore + communityBonus);

  // Vector and achievement
  const certoVector = calculateVector(certoScore);
  const achievementLevel = getAchievementLevel(certoScore);

  return {
    pillarScores,
    certoScore,
    certoVector,
    participationRates,
    communityBonus,
    kAnonymitySuppressed,
    achievementLevel,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Action Completion Boost — automatic rating upgrade after Certo Action
// ═══════════════════════════════════════════════════════════════════

/**
 * Approval levels for rating upgrades.
 *
 * The higher the target level, the more scrutiny required:
 * - Within same level (e.g. 55→62 Bronze): automatic
 * - Bronze → Silver (65+): automatic if peer-review ≥ 3.5
 * - Silver → Gold (80+): Certo Advisor must approve
 * - Gold → Diament (90+): Kolegium Eksperckie must approve
 */
export type ApprovalRequirement = "automatic" | "advisor" | "expert-college";

export interface ActionBoostInput {
  currentScore: number;
  currentLevel: AchievementLevel | null;
  weakestPillar: string;
  weakestPillarScore: number;
  allStepsCompleted: boolean;
  allStepsHaveProof: boolean;
  peerReviewAvg: number | null;   // 1-5 scale, from Phase III
  llmScore: number | null;        // 0-100, from LLM pre-filter
  stepsCount: number;
  completedStepsCount: number;
}

export interface ActionBoostResult {
  eligible: boolean;
  reason: string;
  pillarBoost: number;         // points added to weakest pillar (0-15)
  newPillarScore: number;      // after boost
  newCertoScore: number;       // estimated new total
  newLevel: AchievementLevel | null;
  levelChanged: boolean;
  approvalRequired: ApprovalRequirement;
  approvalReason: string;
}

/**
 * Calculate the boost from completing a Certo Action.
 *
 * The boost is proportional to:
 * 1. Completion rate (all steps must be done for max boost)
 * 2. Quality (peer-review score and LLM score)
 * 3. Evidence (all steps must have proof)
 *
 * Maximum boost: +15 points on the weakest pillar.
 * This translates to ~2-4 points on the total Certo Score
 * (depending on pillar weight).
 */
export function calculateActionBoost(
  input: ActionBoostInput,
  config: TenantConfig
): ActionBoostResult {
  const {
    currentScore,
    currentLevel,
    weakestPillar,
    weakestPillarScore,
    allStepsCompleted,
    allStepsHaveProof,
    peerReviewAvg,
    llmScore,
    stepsCount,
    completedStepsCount,
  } = input;

  // ── Gate checks ──────────────────────────────────────────
  if (!allStepsCompleted) {
    return notEligible("Nie wszystkie kroki zostały zrealizowane. Dokończ wszystkie etapy Drogi do Zmiany.");
  }

  if (!allStepsHaveProof) {
    return notEligible("Nie wszystkie kroki mają załączony dowód realizacji. Dodaj dowody do każdego kroku.");
  }

  if (peerReviewAvg !== null && peerReviewAvg < 2.5) {
    return notEligible(`Ocena Peer-Review (${peerReviewAvg}/5) jest poniżej wymaganego progu 2.5. Popraw plan i poproś o ponowną ocenę.`);
  }

  // ── Boost calculation ────────────────────────────────────
  // Base boost: 8 points for completing all steps
  let pillarBoost = 8;

  // Quality multiplier from peer-review (0.6x — 1.5x)
  if (peerReviewAvg !== null) {
    const qualityMultiplier = 0.6 + (peerReviewAvg / 5) * 0.9; // 2.5→1.05, 5.0→1.5
    pillarBoost = Math.round(pillarBoost * qualityMultiplier);
  }

  // LLM quality bonus (0 — 3 points)
  if (llmScore !== null && llmScore >= 60) {
    pillarBoost += Math.round((llmScore - 60) / 15); // 60→0, 75→1, 90→2, 100→3
  }

  // Cap at 15
  pillarBoost = Math.min(15, Math.max(0, pillarBoost));

  // ── New scores ───────────────────────────────────────────
  const newPillarScore = Math.min(100, weakestPillarScore + pillarBoost);

  // Estimate new Certo Score (recalculate with boosted pillar)
  const pillarWeight = config.pillars.find((p) => p.id === weakestPillar)?.weight ?? 15;
  const pillarScoreChange = newPillarScore - weakestPillarScore;
  const totalWeight = config.pillars.reduce((s, p) => s + p.weight, 0);
  const certoScoreChange = Math.round((pillarScoreChange * pillarWeight) / totalWeight);
  const newCertoScore = Math.min(100, currentScore + certoScoreChange);

  const newLevel = getAchievementLevel(newCertoScore);
  const levelChanged = newLevel !== currentLevel;

  // ── Approval requirement ─────────────────────────────────
  let approvalRequired: ApprovalRequirement = "automatic";
  let approvalReason = "Zmiana w ramach obecnego poziomu — zatwierdzana automatycznie.";

  if (newLevel === "diament" && currentLevel !== "diament") {
    approvalRequired = "expert-college";
    approvalReason = "Awans do Diament Certo wymaga zatwierdzenia przez Kolegium Eksperckie Certo Governance Institute.";
  } else if (newLevel === "gold" && currentLevel !== "gold" && currentLevel !== "diament") {
    approvalRequired = "advisor";
    approvalReason = "Awans do Certo Gold wymaga weryfikacji dowodów przez Certo Advisor.";
  } else if (levelChanged) {
    approvalRequired = "automatic";
    approvalReason = `Automatyczny awans z ${currentLevel || "brak"} → ${newLevel}. Peer-Review ≥ 3.5 i dowody kompletne.`;
  }

  // For automatic approval, peer-review must be ≥ 3.5
  if (approvalRequired === "automatic" && levelChanged && (peerReviewAvg === null || peerReviewAvg < 3.5)) {
    approvalRequired = "advisor";
    approvalReason = `Awans wymaga Certo Advisor — Peer-Review (${peerReviewAvg ?? "brak"}/5) poniżej 3.5 dla automatycznego zatwierdzenia.`;
  }

  return {
    eligible: true,
    reason: `Certo Action zrealizowany. Boost +${pillarBoost} pkt na filarze "${weakestPillar}" (${weakestPillarScore} → ${newPillarScore}). Nowy Certo Score: ${newCertoScore}.`,
    pillarBoost,
    newPillarScore,
    newCertoScore,
    newLevel,
    levelChanged,
    approvalRequired,
    approvalReason,
  };
}

function notEligible(reason: string): ActionBoostResult {
  return {
    eligible: false,
    reason,
    pillarBoost: 0,
    newPillarScore: 0,
    newCertoScore: 0,
    newLevel: null,
    levelChanged: false,
    approvalRequired: "automatic",
    approvalReason: "",
  };
}

// ═══════════════════════════════════════════════════════════════════
// Certo Vector — proper comparison with previous score
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Certo Vector by comparing current score with previous.
 * This is the production version (replaces MVP placeholder).
 */
export function calculateVectorFromHistory(
  currentScore: number,
  previousScore: number | null
): string {
  if (previousScore === null) return calculateVector(currentScore);

  const delta = currentScore - previousScore;
  if (delta >= 10) return "++";  // Significant improvement
  if (delta >= 3) return "+";    // Improvement
  if (delta >= -2) return "→";   // Stable
  if (delta >= -9) return "−";   // Deterioration
  return "−−";                   // Significant deterioration
}
