import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTenantConfig } from "../../../../../lib/olympiad/data";
import { ACHIEVEMENT_LEVELS } from "../../../../../lib/olympiad/types";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

// Demo data — in production, fetched from Supabase
const DEMO_RESULTS = {
  org_name: "Szkoła Podstawowa nr 7 im. Marii Curie",
  certo_score: 74,
  certo_vector: "+",
  pillar_scores: {
    operational: 78,
    stakeholders: 71,
    decisions: 68,
    stability: 82,
    transparency: 69,
  },
  participation_rates: {
    students: 65,
    teachers: 88,
    parents: 22,
    staff: 45,
  },
  community_bonus: 2,
  k_anonymity_suppressed: 0,
  total_responses: 312,
};

export default async function ResultsPage({
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

  const data = DEMO_RESULTS;

  // Determine achievement level
  const level = Object.entries(ACHIEVEMENT_LEVELS).find(
    ([, l]) => data.certo_score >= l.min && data.certo_score <= l.max
  );
  const levelLabel = level ? level[1].label : "—";

  // Find weakest pillar
  const weakest = config.pillars.reduce((min, p) =>
    (data.pillar_scores[p.id as keyof typeof data.pillar_scores] || 0) <
    (data.pillar_scores[min.id as keyof typeof data.pillar_scores] || 0)
      ? p
      : min
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {locale === "pl" ? "Wyniki" : "Results"}
        </h1>
        <p className="text-lg text-certo-navy/60 dark:text-certo-dark-muted">
          {data.org_name}
        </p>
      </div>

      {/* Score card */}
      <div className="text-center mb-12 p-8 rounded-2xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border">
        <div className="text-7xl font-bold text-certo-gold mb-2">
          {data.certo_score}
        </div>
        <div className="text-2xl font-semibold mb-1">Certo Score</div>
        <div className="flex items-center justify-center gap-3 text-lg">
          <span className="px-3 py-1 rounded-full bg-certo-gold/20 text-certo-gold font-bold">
            {levelLabel}
          </span>
          <span className="text-2xl">{data.certo_vector}</span>
        </div>
        {data.community_bonus > 0 && (
          <div className="mt-3 text-sm text-green-600 dark:text-green-400">
            +{data.community_bonus}{" "}
            {locale === "pl" ? "Community Bonus" : "Community Bonus"}
          </div>
        )}
      </div>

      {/* Pillar breakdown */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-center">
          {locale === "pl" ? "Wyniki per filar" : "Results per pillar"}
        </h2>
        <div className="space-y-4">
          {config.pillars.map((pillar) => {
            const score =
              data.pillar_scores[
                pillar.id as keyof typeof data.pillar_scores
              ] || 0;
            const isWeakest = pillar.id === weakest.id;
            return (
              <div key={pillar.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {t(pillar.friendly_name)}
                    <span className="text-certo-navy/40 dark:text-certo-dark-muted ml-2 text-xs">
                      ({t(pillar.name)}, {pillar.weight}%)
                    </span>
                  </span>
                  <span
                    className={`text-sm font-bold ${isWeakest ? "text-red-500" : ""}`}
                  >
                    {score}
                    {isWeakest && " ⚠️"}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-certo-dark-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isWeakest
                        ? "bg-red-400"
                        : score >= 80
                          ? "bg-green-500"
                          : score >= 60
                            ? "bg-certo-gold"
                            : "bg-orange-400"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Participation */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-center">
          {locale === "pl" ? "Frekwencja" : "Participation"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.survey_groups.map((group) => {
            const rate =
              data.participation_rates[
                group.group_id as keyof typeof data.participation_rates
              ] || 0;
            const threshold = config.thresholds[group.group_id];
            const meetsMin = threshold ? rate >= threshold.min_pct : true;
            const meetsBonus = threshold ? rate >= threshold.bonus_pct : false;
            return (
              <div
                key={group.group_id}
                className="text-center p-4 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface"
              >
                <div
                  className={`text-2xl font-bold ${meetsBonus ? "text-green-500" : meetsMin ? "text-certo-gold" : "text-red-400"}`}
                >
                  {rate}%
                </div>
                <div className="text-sm font-medium mt-1">{t(group.name)}</div>
                {threshold && (
                  <div className="text-xs text-certo-navy/40 dark:text-certo-dark-muted mt-1">
                    min. {threshold.min_pct}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center text-sm text-certo-navy/50 dark:text-certo-dark-muted mt-4">
          {locale === "pl"
            ? `Łącznie: ${data.total_responses} odpowiedzi`
            : `Total: ${data.total_responses} responses`}
        </div>
      </section>

      {/* Weakest pillar CTA */}
      <div className="text-center p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
        <h3 className="font-bold text-lg mb-2">
          {locale === "pl"
            ? `Najsłabszy filar: ${t(weakest.friendly_name)}`
            : `Weakest pillar: ${t(weakest.friendly_name)}`}
        </h3>
        <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted mb-4">
          {locale === "pl"
            ? "W Fazie III (Certo Action) Twój zespół opracuje plan poprawy tego filaru."
            : "In Phase III (Certo Action) your team will develop an improvement plan for this pillar."}
        </p>
      </div>
    </div>
  );
}
