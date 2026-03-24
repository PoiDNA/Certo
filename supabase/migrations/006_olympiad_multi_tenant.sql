-- =============================================================================
-- Migration 006: Olimpiada Certo — Multi-Tenant Architecture
-- =============================================================================
-- Platform for governance rating olympiad. Schools are the first tenant,
-- but the architecture supports any organization type (culture centers,
-- social care, sports centers, etc.) via JSONB TenantConfig.
-- =============================================================================

-- Tenant definitions (JSONB-first: config is the single source of truth)
CREATE TABLE IF NOT EXISTS olympiad_tenants (
  tenant_id   TEXT PRIMARY KEY,
  tenant_slug TEXT UNIQUE NOT NULL,
  tenant_name JSONB NOT NULL,
  is_active   BOOLEAN DEFAULT false,
  config      JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Organizations participating in the olympiad
CREATE TABLE IF NOT EXISTS olympiad_organizations (
  org_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             TEXT REFERENCES olympiad_tenants(tenant_id) NOT NULL,
  org_name              TEXT NOT NULL,
  country               TEXT NOT NULL,
  municipality          TEXT,
  coordinator_id        UUID,
  team_members          UUID[] DEFAULT '{}',
  declared_population   JSONB,
  director_declaration  TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_olympiad_orgs_tenant
  ON olympiad_organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_olympiad_orgs_country
  ON olympiad_organizations(tenant_id, country);

-- Cohort links (1 link = 1 class/group, with usage limit)
CREATE TABLE IF NOT EXISTS olympiad_cohort_links (
  link_hash         TEXT PRIMARY KEY,
  org_id            UUID REFERENCES olympiad_organizations(org_id) NOT NULL,
  tenant_id         TEXT NOT NULL,
  group_id          TEXT NOT NULL,
  cohort_name       TEXT,
  max_uses          INT NOT NULL,
  current_uses      INT DEFAULT 0,
  expires_at        TIMESTAMPTZ,
  whatsapp_msg      JSONB,
  velocity_anomaly  BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cohort_links_org
  ON olympiad_cohort_links(org_id);

-- QR cards (individual one-time links, generated in PDF batches)
CREATE TABLE IF NOT EXISTS olympiad_qr_cards (
  card_hash     TEXT PRIMARY KEY,
  cohort_link   TEXT REFERENCES olympiad_cohort_links(link_hash),
  is_used       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Live Session QR + PIN (for in-person meetings)
CREATE TABLE IF NOT EXISTS olympiad_live_sessions (
  session_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES olympiad_organizations(org_id) NOT NULL,
  tenant_id       TEXT NOT NULL,
  session_qr_hash TEXT NOT NULL,
  session_pin     TEXT NOT NULL,
  pin_expires_at  TIMESTAMPTZ NOT NULL,
  event_name      TEXT,
  max_uses        INT NOT NULL,
  current_uses    INT DEFAULT 0,
  ttl_minutes     INT DEFAULT 15,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Survey responses (anonymized, emoji_3_scale weighted)
CREATE TABLE IF NOT EXISTS olympiad_survey_responses (
  response_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL,
  tenant_id           TEXT NOT NULL,
  group_id            TEXT NOT NULL,
  pillar_scores       JSONB NOT NULL,
  open_text_sentiment TEXT,
  fingerprint_hash    TEXT,
  behavioral_score    INT,
  anomaly_flags       TEXT[] DEFAULT '{}',
  submitted_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_org
  ON olympiad_survey_responses(org_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_group
  ON olympiad_survey_responses(org_id, group_id);

-- Organization ratings (auto-calculated, no peer-review in Phase I)
CREATE TABLE IF NOT EXISTS olympiad_org_ratings (
  org_id                  UUID PRIMARY KEY REFERENCES olympiad_organizations(org_id),
  tenant_id               TEXT NOT NULL,
  pillar_scores           JSONB NOT NULL,
  certo_score             INT NOT NULL,
  certo_vector            TEXT,
  participation_rates     JSONB,
  community_bonus         INT DEFAULT 0,
  comply_or_explain       TEXT,
  k_anonymity_suppressed  INT DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- Team knowledge test scores (1 score per Zespół Certo)
CREATE TABLE IF NOT EXISTS olympiad_test_scores (
  org_id        UUID PRIMARY KEY REFERENCES olympiad_organizations(org_id),
  tenant_id     TEXT NOT NULL,
  score         INT,
  passed        BOOLEAN,
  submitted_at  TIMESTAMPTZ DEFAULT now()
);

-- Certo Action projects (with templates + LLM feedback)
CREATE TABLE IF NOT EXISTS olympiad_actions (
  org_id              UUID PRIMARY KEY REFERENCES olympiad_organizations(org_id),
  tenant_id           TEXT NOT NULL,
  weakest_pillar      TEXT,
  template_used       TEXT,
  what_to_change      TEXT,
  steps               TEXT[] DEFAULT '{}',
  success_metrics     TEXT[] DEFAULT '{}',
  director_consulted  BOOLEAN DEFAULT false,
  peer_review_avg     INT,
  llm_prefilter_score INT,
  llm_feedback_reason TEXT,
  expert_score        INT,
  jury_advisor_id     UUID,
  submitted_at        TIMESTAMPTZ DEFAULT now()
);

-- Peer-reviews (Phase III only, Ring Topology, scale 1-5)
CREATE TABLE IF NOT EXISTS olympiad_peer_reviews (
  review_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_org_id   UUID NOT NULL,
  target_org_id     UUID NOT NULL,
  tenant_id         TEXT NOT NULL,
  country           TEXT NOT NULL,
  checklist_scores  JSONB NOT NULL,
  total_score       INT NOT NULL,
  ring_position     INT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_peer_reviews_score
  ON olympiad_peer_reviews(tenant_id, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_target
  ON olympiad_peer_reviews(target_org_id);

-- Achievements (Bronze/Silver/Gold/Diament)
CREATE TABLE IF NOT EXISTS olympiad_achievements (
  org_id            UUID PRIMARY KEY REFERENCES olympiad_organizations(org_id),
  tenant_id         TEXT NOT NULL,
  level             TEXT NOT NULL,
  special_category  TEXT,
  awarded_at        TIMESTAMPTZ DEFAULT now()
);

-- Certo Action templates per pillar per tenant
CREATE TABLE IF NOT EXISTS olympiad_action_templates (
  template_id     TEXT PRIMARY KEY,
  tenant_id       TEXT REFERENCES olympiad_tenants(tenant_id) NOT NULL,
  pillar_id       TEXT NOT NULL,
  title           JSONB NOT NULL,
  description     JSONB NOT NULL,
  default_steps   JSONB NOT NULL,
  default_metrics JSONB NOT NULL,
  sort_order      INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_action_templates_tenant_pillar
  ON olympiad_action_templates(tenant_id, pillar_id);

-- =============================================================================
-- RLS Policies (public read for active tenants, service role for writes)
-- =============================================================================

ALTER TABLE olympiad_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_cohort_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_qr_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_org_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_action_templates ENABLE ROW LEVEL SECURITY;

-- Public read for active tenants
CREATE POLICY "olympiad_tenants_public_read" ON olympiad_tenants
  FOR SELECT USING (is_active = true);

-- Public read for ratings and achievements (results are public)
CREATE POLICY "olympiad_ratings_public_read" ON olympiad_org_ratings
  FOR SELECT USING (true);
CREATE POLICY "olympiad_achievements_public_read" ON olympiad_achievements
  FOR SELECT USING (true);
CREATE POLICY "olympiad_templates_public_read" ON olympiad_action_templates
  FOR SELECT USING (true);

-- Service role handles all writes (via Next.js Server Actions with Turnstile)
-- No direct client-side writes to any olympiad table

-- =============================================================================
-- Seed: Schools tenant (first tenant for pilot)
-- =============================================================================

INSERT INTO olympiad_tenants (tenant_id, tenant_slug, tenant_name, is_active, config)
VALUES (
  'schools',
  'schools',
  '{"pl": "Szkoły", "en": "Schools", "de": "Schulen", "fr": "Écoles"}'::jsonb,
  true,
  '{
    "tenant_id": "schools",
    "tenant_name": {"pl": "Szkoły", "en": "Schools"},
    "tenant_slug": "schools",
    "custom_domains": [],
    "team_alias": {"pl": "Rada Olimpijska", "en": "Olympiad Council"},
    "survey_groups": [
      {"group_id": "students", "name": {"pl": "Uczniowie", "en": "Students"}, "min_age": 13},
      {"group_id": "teachers", "name": {"pl": "Nauczyciele", "en": "Teachers"}},
      {"group_id": "parents", "name": {"pl": "Rodzice", "en": "Parents"}},
      {"group_id": "staff", "name": {"pl": "Pracownicy", "en": "Staff"}}
    ],
    "thresholds": {
      "students": {"min_pct": 40, "bonus_pct": 60, "scale_down_above": 800},
      "teachers": {"min_pct": 30, "bonus_pct": 50},
      "parents": {"min_pct": 15, "bonus_pct": 30},
      "staff": {"min_pct": 20, "bonus_pct": 40}
    },
    "micro_org_fallback": 50,
    "population": {"required_groups": ["students", "teachers", "parents"], "director_signature": true, "tolerance_pct": 5},
    "pillars": [
      {"id": "operational", "name": {"pl": "Dyscyplina operacyjna"}, "friendly_name": {"pl": "Jasne zasady"}, "weight": 25},
      {"id": "stakeholders", "name": {"pl": "Relacje z interesariuszami"}, "friendly_name": {"pl": "Współpraca"}, "weight": 25},
      {"id": "decisions", "name": {"pl": "Zarządzanie decyzjami"}, "friendly_name": {"pl": "Sprawiedliwe decyzje"}, "weight": 20},
      {"id": "stability", "name": {"pl": "Stabilność strukturalna"}, "friendly_name": {"pl": "Stałość i pewność"}, "weight": 15},
      {"id": "transparency", "name": {"pl": "Indeks transparentności"}, "friendly_name": {"pl": "Otwartość"}, "weight": 15}
    ],
    "workshop": {"title": {"pl": "Governance w naszej szkole"}, "duration_min": 5, "card_questions": 5},
    "knowledge_test": {"duration_min": 20, "num_questions": 10, "passing_pct": 60, "mode": "team"},
    "action_form": {"max_steps": 5, "max_words": 500, "auto_topic_on_low_participation": true},
    "action_templates_per_pillar": 3,
    "coordinator_track": {"mode": "micro_learning", "certificate": {"pl": "Certo Educator", "en": "Certo Educator"}}
  }'::jsonb
) ON CONFLICT (tenant_id) DO NOTHING;

-- Seed: Action templates for schools (3 per pillar)
INSERT INTO olympiad_action_templates (template_id, tenant_id, pillar_id, title, description, default_steps, default_metrics, sort_order)
VALUES
  ('schools-transparency-1', 'schools', 'transparency',
   '{"pl": "Publikacja budżetu na stronie", "en": "Publish budget on website"}'::jsonb,
   '{"pl": "Opublikuj budżet komitetu rodzicielskiego i wydatki szkoły na stronie internetowej", "en": "Publish parent committee budget and school expenses on the website"}'::jsonb,
   '["Zebranie danych budżetowych", "Przygotowanie czytelnego zestawienia", "Publikacja na stronie szkoły", "Powiadomienie rodziców"]'::jsonb,
   '["Liczba odwiedzin strony z budżetem", "% rodziców świadomych publikacji"]'::jsonb, 1),

  ('schools-transparency-2', 'schools', 'transparency',
   '{"pl": "Newsletter dla rodziców", "en": "Parent newsletter"}'::jsonb,
   '{"pl": "Uruchomienie comiesięcznego newslettera z informacjami o życiu szkoły", "en": "Launch a monthly newsletter with school life updates"}'::jsonb,
   '["Utworzenie listy mailingowej", "Przygotowanie szablonu", "Wydanie pierwszego numeru", "Zebranie opinii"]'::jsonb,
   '["Liczba subskrybentów", "Open rate newslettera"]'::jsonb, 2),

  ('schools-transparency-3', 'schools', 'transparency',
   '{"pl": "Dzień otwarty z dyrekcją", "en": "Open day with management"}'::jsonb,
   '{"pl": "Organizacja kwartalnego dnia otwartego, na którym dyrekcja odpowiada na pytania rodziców", "en": "Organize a quarterly open day where management answers parent questions"}'::jsonb,
   '["Ustalenie terminu", "Komunikacja do rodziców", "Przygotowanie sali i agendy", "Zebranie feedbacku po spotkaniu"]'::jsonb,
   '["Liczba uczestników", "Ocena spotkania przez rodziców"]'::jsonb, 3),

  ('schools-stakeholders-1', 'schools', 'stakeholders',
   '{"pl": "Aktywizacja samorządu uczniowskiego", "en": "Student council activation"}'::jsonb,
   '{"pl": "Wzmocnienie roli samorządu uczniowskiego w podejmowaniu decyzji szkolnych", "en": "Strengthen the role of student council in school decision-making"}'::jsonb,
   '["Spotkanie z samorządem", "Ustalenie obszarów współdecydowania", "Wdrożenie mechanizmu konsultacji", "Raport po kwartale"]'::jsonb,
   '["Liczba decyzji konsultowanych z samorządem", "Ocena samorządu przez uczniów"]'::jsonb, 1),

  ('schools-stakeholders-2', 'schools', 'stakeholders',
   '{"pl": "Forum rodziców", "en": "Parent forum"}'::jsonb,
   '{"pl": "Utworzenie regularnego forum, na którym rodzice mogą zgłaszać pomysły i problemy", "en": "Create a regular forum where parents can submit ideas and report problems"}'::jsonb,
   '["Wybór formy (online/stacjonarne)", "Ogłoszenie pierwszego spotkania", "Zebranie tematów", "Podsumowanie i działania"]'::jsonb,
   '["Liczba aktywnych rodziców", "Liczba wdrożonych pomysłów"]'::jsonb, 2),

  ('schools-stakeholders-3', 'schools', 'stakeholders',
   '{"pl": "Program mentorski: starsi uczniowie dla młodszych", "en": "Mentoring program: older students for younger"}'::jsonb,
   '{"pl": "Stworzenie programu, w którym uczniowie starszych klas pomagają młodszym w adaptacji", "en": "Create a program where older students help younger ones adapt"}'::jsonb,
   '["Rekrutacja mentorów", "Szkolenie", "Dobór par mentor-uczeń", "Ewaluacja po semestrze"]'::jsonb,
   '["Liczba par mentorskich", "Ocena programu przez uczestników"]'::jsonb, 3),

  ('schools-operational-1', 'schools', 'operational',
   '{"pl": "Mapa procedur szkolnych", "en": "School procedures map"}'::jsonb,
   '{"pl": "Stworzenie przejrzystej mapy procedur dostępnej dla wszystkich pracowników i rodziców", "en": "Create a clear procedures map accessible to all staff and parents"}'::jsonb,
   '["Inwentaryzacja istniejących procedur", "Wizualizacja (schemat/infografika)", "Publikacja", "Szkolenie kadry"]'::jsonb,
   '["% pracowników znających procedury", "Czas reakcji na typowe sytuacje"]'::jsonb, 1),

  ('schools-decisions-1', 'schools', 'decisions',
   '{"pl": "Protokoły decyzji online", "en": "Online decision protocols"}'::jsonb,
   '{"pl": "Publikacja protokołów z zebrań rady pedagogicznej w uproszczonej formie", "en": "Publish simplified minutes from staff meetings"}'::jsonb,
   '["Ustalenie formatu", "Wyznaczenie odpowiedzialnej osoby", "Publikacja pierwszego protokołu", "Zebranie opinii"]'::jsonb,
   '["Regularność publikacji", "Liczba czytelników"]'::jsonb, 1),

  ('schools-stability-1', 'schools', 'stability',
   '{"pl": "Plan rozwoju kadry", "en": "Staff development plan"}'::jsonb,
   '{"pl": "Opracowanie rocznego planu szkoleń i rozwoju zawodowego dla kadry", "en": "Develop an annual training and professional development plan for staff"}'::jsonb,
   '["Ankieta potrzeb szkoleniowych", "Budżetowanie", "Harmonogram szkoleń", "Ewaluacja"]'::jsonb,
   '["Liczba zrealizowanych szkoleń", "Ocena przez uczestników"]'::jsonb, 1)
ON CONFLICT (template_id) DO NOTHING;
