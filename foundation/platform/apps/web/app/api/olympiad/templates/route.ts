import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";

// Fallback templates (used when Supabase unavailable)
const STATIC_TEMPLATES = [
  // Transparency
  {
    template_id: "transp-budget",
    tenant_id: "schools",
    pillar_id: "transparency",
    title: { pl: "Publikacja budżetu na stronie", en: "Publish the budget on the website" },
    description: { pl: "Udostępnij informacje o wydatkach szkolnych na stronie WWW szkoły", en: "Share information about school spending on the school website" },
    default_steps: { pl: ["Zebranie danych o budżecie", "Przygotowanie czytelnego zestawienia", "Publikacja na stronie szkoły", "Informacja dla rodziców o dostępności"], en: ["Collect budget data", "Prepare clear summary", "Publish on school website", "Notify parents about availability"] },
    default_metrics: { pl: ["Liczba odwiedzin strony z budżetem", "Ankieta satysfakcji rodziców"], en: ["Page visits on budget page", "Parent satisfaction survey"] },
    sort_order: 1,
  },
  {
    template_id: "transp-newsletter",
    tenant_id: "schools",
    pillar_id: "transparency",
    title: { pl: "Newsletter dla rodziców", en: "Parent newsletter" },
    description: { pl: "Regularny biuletyn informacyjny o decyzjach i wydarzeniach w szkole", en: "Regular newsletter about decisions and events in the school" },
    default_steps: { pl: ["Ustalenie częstotliwości (np. co 2 tygodnie)", "Wyznaczenie redaktora", "Pierwszy numer testowy", "Zbieranie feedbacku"], en: ["Set frequency (e.g. every 2 weeks)", "Appoint editor", "First test issue", "Collect feedback"] },
    default_metrics: { pl: ["Liczba subskrybentów", "Open rate newslettera"], en: ["Number of subscribers", "Newsletter open rate"] },
    sort_order: 2,
  },
  {
    template_id: "transp-openday",
    tenant_id: "schools",
    pillar_id: "transparency",
    title: { pl: "Dzień otwarty z dyrekcją", en: "Open day with school leadership" },
    description: { pl: "Regularne spotkania otwarte dyrekcji z rodzicami i uczniami", en: "Regular open meetings of leadership with parents and students" },
    default_steps: { pl: ["Ustalenie terminu (np. raz w miesiącu)", "Przygotowanie agendy", "Promocja wśród rodziców", "Przeprowadzenie spotkania", "Podsumowanie i publikacja notatki"], en: ["Set date (e.g. once a month)", "Prepare agenda", "Promote to parents", "Conduct meeting", "Summary and publish notes"] },
    default_metrics: { pl: ["Liczba uczestników", "Liczba pytań zadanych na spotkaniu"], en: ["Number of attendees", "Number of questions asked"] },
    sort_order: 3,
  },
  // Stakeholders
  {
    template_id: "stake-council",
    tenant_id: "schools",
    pillar_id: "stakeholders",
    title: { pl: "Aktywizacja samorządu uczniowskiego", en: "Student council activation" },
    description: { pl: "Wzmocnienie roli samorządu uczniowskiego w decyzjach szkolnych", en: "Strengthen the student council's role in school decisions" },
    default_steps: { pl: ["Analiza obecnych kompetencji samorządu", "Spotkanie z dyrekcją o rozszerzeniu roli", "Wybory do nowego zarządu", "Pierwszy projekt samorządu"], en: ["Analyze current council competencies", "Meet with leadership about expanding role", "Elections for new board", "First council project"] },
    default_metrics: { pl: ["Liczba projektów samorządu", "Frekwencja na wyborach"], en: ["Number of council projects", "Election turnout"] },
    sort_order: 1,
  },
  {
    template_id: "stake-parents",
    tenant_id: "schools",
    pillar_id: "stakeholders",
    title: { pl: "Ankieta satysfakcji rodziców", en: "Parent satisfaction survey" },
    description: { pl: "Regularne badanie opinii rodziców o funkcjonowaniu szkoły", en: "Regular surveys on parent opinions about school operations" },
    default_steps: { pl: ["Opracowanie ankiety (10 pytań)", "Dystrybucja przez e-dziennik", "Analiza wyników", "Prezentacja wyników i plan działania"], en: ["Prepare survey (10 questions)", "Distribute via e-journal", "Analyze results", "Present results and action plan"] },
    default_metrics: { pl: ["Response rate ankiety", "Zmiana oceny w kolejnej ankiecie"], en: ["Survey response rate", "Score change in next survey"] },
    sort_order: 2,
  },
  // Operational
  {
    template_id: "oper-procedures",
    tenant_id: "schools",
    pillar_id: "operational",
    title: { pl: "Przegląd i aktualizacja procedur", en: "Review and update procedures" },
    description: { pl: "Systematyczny przegląd regulaminów i procedur szkolnych", en: "Systematic review of school rules and procedures" },
    default_steps: { pl: ["Lista wszystkich obowiązujących procedur", "Identyfikacja przestarzałych", "Aktualizacja i konsultacja z radą pedagogiczną", "Publikacja zaktualizowanych procedur"], en: ["List all current procedures", "Identify outdated ones", "Update and consult with staff", "Publish updated procedures"] },
    default_metrics: { pl: ["Liczba zaktualizowanych procedur", "Znajomość procedur wśród kadry (ankieta)"], en: ["Number of updated procedures", "Staff awareness of procedures (survey)"] },
    sort_order: 1,
  },
  // Decisions
  {
    template_id: "decis-minutes",
    tenant_id: "schools",
    pillar_id: "decisions",
    title: { pl: "Protokoły z zebrań online", en: "Meeting minutes online" },
    description: { pl: "Publikacja protokołów z zebrań rady pedagogicznej i zarządu", en: "Publish meeting minutes from staff and board meetings" },
    default_steps: { pl: ["Ustalenie formatu protokołu", "Wyznaczenie protokolanta", "Publikacja na wewnętrznej platformie", "Zbieranie uwag"], en: ["Set minutes format", "Appoint note-taker", "Publish on internal platform", "Collect feedback"] },
    default_metrics: { pl: ["Liczba opublikowanych protokołów", "Czas publikacji po zebraniu"], en: ["Number of published minutes", "Time to publish after meeting"] },
    sort_order: 1,
  },
  // Stability
  {
    template_id: "stab-succession",
    tenant_id: "schools",
    pillar_id: "stability",
    title: { pl: "Plan sukcesji i zastępstw", en: "Succession and backup plan" },
    description: { pl: "Dokumentacja kto zastępuje kogo w przypadku nieobecności", en: "Document who covers for whom during absences" },
    default_steps: { pl: ["Identyfikacja kluczowych ról", "Wyznaczenie zastępców", "Dokumentacja procedur", "Szkolenie zastępców"], en: ["Identify key roles", "Assign backups", "Document procedures", "Train backups"] },
    default_metrics: { pl: ["Procent ról z wyznaczonym zastępcą", "Liczba przetestowanych scenariuszy"], en: ["Percentage of roles with assigned backup", "Number of tested scenarios"] },
    sort_order: 1,
  },
];

/**
 * GET /api/olympiad/templates?tenant_id=schools&pillar_id=transparency
 *
 * Returns Certo Action templates, filtered by tenant and optionally by pillar.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenant_id") || "schools";
  const pillarId = searchParams.get("pillar_id");

  const supabase = getOlympiadSupabase();

  if (supabase) {
    try {
      let query = supabase
        .from("olympiad_action_templates")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true });

      if (pillarId) {
        query = query.eq("pillar_id", pillarId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json({ source: "supabase", templates: data });
      }
    } catch (e) {
      console.error("[Templates] Supabase error:", e);
    }
  }

  // Fallback: static templates
  let templates = STATIC_TEMPLATES.filter((t) => t.tenant_id === tenantId);
  if (pillarId) {
    templates = templates.filter((t) => t.pillar_id === pillarId);
  }

  return NextResponse.json({ source: "static", templates });
}
