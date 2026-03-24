import { z } from "zod";

// --- i18n helpers ---

const i18nString = z.record(z.string(), z.string()).describe("{ locale: text }");

// --- Survey question types ---

export const questionTypeSchema = z.enum([
  "emoji_3_scale", // 👍🤷👎 → weighted: 👍=2, 🤷=0, 👎=-1
  "scale_1_5",
  "yes_no",
  "open_text",
]);

export const surveyQuestionSchema = z.object({
  text: i18nString,
  type: questionTypeSchema.default("emoji_3_scale"),
  pillar: z.string(),
});

export const surveyConfigSchema = z.object({
  max_questions: z.number().int().min(1).max(10),
  max_duration_sec: z.number().int().min(30).max(600),
  response_type: questionTypeSchema.default("emoji_3_scale"),
  audio_tts: z
    .enum(["static_mp3", "none"])
    .default("static_mp3")
    .describe("Pre-generated MP3 on CDN or disabled"),
  questions: z.array(surveyQuestionSchema).min(1).max(10),
});

// --- Survey groups ---

export const surveyGroupSchema = z.object({
  group_id: z.string(),
  name: i18nString,
  min_age: z.number().int().optional(),
});

// --- Participation thresholds ---

export const thresholdSchema = z.object({
  min_pct: z.number().int().min(0).max(100),
  bonus_pct: z.number().int().min(0).max(100),
  scale_down_above: z
    .number()
    .int()
    .optional()
    .describe("Auto-lower thresholds 30% for orgs above this population"),
});

// --- Pillars ---

export const pillarSchema = z.object({
  id: z.string(),
  name: i18nString.describe("Professional name (coordinator/report)"),
  friendly_name: i18nString.describe("Plain Language name (surveys, public)"),
  weight: z.number().int().min(1).max(100),
});

// --- Workshop ---

export const workshopConfigSchema = z.object({
  title: i18nString,
  video_url: i18nString.optional(),
  duration_min: z.number().int().default(5),
  card_questions: z.number().int().default(5),
});

// --- Knowledge test ---

export const knowledgeTestConfigSchema = z.object({
  duration_min: z.number().int().default(20),
  num_questions: z.number().int().default(10),
  passing_pct: z.number().int().default(60),
  mode: z.enum(["team", "individual"]).default("team"),
  question_tags: z.array(z.string()).optional(),
});

// --- Certo Action ---

export const actionFormConfigSchema = z.object({
  max_steps: z.number().int().default(5),
  max_words: z.number().int().default(500),
  auto_topic_on_low_participation: z.boolean().default(true),
});

// --- Coordinator Track ---

export const coordinatorTrackConfigSchema = z.object({
  mode: z.enum(["micro_learning", "full_course"]).default("micro_learning"),
  certificate: i18nString,
});

// --- Population declaration ---

export const populationConfigSchema = z.object({
  required_groups: z.array(z.string()),
  director_signature: z.boolean().default(true),
  tolerance_pct: z.number().int().default(5),
});

// ======================
// FULL TENANT CONFIG
// ======================

export const tenantConfigSchema = z.object({
  tenant_id: z.string(),
  tenant_name: i18nString,
  tenant_slug: z.string().regex(/^[a-z0-9-]+$/),
  custom_domains: z.array(z.string()).default([]),
  team_alias: i18nString.describe("Tenant-specific name for Zespół Certo"),

  survey_groups: z.array(surveyGroupSchema).min(1),
  surveys: z.record(z.string(), surveyConfigSchema),

  thresholds: z.record(z.string(), thresholdSchema),
  micro_org_fallback: z
    .number()
    .int()
    .default(50)
    .describe("Orgs below this size: collect min 15 votes total instead of %"),

  population: populationConfigSchema,
  pillars: z
    .array(pillarSchema)
    .min(1)
    .refine((p) => p.reduce((sum, x) => sum + x.weight, 0) === 100, {
      message: "Pillar weights must sum to 100",
    }),

  workshop: workshopConfigSchema,
  knowledge_test: knowledgeTestConfigSchema,
  action_form: actionFormConfigSchema,
  action_templates_per_pillar: z.number().int().default(3),

  coordinator_track: coordinatorTrackConfigSchema,
});

export type TenantConfig = z.infer<typeof tenantConfigSchema>;
export type SurveyGroup = z.infer<typeof surveyGroupSchema>;
export type Pillar = z.infer<typeof pillarSchema>;
export type SurveyConfig = z.infer<typeof surveyConfigSchema>;
export type SurveyQuestion = z.infer<typeof surveyQuestionSchema>;
export type Threshold = z.infer<typeof thresholdSchema>;

// ======================
// SCORING CONSTANTS
// ======================

/** Emoji 3-scale weighted values: 👍=2, 🤷=0, 👎=-1 */
export const EMOJI_WEIGHTS = {
  positive: 2, // 👍
  neutral: 0, // 🤷 (lack of awareness ≠ neutrality)
  negative: -1, // 👎
} as const;

/** Achievement levels */
export const ACHIEVEMENT_LEVELS = {
  BRONZE: { min: 50, max: 64, label: "Certo Bronze" },
  SILVER: { min: 65, max: 79, label: "Certo Silver" },
  GOLD: { min: 80, max: 89, label: "Certo Gold" },
  DIAMENT: { min: 90, max: 100, label: "Diament Certo" },
} as const;

export type AchievementLevel = keyof typeof ACHIEVEMENT_LEVELS;

/** Special Diament categories */
export const SPECIAL_DIAMENTY = [
  "transparency",
  "community",
  "innovation",
  "mentorship",
] as const;

export type SpecialDiamentCategory = (typeof SPECIAL_DIAMENTY)[number];

// ======================
// DB ROW TYPES
// ======================

export interface OlympiadTenantRow {
  tenant_id: string;
  tenant_slug: string;
  tenant_name: Record<string, string>;
  is_active: boolean;
  config: TenantConfig;
  created_at: string;
}

export interface OlympiadOrganizationRow {
  org_id: string;
  tenant_id: string;
  org_name: string;
  country: string;
  municipality: string | null;
  coordinator_id: string | null;
  team_members: string[];
  declared_population: Record<string, number> | null;
  director_declaration: string | null;
  created_at: string;
}

export interface OlympiadCohortLinkRow {
  link_hash: string;
  org_id: string;
  tenant_id: string;
  group_id: string;
  cohort_name: string | null;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  whatsapp_msg: Record<string, string> | null;
  velocity_anomaly: boolean;
  created_at: string;
}

export interface OlympiadSurveyResponseRow {
  response_id: string;
  org_id: string;
  tenant_id: string;
  group_id: string;
  pillar_scores: Record<string, number>;
  open_text_sentiment: string | null;
  fingerprint_hash: string | null;
  behavioral_score: number | null;
  anomaly_flags: string[];
  submitted_at: string;
}

export interface OlympiadOrgRatingRow {
  org_id: string;
  tenant_id: string;
  pillar_scores: Record<string, number>;
  certo_score: number;
  certo_vector: string | null;
  participation_rates: Record<string, number> | null;
  community_bonus: number;
  comply_or_explain: string | null;
  k_anonymity_suppressed: number;
  created_at: string;
}

export interface OlympiadActionRow {
  org_id: string;
  tenant_id: string;
  weakest_pillar: string | null;
  template_used: string | null;
  what_to_change: string | null;
  steps: string[];
  success_metrics: string[];
  director_consulted: boolean;
  peer_review_avg: number | null;
  llm_prefilter_score: number | null;
  llm_feedback_reason: string | null;
  expert_score: number | null;
  jury_advisor_id: string | null;
  submitted_at: string;
}

export interface OlympiadPeerReviewRow {
  review_id: string;
  reviewer_org_id: string;
  target_org_id: string;
  tenant_id: string;
  country: string;
  checklist_scores: Record<string, number>;
  total_score: number;
  ring_position: number | null;
  created_at: string;
}

export interface OlympiadAchievementRow {
  org_id: string;
  tenant_id: string;
  level: string;
  special_category: string | null;
  awarded_at: string;
}
