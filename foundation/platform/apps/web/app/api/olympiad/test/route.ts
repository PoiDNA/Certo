import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";

/**
 * GET /api/olympiad/test?tenant_id=schools&num=10&locale=pl
 *
 * Returns knowledge test questions.
 * Tries Knowledge Graph (migration 005) first, falls back to static questions.
 *
 * POST /api/olympiad/test
 * Submit test results: { org_id, tenant_id, score, passed }
 */

const STATIC_QUESTIONS: Record<string, { text: Record<string, string>; options: Record<string, string[]>; correct: number }[]> = {
  schools: [
    {
      text: { pl: "Co oznacza termin 'governance' w kontekście szkoły?", en: "What does 'governance' mean in a school context?" },
      options: { pl: ["Zarządzanie budżetem", "Jakość zarządzania i podejmowania decyzji", "System oceniania uczniów", "Rekrutacja nauczycieli"], en: ["Budget management", "Quality of management and decision-making", "Student grading system", "Teacher recruitment"] },
      correct: 1,
    },
    {
      text: { pl: "Który z poniższych NIE jest filarem Certo Score?", en: "Which of the following is NOT a Certo Score pillar?" },
      options: { pl: ["Dyscyplina operacyjna", "Relacje z interesariuszami", "Wyniki egzaminów", "Indeks transparentności"], en: ["Operational discipline", "Stakeholder relations", "Exam results", "Transparency index"] },
      correct: 2,
    },
    {
      text: { pl: "Co oznacza 'comply or explain' w Olimpiadzie Certo?", en: "What does 'comply or explain' mean in the Certo Olympiad?" },
      options: { pl: ["Obowiązek spełnienia wszystkich wymagań", "Spełnij wymóg lub wyjaśnij dlaczego nie", "Kara za niespełnienie progów", "Obowiązek raportowania do ministerstwa"], en: ["Obligation to meet all requirements", "Meet the requirement or explain why not", "Penalty for not meeting thresholds", "Obligation to report to the ministry"] },
      correct: 1,
    },
    {
      text: { pl: "Czym jest Certo Action?", en: "What is a Certo Action?" },
      options: { pl: ["Kara za niski wynik", "Konkretny plan poprawy governance", "Audyt zewnętrzny szkoły", "Test wiedzy dla uczniów"], en: ["Penalty for low score", "Concrete governance improvement plan", "External school audit", "Knowledge test for students"] },
      correct: 1,
    },
    {
      text: { pl: "Jaka jest rola samorządu uczniowskiego w governance?", en: "What is the role of the student council in governance?" },
      options: { pl: ["Brak roli — decyzje podejmuje dyrekcja", "Reprezentacja głosu uczniów w procesie decyzyjnym", "Organizacja imprez szkolnych", "Kontrola budżetu szkoły"], en: ["No role — decisions are made by leadership", "Representing students' voice in decision-making", "Organizing school events", "Controlling the school budget"] },
      correct: 1,
    },
    {
      text: { pl: "Co mierzy 'Indeks Transparentności'?", en: "What does the 'Transparency Index' measure?" },
      options: { pl: ["Średnią ocen uczniów", "Otwartość komunikacji i dostępność informacji", "Liczbę spotkań rady pedagogicznej", "Budżet szkoły per uczeń"], en: ["Average student grades", "Openness of communication and information availability", "Number of staff meetings", "School budget per student"] },
      correct: 1,
    },
    {
      text: { pl: "Kto może otrzymać Diament Certo?", en: "Who can receive a Diament Certo?" },
      options: { pl: ["Tylko najlepsza szkoła w kraju", "Każda organizacja z Certo Score 90+", "Tylko szkoły z dużych miast", "Wyłącznie szkoły prywatne"], en: ["Only the best school in the country", "Any organization with Certo Score 90+", "Only schools from big cities", "Only private schools"] },
      correct: 1,
    },
    {
      text: { pl: "Czym jest peer-review w Olimpiadzie Certo?", en: "What is peer review in the Certo Olympiad?" },
      options: { pl: ["Ocena szkoły przez inspektora", "Wzajemna anonimowa ocena planów między organizacjami", "Test wiedzy dla nauczycieli", "Ocena szkoły przez rodziców"], en: ["School evaluation by an inspector", "Anonymous mutual evaluation of plans between organizations", "Knowledge test for teachers", "School evaluation by parents"] },
      correct: 1,
    },
    {
      text: { pl: "Co oznacza 'stabilność strukturalna' w organizacji?", en: "What does 'structural stability' mean in an organization?" },
      options: { pl: ["Brak remontów budynku", "Przewidywalność kadry, budżetu i planowania", "Stały plan lekcji", "Niezmienne regulaminy"], en: ["No building renovations", "Predictability of staff, budget and planning", "Fixed lesson schedule", "Unchanged regulations"] },
      correct: 1,
    },
    {
      text: { pl: "Dlaczego Olimpiada Certo nie wyłania jednego zwycięzcy?", en: "Why doesn't the Certo Olympiad select a single winner?" },
      options: { pl: ["Bo to za drogie", "Bo governance to standard do osiągnięcia, nie wyścig", "Bo szkoły nie lubią rywalizacji", "Bo jury nie może się zdecydować"], en: ["Because it's too expensive", "Because governance is a standard to achieve, not a race", "Because schools don't like competition", "Because the jury can't decide"] },
      correct: 1,
    },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenant_id") || "schools";
  const num = parseInt(searchParams.get("num") || "10", 10);
  const locale = searchParams.get("locale") || "pl";

  // Try Knowledge Graph first
  const supabase = getOlympiadSupabase();
  if (supabase) {
    try {
      const { data: concepts } = await supabase
        .from("knowledge_graph_concepts")
        .select("id, name, definition, concept_type")
        .eq("concept_type", "principle")
        .limit(num);

      if (concepts && concepts.length >= num) {
        // Transform Knowledge Graph concepts into test questions
        // This is a simplified mapping — in production, use a dedicated questions table
        return NextResponse.json({
          source: "knowledge_graph",
          questions: concepts.slice(0, num),
          message: "Knowledge Graph questions loaded",
        });
      }
    } catch {
      // Fall through to static
    }
  }

  // Fallback: static questions
  const questions = (STATIC_QUESTIONS[tenantId] || STATIC_QUESTIONS.schools).slice(0, num);

  return NextResponse.json({
    source: "static",
    questions: questions.map((q) => ({
      text: q.text[locale] || q.text.pl,
      options: q.options[locale] || q.options.pl,
      correct: q.correct,
    })),
  });
}

export async function POST(req: NextRequest) {
  const supabase = getOlympiadSupabase();
  const body = await req.json();
  const { org_id, tenant_id, score, passed } = body;

  if (supabase && org_id) {
    const { error } = await supabase.from("olympiad_test_scores").upsert(
      { org_id, tenant_id: tenant_id || "schools", score, passed },
      { onConflict: "org_id" }
    );
    if (error) console.error("[Test] Save error:", error);
  }

  return NextResponse.json({ success: true, score, passed });
}
