import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTenantConfig } from "../../../../../lib/olympiad/data";
import TeamTestClient from "../../../../../components/olympiad/TeamTestClient";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

// Demo questions — in production from Knowledge Graph
const DEMO_QUESTIONS = [
  {
    id: 1,
    text: { pl: "Co oznacza 'governance' w kontekście organizacji?", en: "What does 'governance' mean in an organizational context?" },
    options: [
      { id: "a", text: { pl: "Sposób, w jaki organizacja jest zarządzana i nadzorowana", en: "The way an organization is managed and overseen" } },
      { id: "b", text: { pl: "System informatyczny do zarządzania dokumentami", en: "An IT system for document management" } },
      { id: "c", text: { pl: "Rodzaj audytu finansowego", en: "A type of financial audit" } },
    ],
    correct: "a",
  },
  {
    id: 2,
    text: { pl: "Która z poniższych zasad jest fundamentem transparentności?", en: "Which principle is fundamental to transparency?" },
    options: [
      { id: "a", text: { pl: "Wszystkie decyzje podejmuje jedna osoba", en: "All decisions are made by one person" } },
      { id: "b", text: { pl: "Informacje o decyzjach są dostępne dla zainteresowanych", en: "Information about decisions is available to stakeholders" } },
      { id: "c", text: { pl: "Budżet jest tajny", en: "The budget is secret" } },
    ],
    correct: "b",
  },
  {
    id: 3,
    text: { pl: "Co powinien zrobić samorząd uczniowski, aby być skutecznym?", en: "What should a student council do to be effective?" },
    options: [
      { id: "a", text: { pl: "Organizować tylko imprezy szkolne", en: "Organize only school events" } },
      { id: "b", text: { pl: "Konsultować decyzje z uczniami i przekazywać ich głos dyrekcji", en: "Consult decisions with students and convey their voice to management" } },
      { id: "c", text: { pl: "Podejmować decyzje bez konsultacji", en: "Make decisions without consultation" } },
    ],
    correct: "b",
  },
  {
    id: 4,
    text: { pl: "Co to jest 'konflikt interesów'?", en: "What is a 'conflict of interest'?" },
    options: [
      { id: "a", text: { pl: "Kłótnia między pracownikami", en: "An argument between employees" } },
      { id: "b", text: { pl: "Sytuacja, gdy osoba decyzyjna ma osobisty interes w wyniku decyzji", en: "A situation where a decision-maker has a personal interest in the outcome" } },
      { id: "c", text: { pl: "Różnica zdań na zebraniu", en: "A difference of opinion at a meeting" } },
    ],
    correct: "b",
  },
  {
    id: 5,
    text: { pl: "Dlaczego ważne jest, aby budżet organizacji był jawny?", en: "Why is it important for an organization's budget to be public?" },
    options: [
      { id: "a", text: { pl: "Żeby konkurencja mogła skopiować wydatki", en: "So competitors can copy spending" } },
      { id: "b", text: { pl: "Żeby interesariusze mogli ocenić, czy pieniądze są wydawane mądrze", en: "So stakeholders can assess whether money is spent wisely" } },
      { id: "c", text: { pl: "To nie jest ważne", en: "It's not important" } },
    ],
    correct: "b",
  },
  {
    id: 6,
    text: { pl: "Co oznacza zasada 'comply or explain'?", en: "What does the 'comply or explain' principle mean?" },
    options: [
      { id: "a", text: { pl: "Przestrzegaj zasad lub wyjaśnij, dlaczego ich nie przestrzegasz", en: "Follow the rules or explain why you don't" } },
      { id: "b", text: { pl: "Zawsze przestrzegaj zasad bez wyjątku", en: "Always follow the rules without exception" } },
      { id: "c", text: { pl: "Zgłaszaj naruszenia na policję", en: "Report violations to the police" } },
    ],
    correct: "a",
  },
  {
    id: 7,
    text: { pl: "Kto powinien być zaangażowany w podejmowanie ważnych decyzji w szkole?", en: "Who should be involved in important school decisions?" },
    options: [
      { id: "a", text: { pl: "Tylko dyrektor", en: "Only the principal" } },
      { id: "b", text: { pl: "Dyrektor, nauczyciele, rodzice i uczniowie — w zależności od tematu", en: "Principal, teachers, parents and students — depending on the topic" } },
      { id: "c", text: { pl: "Tylko organ prowadzący", en: "Only the governing body" } },
    ],
    correct: "b",
  },
  {
    id: 8,
    text: { pl: "Co to jest 'whistleblowing'?", en: "What is 'whistleblowing'?" },
    options: [
      { id: "a", text: { pl: "Gwizdanie na lekcji WF", en: "Whistling in PE class" } },
      { id: "b", text: { pl: "Zgłaszanie nieprawidłowości w organizacji przez osobę z wewnątrz", en: "Reporting irregularities by an insider" } },
      { id: "c", text: { pl: "Publiczne krytykowanie pracodawcy w mediach", en: "Public criticism of the employer in media" } },
    ],
    correct: "b",
  },
  {
    id: 9,
    text: { pl: "Co daje organizacji certyfikat jakości zarządzania?", en: "What does a governance quality certificate give an organization?" },
    options: [
      { id: "a", text: { pl: "Zwolnienie z podatków", en: "Tax exemption" } },
      { id: "b", text: { pl: "Wiarygodność, zaufanie interesariuszy i lepszą reputację", en: "Credibility, stakeholder trust and better reputation" } },
      { id: "c", text: { pl: "Gwarancję zysku", en: "Profit guarantee" } },
    ],
    correct: "b",
  },
  {
    id: 10,
    text: { pl: "Jak najlepiej rozwiązywać konflikty w organizacji?", en: "What is the best way to resolve conflicts in an organization?" },
    options: [
      { id: "a", text: { pl: "Ignorować je i liczyć, że same przeminą", en: "Ignore them and hope they pass" } },
      { id: "b", text: { pl: "Poprzez dialog, mediację i jasne procedury", en: "Through dialogue, mediation and clear procedures" } },
      { id: "c", text: { pl: "Zwalniać osoby, które się skarżą", en: "Fire people who complain" } },
    ],
    correct: "b",
  },
];

export default async function TestPage({
  params,
}: {
  params: Promise<{ locale: string; tenant: string }>;
}) {
  const { locale, tenant: tenantSlug } = await params;
  setRequestLocale(locale);

  const config = await getTenantConfig(tenantSlug);
  if (!config) notFound();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <TeamTestClient
        locale={locale}
        tenantSlug={tenantSlug}
        questions={DEMO_QUESTIONS}
        durationMin={config.knowledge_test.duration_min}
        passingPct={config.knowledge_test.passing_pct}
        teamAlias={config.team_alias[locale] || config.team_alias.pl || "Zespół Certo"}
      />
    </div>
  );
}
