import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "../../../../i18n-config";
import { getTenantConfig } from "../../../../lib/olympiad/data";
import { ACHIEVEMENT_LEVELS } from "../../../../lib/olympiad/types";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

export default async function TenantLandingPage({
  params,
}: {
  params: Promise<{ locale: string; tenant: string }>;
}) {
  const { locale, tenant: tenantSlug } = await params;
  setRequestLocale(locale);

  const config = await getTenantConfig(tenantSlug);
  if (!config) notFound();

  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Olimpiada Certo — {t(config.tenant_name)}
        </h1>
        <p className="text-lg text-certo-navy/70 dark:text-certo-dark-muted max-w-2xl mx-auto">
          {locale === "pl"
            ? "Dobre zarządzanie to bezpieczeństwo i sukces"
            : "Good governance means safety and success"}
        </p>
      </div>

      {/* Levels */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {locale === "pl" ? "Poziomy osiągnięć" : "Achievement levels"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ACHIEVEMENT_LEVELS).map(([key, level]) => (
            <div
              key={key}
              className="text-center p-4 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface"
            >
              <div className="text-2xl font-bold text-certo-gold mb-1">
                {level.min}–{level.max}
              </div>
              <div className="font-semibold text-sm">{level.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {locale === "pl" ? "Co oceniamy?" : "What do we assess?"}
        </h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {config.pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="p-4 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface text-center"
            >
              <div className="text-2xl font-bold text-certo-gold mb-1">
                {pillar.weight}%
              </div>
              <div className="font-semibold text-sm mb-1">
                {t(pillar.friendly_name)}
              </div>
              <div className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
                {t(pillar.name)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Phases */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {locale === "pl" ? "4 fazy olimpiady" : "4 phases of the olympiad"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              num: "I",
              title: {
                pl: "Samoocena governance",
                en: "Governance self-assessment",
              },
              desc: {
                pl: "Cała społeczność wypełnia anonimowe ankiety (45 sekund). Algorytm oblicza Certo Score.",
                en: "The whole community fills anonymous surveys (45 seconds). Algorithm calculates Certo Score.",
              },
              duration: { pl: "4 tygodnie", en: "4 weeks" },
            },
            {
              num: "II",
              title: {
                pl: "Test wiedzy",
                en: "Knowledge test",
              },
              desc: {
                pl: `${t(config.team_alias)} wspólnie rozwiązuje ${config.knowledge_test.num_questions} pytań w ${config.knowledge_test.duration_min} minut.`,
                en: `The ${t(config.team_alias)} solves ${config.knowledge_test.num_questions} questions together in ${config.knowledge_test.duration_min} minutes.`,
              },
              duration: {
                pl: `${config.knowledge_test.duration_min} min`,
                en: `${config.knowledge_test.duration_min} min`,
              },
            },
            {
              num: "III",
              title: { pl: "Certo Action", en: "Certo Action" },
              desc: {
                pl: "Zespół opracowuje plan poprawy najsłabszego filaru. Inne organizacje oceniają plan.",
                en: "The team develops an improvement plan for the weakest pillar. Other organizations review the plan.",
              },
              duration: { pl: "4 tygodnie", en: "4 weeks" },
            },
            {
              num: "IV",
              title: {
                pl: "Gala Diamentów Certo",
                en: "Diament Certo Gala",
              },
              desc: {
                pl: "Patron przyznaje Diamenty Certo. Nie ma przegranych — każda organizacja z certyfikatem.",
                en: "The Patron awards Diamenty Certo. No losers — every organization gets a certificate.",
              },
              duration: { pl: "1 dzień", en: "1 day" },
            },
          ].map((phase) => (
            <div
              key={phase.num}
              className="p-6 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-certo-gold/20 text-certo-gold font-bold flex items-center justify-center text-lg">
                  {phase.num}
                </span>
                <h3 className="font-bold text-lg">{t(phase.title)}</h3>
              </div>
              <p className="text-sm text-certo-navy/70 dark:text-certo-dark-muted mb-2">
                {t(phase.desc)}
              </p>
              <span className="text-xs font-medium text-certo-gold">
                {t(phase.duration)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link
          href={`/olympiad/${tenantSlug}/register`}
          className="inline-block px-8 py-4 bg-certo-gold text-white font-bold rounded-xl text-lg hover:bg-certo-gold-light transition-colors"
        >
          {locale === "pl"
            ? "Zarejestruj organizację"
            : "Register your organization"}
        </Link>
      </div>
    </div>
  );
}
