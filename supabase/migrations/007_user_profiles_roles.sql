-- =============================================================================
-- Migration 007: User Profiles & Role System
-- =============================================================================
-- Centralne zarządzanie rolami w ekosystemie Certo.
-- Profile linkują auth.users z rolami organizacyjnymi.
--
-- Role hierarchy:
--   PLATFORM LEVEL (Fundacja Certo Governance Institute):
--     admin              — pełny dostęp do platformy
--     certo-zarzad       — Zarząd Fundacji
--     certo-izba-nadzoru — Izba Nadzorcza
--     certo-rada         — Rada Fundacji
--     certo-kolegium     — Kolegium Eksperckie
--     certo-trybunal     — Trybunał Etyczny
--     certo-centrum      — Centrum Operacyjne
--
--   OLYMPIAD TENANT LEVEL (per tenant, per function):
--     olympiad-{tenant}-coordinator    — koordynator szkolny
--     olympiad-{tenant}-jury           — juror (Certo Advisor)
--     olympiad-{tenant}-observer       — obserwator (read-only)
--     olympiad-{tenant}-auditor        — audytor (weryfikacja danych)
--
--   CONSULTING:
--     advisor            — Certo Advisor (certo.consulting)
--
-- Multiple roles per user allowed (RBAC with junction table).
-- =============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  email           TEXT,
  avatar_url      TEXT,
  locale          TEXT DEFAULT 'pl',
  country         TEXT,
  organization    TEXT,              -- free text (nie musi być w olympiad_organizations)
  bio             TEXT,
  is_active       BOOLEAN DEFAULT true,
  last_seen_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Role definitions
CREATE TABLE IF NOT EXISTS roles (
  role_id         TEXT PRIMARY KEY,  -- e.g. 'admin', 'certo-zarzad', 'olympiad-schools-coordinator'
  role_name       JSONB NOT NULL,    -- {"pl": "Administrator", "en": "Administrator"}
  role_group      TEXT NOT NULL,     -- 'platform', 'olympiad', 'consulting'
  description     JSONB,            -- {"pl": "Pełny dostęp", "en": "Full access"}
  tenant_id       TEXT,              -- NULL for platform roles, 'schools' etc. for olympiad
  permissions     JSONB DEFAULT '[]', -- ["read:all", "write:ratings", "manage:users"]
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- User ↔ Role junction (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id         TEXT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  org_id          UUID,             -- optional: role scoped to specific olympiad org
  granted_by      UUID REFERENCES user_profiles(id),
  granted_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,      -- NULL = permanent
  is_active       BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id, org_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE is_active = true;
CREATE INDEX idx_user_roles_role ON user_roles(role_id) WHERE is_active = true;
CREATE INDEX idx_user_roles_org ON user_roles(org_id) WHERE org_id IS NOT NULL AND is_active = true;
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- =============================================================================
-- Seed: Platform & Olympiad roles
-- =============================================================================

INSERT INTO roles (role_id, role_name, role_group, description, tenant_id, permissions, sort_order) VALUES
  -- Platform (Fundacja)
  ('admin',              '{"pl":"Administrator","en":"Administrator"}',                'platform', '{"pl":"Pełny dostęp do platformy","en":"Full platform access"}',                          NULL, '["*"]', 1),
  ('certo-zarzad',       '{"pl":"Zarząd Fundacji","en":"Foundation Board"}',           'platform', '{"pl":"Zarząd Certo Governance Institute","en":"Certo Governance Institute Board"}',       NULL, '["read:all","write:ratings","manage:tenants"]', 2),
  ('certo-izba-nadzoru', '{"pl":"Izba Nadzorcza","en":"Supervisory Chamber"}',         'platform', '{"pl":"Organ nadzorczy Fundacji","en":"Foundation supervisory body"}',                     NULL, '["read:all","audit:ratings"]', 3),
  ('certo-rada',         '{"pl":"Rada Fundacji","en":"Foundation Council"}',            'platform', '{"pl":"Rada doradcza Fundacji","en":"Foundation advisory council"}',                       NULL, '["read:all"]', 4),
  ('certo-kolegium',     '{"pl":"Kolegium Eksperckie","en":"Expert College"}',          'platform', '{"pl":"Ciało eksperckie ds. metodologii","en":"Expert body for methodology"}',             NULL, '["read:all","write:methodology"]', 5),
  ('certo-trybunal',     '{"pl":"Trybunał Etyczny","en":"Ethics Tribunal"}',            'platform', '{"pl":"Organ ds. etyki i odwołań","en":"Ethics and appeals body"}',                        NULL, '["read:all","adjudicate:appeals"]', 6),
  ('certo-centrum',      '{"pl":"Centrum Operacyjne","en":"Operations Center"}',        'platform', '{"pl":"Operacyjne zarządzanie platformą","en":"Platform operations management"}',          NULL, '["read:all","write:tenants","manage:olympiad"]', 7),

  -- Olympiad: Schools
  ('olympiad-schools-coordinator', '{"pl":"Koordynator szkolny","en":"School Coordinator"}',  'olympiad', '{"pl":"Koordynator Olimpiady w szkole","en":"School Olympiad Coordinator"}',  'schools', '["manage:own-org","generate:links","view:results"]', 10),
  ('olympiad-schools-jury',        '{"pl":"Juror szkolny","en":"School Jury"}',                'olympiad', '{"pl":"Juror oceniający Certo Action","en":"Jury member evaluating Certo Action"}', 'schools', '["review:actions","view:results"]', 11),
  ('olympiad-schools-observer',    '{"pl":"Obserwator","en":"Observer"}',                      'olympiad', '{"pl":"Dostęp tylko do odczytu","en":"Read-only access"}',                        'schools', '["view:results"]', 12),
  ('olympiad-schools-auditor',     '{"pl":"Audytor","en":"Auditor"}',                          'olympiad', '{"pl":"Weryfikacja danych i anomalii","en":"Data and anomaly verification"}',     'schools', '["read:all","audit:surveys","flag:anomalies"]', 13),

  -- Org Representative: verified person who approves Certo Action (per tenant)
  ('olympiad-schools-org-representative',      '{"pl":"Reprezentant podmiotu","en":"Organization Representative"}',      'olympiad', '{"pl":"Zweryfikowana osoba zatwierdzająca Certo Action i realizację kroków","en":"Verified person approving Certo Action and step completion"}', 'schools', '["approve:action","approve:steps","view:action","view:results"]', 17),
  ('olympiad-culture-org-representative',      '{"pl":"Reprezentant podmiotu OK","en":"Culture Org Representative"}',   'olympiad', '{"pl":"Zweryfikowana osoba zatwierdzająca Certo Action i realizację kroków","en":"Verified person approving Certo Action and step completion"}', 'culture', '["approve:action","approve:steps","view:action","view:results"]', 27),
  ('olympiad-social-care-org-representative',  '{"pl":"Reprezentant podmiotu DPS","en":"Social Care Org Representative"}', 'olympiad', '{"pl":"Zweryfikowana osoba zatwierdzająca Certo Action i realizację kroków","en":"Verified person approving Certo Action and step completion"}', 'social-care', '["approve:action","approve:steps","view:action","view:results"]', 37),
  ('olympiad-sports-org-representative',       '{"pl":"Reprezentant podmiotu OS","en":"Sports Org Representative"}',    'olympiad', '{"pl":"Zweryfikowana osoba zatwierdzająca Certo Action i realizację kroków","en":"Verified person approving Certo Action and step completion"}', 'sports', '["approve:action","approve:steps","view:action","view:results"]', 47),

  -- Certo Action: Team roles per tenant (schools)
  ('olympiad-schools-team-action',      '{"pl":"Członek zespołu Action","en":"Action Team Member"}',       'olympiad', '{"pl":"Członek zespołu pracującego nad Certo Action","en":"Team member working on Certo Action"}',         'schools', '["edit:action","view:action","comment:action"]', 14),
  ('olympiad-schools-expert-action',    '{"pl":"Ekspert Action","en":"Action Expert"}',                     'olympiad', '{"pl":"Zewnętrzny ekspert zaproszony do Certo Action","en":"External expert invited to Certo Action"}',   'schools', '["edit:action","view:action","comment:action","suggest:action"]', 15),
  ('olympiad-schools-obserwator-action','{"pl":"Obserwator Action","en":"Action Observer"}',                'olympiad', '{"pl":"Obserwator Certo Action (media, dyrekcja)","en":"Certo Action observer (media, director)"}',       'schools', '["view:action","comment:action"]', 16),

  -- Certo Action: Team roles per tenant (culture)
  ('olympiad-culture-team-action',      '{"pl":"Członek zespołu Action OK","en":"Culture Action Team Member"}',    'olympiad', '{"pl":"Członek zespołu pracującego nad Certo Action","en":"Team member working on Certo Action"}',   'culture', '["edit:action","view:action","comment:action"]', 24),
  ('olympiad-culture-expert-action',    '{"pl":"Ekspert Action OK","en":"Culture Action Expert"}',                  'olympiad', '{"pl":"Zewnętrzny ekspert zaproszony do Certo Action","en":"External expert invited to Certo Action"}', 'culture', '["edit:action","view:action","comment:action","suggest:action"]', 25),
  ('olympiad-culture-obserwator-action','{"pl":"Obserwator Action OK","en":"Culture Action Observer"}',             'olympiad', '{"pl":"Obserwator Certo Action (media, dyrekcja)","en":"Certo Action observer (media, director)"}', 'culture', '["view:action","comment:action"]', 26),

  -- Certo Action: Team roles per tenant (social-care)
  ('olympiad-social-care-team-action',      '{"pl":"Członek zespołu Action DPS","en":"Social Care Action Team Member"}', 'olympiad', '{"pl":"Członek zespołu pracującego nad Certo Action","en":"Team member working on Certo Action"}',   'social-care', '["edit:action","view:action","comment:action"]', 34),
  ('olympiad-social-care-expert-action',    '{"pl":"Ekspert Action DPS","en":"Social Care Action Expert"}',              'olympiad', '{"pl":"Zewnętrzny ekspert zaproszony do Certo Action","en":"External expert invited to Certo Action"}', 'social-care', '["edit:action","view:action","comment:action","suggest:action"]', 35),
  ('olympiad-social-care-obserwator-action','{"pl":"Obserwator Action DPS","en":"Social Care Action Observer"}',         'olympiad', '{"pl":"Obserwator Certo Action (media, dyrekcja)","en":"Certo Action observer (media, director)"}', 'social-care', '["view:action","comment:action"]', 36),

  -- Certo Action: Team roles per tenant (sports)
  ('olympiad-sports-team-action',      '{"pl":"Członek zespołu Action OS","en":"Sports Action Team Member"}', 'olympiad', '{"pl":"Członek zespołu pracującego nad Certo Action","en":"Team member working on Certo Action"}',   'sports', '["edit:action","view:action","comment:action"]', 44),
  ('olympiad-sports-expert-action',    '{"pl":"Ekspert Action OS","en":"Sports Action Expert"}',              'olympiad', '{"pl":"Zewnętrzny ekspert zaproszony do Certo Action","en":"External expert invited to Certo Action"}', 'sports', '["edit:action","view:action","comment:action","suggest:action"]', 45),
  ('olympiad-sports-obserwator-action','{"pl":"Obserwator Action OS","en":"Sports Action Observer"}',         'olympiad', '{"pl":"Obserwator Certo Action (media, dyrekcja)","en":"Certo Action observer (media, director)"}', 'sports', '["view:action","comment:action"]', 46),

  -- Consulting
  ('advisor',            '{"pl":"Certo Advisor","en":"Certo Advisor"}',                'consulting', '{"pl":"Akredytowany doradca Certo","en":"Accredited Certo Advisor"}',                   NULL, '["review:actions","view:ratings","consult:orgs"]', 20)

ON CONFLICT (role_id) DO NOTHING;

-- =============================================================================
-- Certo Action Team Members (collaborative work on action plans)
-- =============================================================================
CREATE TABLE IF NOT EXISTS olympiad_action_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES olympiad_organizations(org_id),
  tenant_id     TEXT NOT NULL,
  user_id       UUID REFERENCES user_profiles(id),  -- NULL for email-only invites
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('team-action', 'expert-action', 'obserwator-action')),
  invited_by    UUID REFERENCES user_profiles(id),  -- coordinator who invited
  status        TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'declined')),
  affiliation   TEXT,           -- e.g. "SP 15", "Gazeta Lokalna", "Kuratorium"
  can_edit      BOOLEAN NOT NULL DEFAULT false,  -- derived from role but explicit
  invite_token  TEXT UNIQUE,    -- one-time token for email invite
  last_active   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_action_members_org ON olympiad_action_members (org_id, tenant_id);
CREATE INDEX idx_action_members_user ON olympiad_action_members (user_id) WHERE user_id IS NOT NULL;

-- Action comments (collaborative discussion)
CREATE TABLE IF NOT EXISTS olympiad_action_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES olympiad_organizations(org_id),
  tenant_id   TEXT NOT NULL,
  author_id   UUID REFERENCES user_profiles(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,    -- team-action, expert-action, obserwator-action, coordinator
  content     TEXT NOT NULL,
  section     TEXT,             -- 'plan', 'steps', 'metrics', 'general'
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_action_comments_org ON olympiad_action_comments (org_id, created_at DESC);

-- =============================================================================
-- Identity Verification (banking / eID / document)
-- =============================================================================
CREATE TABLE IF NOT EXISTS identity_verifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES user_profiles(id),

  -- Verification method
  method            TEXT NOT NULL CHECK (method IN (
    'bank_transfer',      -- 1 gr verification transfer (MVP)
    'open_banking',       -- PSD2 / Kontomatik / similar
    'eidas_signature',    -- Autenti / qualified electronic signature
    'id_document',        -- Veriff / ID scan + selfie
    'manual'              -- Manual verification by Certo staff
  )),

  -- Status
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),

  -- Verification data (encrypted / hashed)
  verified_name     TEXT,                -- Full legal name from bank/ID
  verified_at       TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,         -- Verification validity (default 12 months)

  -- Bank transfer specifics (MVP)
  transfer_code     TEXT UNIQUE,          -- Random code for transfer title, e.g. "CERTO-A7X9K2"
  transfer_amount   INT DEFAULT 1,        -- Amount in grosz/cent (1 = 0.01 PLN/EUR)
  transfer_iban     TEXT,                  -- Certo's bank account
  transfer_received BOOLEAN DEFAULT false,

  -- Provider specifics (v2)
  provider          TEXT,                 -- 'kontomatik', 'autenti', 'veriff'
  provider_ref      TEXT,                 -- External reference ID
  provider_data     JSONB,               -- Provider-specific response (encrypted)

  -- Audit
  ip_address        TEXT,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_identity_verifications_user ON identity_verifications (user_id, status);
CREATE INDEX idx_identity_verifications_code ON identity_verifications (transfer_code) WHERE transfer_code IS NOT NULL;

-- =============================================================================
-- Certo Action Approvals (Representative approves plan + step completions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS olympiad_action_approvals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES olympiad_organizations(org_id),
  tenant_id         TEXT NOT NULL,

  -- Who approves
  representative_id UUID NOT NULL REFERENCES user_profiles(id),
  verification_id   UUID REFERENCES identity_verifications(id),  -- Link to banking verification

  -- What is approved
  approval_type     TEXT NOT NULL CHECK (approval_type IN (
    'action_plan',        -- Approve the entire Certo Action plan
    'step_completion'     -- Approve that a specific step was completed
  )),
  plan_id           TEXT,              -- Which plan (for multi-plan Certo Action)
  step_index        INT,               -- Which step (for step_completion)

  -- Decision
  decision          TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'revision_requested')),
  comment           TEXT,              -- Reason for rejection or revision request

  -- Legal weight
  legal_statement   TEXT NOT NULL DEFAULT 'Niniejszym potwierdzam, że informacje zawarte w tym zatwierdzeniu są zgodne z prawdą.',
  verified_identity BOOLEAN NOT NULL DEFAULT false,  -- true = representative identity verified via banking

  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_action_approvals_org ON olympiad_action_approvals (org_id, created_at DESC);
CREATE INDEX idx_action_approvals_rep ON olympiad_action_approvals (representative_id);

-- =============================================================================
-- Seed: assign przemekbcs@gmail.com as coordinator in demo organizations
-- (This runs on migration; in production, users register via Supabase Auth)
-- =============================================================================
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Create or find user profile for przemekbcs@gmail.com
  INSERT INTO user_profiles (id, email, display_name, avatar_url)
  VALUES (
    gen_random_uuid(),
    'przemekbcs@gmail.com',
    'Przemek BCS',
    NULL
  )
  ON CONFLICT (email) DO UPDATE SET display_name = 'Przemek BCS'
  RETURNING id INTO v_user_id;

  -- Assign coordinator role for all 4 tenants
  INSERT INTO user_roles (user_id, role_id) VALUES
    (v_user_id, 'olympiad-schools-coordinator'),
    (v_user_id, 'olympiad-culture-coordinator'),
    (v_user_id, 'olympiad-social-care-coordinator'),
    (v_user_id, 'olympiad-sports-coordinator'),
    (v_user_id, 'certo-centrum')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Assigned coordinator roles to przemekbcs@gmail.com (user_id: %)', v_user_id;
END $$;

-- =============================================================================
-- Rating History (audit trail for score changes after Certo Action)
-- =============================================================================
CREATE TABLE IF NOT EXISTS olympiad_rating_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES olympiad_organizations(org_id),
  tenant_id           TEXT NOT NULL,

  -- Before
  previous_score      INT,
  previous_level      TEXT,
  previous_pillar_scores JSONB,

  -- After
  new_score           INT NOT NULL,
  new_level           TEXT,
  new_pillar_scores   JSONB NOT NULL,
  new_vector          TEXT,

  -- Boost details
  trigger_type        TEXT NOT NULL CHECK (trigger_type IN ('survey', 'action_completion', 'advisor_review', 'manual')),
  weakest_pillar      TEXT,
  pillar_boost        INT DEFAULT 0,
  peer_review_avg     NUMERIC(3,1),
  llm_score           INT,

  -- Approval
  approval_status     TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'auto_approved', 'advisor_approved', 'college_approved', 'rejected')),
  approval_required   TEXT NOT NULL DEFAULT 'automatic' CHECK (approval_required IN ('automatic', 'advisor', 'expert-college')),
  approved_by         UUID REFERENCES user_profiles(id),
  approval_note       TEXT,
  approved_at         TIMESTAMPTZ,

  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rating_history_org ON olympiad_rating_history (org_id, created_at DESC);
CREATE INDEX idx_rating_history_pending ON olympiad_rating_history (approval_status) WHERE approval_status = 'pending';

-- =============================================================================
-- RLS Policies
-- =============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Roles: everyone can read
CREATE POLICY roles_read ON roles FOR SELECT USING (true);

-- Profiles: users can read all, but update only own
CREATE POLICY profiles_read ON user_profiles FOR SELECT USING (true);
CREATE POLICY profiles_update_own ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: users see own roles, admins see all
CREATE POLICY user_roles_read_own ON user_roles FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY user_roles_read_admin ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN ('admin', 'certo-zarzad', 'certo-centrum')
        AND ur.is_active = true
    )
  );
-- Only admins can grant roles
CREATE POLICY user_roles_insert_admin ON user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN ('admin', 'certo-zarzad', 'certo-centrum')
        AND ur.is_active = true
    )
  );

-- Service role bypasses RLS
CREATE POLICY profiles_service ON user_profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY user_roles_service ON user_roles FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- Trigger: auto-create profile on auth.users insert
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- Helper: check if user has role (for use in other RLS policies)
-- =============================================================================

CREATE OR REPLACE FUNCTION user_has_role(check_role_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role_id = check_role_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_has_any_role(check_role_ids TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role_id = ANY(check_role_ids)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get all roles for current user
CREATE OR REPLACE FUNCTION get_my_roles()
RETURNS TABLE(role_id TEXT, role_name JSONB, role_group TEXT, org_id UUID) AS $$
  SELECT r.role_id, r.role_name, r.role_group, ur.org_id
  FROM user_roles ur
  JOIN roles r ON r.role_id = ur.role_id
  WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$ LANGUAGE sql SECURITY DEFINER STABLE;
