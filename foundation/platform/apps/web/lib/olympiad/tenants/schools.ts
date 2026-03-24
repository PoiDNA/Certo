import type { TenantConfig } from "../types";

export const schoolsTenantConfig: TenantConfig = {
  tenant_id: "schools",
  tenant_name: {
    pl: "Szkoły",
    en: "Schools",
    de: "Schulen",
    fr: "Écoles",
    es: "Escuelas",
    it: "Scuole",
  },
  tenant_slug: "schools",
  custom_domains: [],
  team_alias: {
    pl: "Rada Olimpijska",
    en: "Olympiad Council",
    de: "Olympiade-Rat",
    fr: "Conseil Olympiade",
  },

  survey_groups: [
    {
      group_id: "students",
      name: { pl: "Uczniowie", en: "Students", de: "Schüler" },
      min_age: 13,
    },
    {
      group_id: "teachers",
      name: { pl: "Nauczyciele", en: "Teachers", de: "Lehrkräfte" },
    },
    {
      group_id: "parents",
      name: { pl: "Rodzice", en: "Parents", de: "Eltern" },
    },
    {
      group_id: "staff",
      name: {
        pl: "Pracownicy niepedagogiczni",
        en: "Non-teaching staff",
        de: "Nicht-pädagogisches Personal",
      },
    },
  ],

  surveys: {
    parents: {
      max_questions: 6,
      max_duration_sec: 60,
      response_type: "emoji_3_scale",
      audio_tts: "static_mp3",
      questions: [
        {
          text: {
            pl: "Czy wiesz, jak szkoła wydaje pieniądze z komitetu rodzicielskiego?",
            en: "Do you know how the school spends parent committee funds?",
          },
          type: "emoji_3_scale",
          pillar: "transparency",
        },
        {
          text: {
            pl: "Czy łatwo jest Ci znaleźć informacje o kryteriach oceniania Twojego dziecka?",
            en: "Is it easy for you to find information about your child's grading criteria?",
          },
          type: "emoji_3_scale",
          pillar: "transparency",
        },
        {
          text: {
            pl: "Czy czujesz, że szkoła słucha opinii rodziców?",
            en: "Do you feel the school listens to parents' opinions?",
          },
          type: "emoji_3_scale",
          pillar: "stakeholders",
        },
        {
          text: {
            pl: "Czy wiesz, do kogo się zwrócić, gdy masz problem ze szkołą?",
            en: "Do you know who to contact when you have a problem with the school?",
          },
          type: "emoji_3_scale",
          pillar: "operational",
        },
        {
          text: {
            pl: "Czy szkoła informuje Cię z wyprzedzeniem o ważnych zmianach?",
            en: "Does the school inform you in advance about important changes?",
          },
          type: "emoji_3_scale",
          pillar: "decisions",
        },
        {
          text: {
            pl: "Czy uważasz, że szkoła jest stabilna i dobrze zorganizowana?",
            en: "Do you think the school is stable and well-organized?",
          },
          type: "emoji_3_scale",
          pillar: "stability",
        },
      ],
    },
    students: {
      max_questions: 6,
      max_duration_sec: 60,
      response_type: "emoji_3_scale",
      audio_tts: "static_mp3",
      questions: [
        {
          text: {
            pl: "Czy wiesz, jak podejmowane są decyzje w Twojej szkole?",
            en: "Do you know how decisions are made in your school?",
          },
          type: "emoji_3_scale",
          pillar: "decisions",
        },
        {
          text: {
            pl: "Czy samorząd uczniowski ma realny wpływ na życie szkoły?",
            en: "Does the student council have real influence on school life?",
          },
          type: "emoji_3_scale",
          pillar: "stakeholders",
        },
        {
          text: {
            pl: "Czy zasady w szkole są jasne i sprawiedliwe?",
            en: "Are the rules in your school clear and fair?",
          },
          type: "emoji_3_scale",
          pillar: "operational",
        },
        {
          text: {
            pl: "Czy czujesz się bezpiecznie w szkole?",
            en: "Do you feel safe at school?",
          },
          type: "emoji_3_scale",
          pillar: "stability",
        },
        {
          text: {
            pl: "Czy szkoła informuje Was o tym, co się zmienia?",
            en: "Does the school inform you about changes?",
          },
          type: "emoji_3_scale",
          pillar: "transparency",
        },
        {
          text: {
            pl: "Czy możesz zgłosić problem i ktoś się nim zajmie?",
            en: "Can you report a problem and someone will take care of it?",
          },
          type: "emoji_3_scale",
          pillar: "stakeholders",
        },
      ],
    },
    teachers: {
      max_questions: 6,
      max_duration_sec: 90,
      response_type: "emoji_3_scale",
      audio_tts: "none",
      questions: [
        {
          text: {
            pl: "Czy procedury w szkole są jasne i przestrzegane?",
            en: "Are school procedures clear and followed?",
          },
          type: "emoji_3_scale",
          pillar: "operational",
        },
        {
          text: {
            pl: "Czy dyrekcja konsultuje z kadrą ważne decyzje?",
            en: "Does the management consult staff on important decisions?",
          },
          type: "emoji_3_scale",
          pillar: "decisions",
        },
        {
          text: {
            pl: "Czy komunikacja wewnętrzna działa dobrze?",
            en: "Does internal communication work well?",
          },
          type: "emoji_3_scale",
          pillar: "transparency",
        },
        {
          text: {
            pl: "Czy czujesz stabilność zatrudnienia i warunków pracy?",
            en: "Do you feel stability in employment and working conditions?",
          },
          type: "emoji_3_scale",
          pillar: "stability",
        },
        {
          text: {
            pl: "Czy szkoła dobrze współpracuje z rodzicami?",
            en: "Does the school cooperate well with parents?",
          },
          type: "emoji_3_scale",
          pillar: "stakeholders",
        },
        {
          text: {
            pl: "Czy budżet szkoły jest zarządzany przejrzyście?",
            en: "Is the school budget managed transparently?",
          },
          type: "emoji_3_scale",
          pillar: "transparency",
        },
      ],
    },
    staff: {
      max_questions: 5,
      max_duration_sec: 60,
      response_type: "emoji_3_scale",
      audio_tts: "static_mp3",
      questions: [
        {
          text: {
            pl: "Czy Twoje obowiązki są jasno określone?",
            en: "Are your responsibilities clearly defined?",
          },
          type: "emoji_3_scale",
          pillar: "operational",
        },
        {
          text: {
            pl: "Czy czujesz się bezpiecznie w miejscu pracy?",
            en: "Do you feel safe at your workplace?",
          },
          type: "emoji_3_scale",
          pillar: "stability",
        },
        {
          text: {
            pl: "Czy dyrekcja informuje Cię o zmianach, które Cię dotyczą?",
            en: "Does the management inform you about changes that affect you?",
          },
          type: "emoji_3_scale",
          pillar: "transparency",
        },
        {
          text: {
            pl: "Czy możesz zgłosić problem i ktoś się nim zajmie?",
            en: "Can you report a problem and someone will handle it?",
          },
          type: "emoji_3_scale",
          pillar: "stakeholders",
        },
        {
          text: {
            pl: "Czy szkoła jest dobrze zorganizowana na co dzień?",
            en: "Is the school well-organized on a daily basis?",
          },
          type: "emoji_3_scale",
          pillar: "decisions",
        },
      ],
    },
  },

  thresholds: {
    students: { min_pct: 40, bonus_pct: 60, scale_down_above: 800 },
    teachers: { min_pct: 30, bonus_pct: 50 },
    parents: { min_pct: 15, bonus_pct: 30 },
    staff: { min_pct: 20, bonus_pct: 40 },
  },
  micro_org_fallback: 50,

  population: {
    required_groups: ["students", "teachers", "parents"],
    director_signature: true,
    tolerance_pct: 5,
  },

  pillars: [
    {
      id: "operational",
      name: { pl: "Dyscyplina operacyjna", en: "Operational Discipline" },
      friendly_name: { pl: "Jasne zasady", en: "Clear rules" },
      weight: 25,
    },
    {
      id: "stakeholders",
      name: {
        pl: "Relacje z interesariuszami",
        en: "Stakeholder Relations",
      },
      friendly_name: { pl: "Współpraca", en: "Cooperation" },
      weight: 25,
    },
    {
      id: "decisions",
      name: { pl: "Zarządzanie decyzjami", en: "Decision Governance" },
      friendly_name: {
        pl: "Sprawiedliwe decyzje",
        en: "Fair decisions",
      },
      weight: 20,
    },
    {
      id: "stability",
      name: { pl: "Stabilność strukturalna", en: "Structural Stability" },
      friendly_name: { pl: "Stałość i pewność", en: "Stability" },
      weight: 15,
    },
    {
      id: "transparency",
      name: { pl: "Indeks transparentności", en: "Transparency Index" },
      friendly_name: { pl: "Otwartość", en: "Openness" },
      weight: 15,
    },
  ],

  workshop: {
    title: {
      pl: "Governance w naszej szkole",
      en: "Governance in our school",
    },
    duration_min: 5,
    card_questions: 5,
  },

  knowledge_test: {
    duration_min: 20,
    num_questions: 10,
    passing_pct: 60,
    mode: "team",
    question_tags: ["governance", "ethics", "education"],
  },

  action_form: {
    max_steps: 5,
    max_words: 500,
    auto_topic_on_low_participation: true,
  },
  action_templates_per_pillar: 3,

  coordinator_track: {
    mode: "micro_learning",
    certificate: { pl: "Certo Educator", en: "Certo Educator" },
  },
};
