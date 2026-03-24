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
