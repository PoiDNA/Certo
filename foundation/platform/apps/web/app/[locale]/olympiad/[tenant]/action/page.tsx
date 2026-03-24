import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTenantConfig } from "../../../../../lib/olympiad/data";
import CertoActionForm from "../../../../../components/olympiad/CertoActionForm";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

// Demo: weakest pillar from results
const DEMO_WEAKEST = "decisions";

// Demo: templates from DB seed
const DEMO_TEMPLATES = [
  {
    id: "schools-decisions-1",
    title: { pl: "Protokoły decyzji online", en: "Online decision protocols" },
    description: {
      pl: "Publikacja protokołów z zebrań rady pedagogicznej w uproszczonej formie",
      en: "Publish simplified minutes from staff meetings",
    },
    steps: [
      { pl: "Ustalenie formatu", en: "Define format" },
      { pl: "Wyznaczenie odpowiedzialnej osoby", en: "Assign responsible person" },
      { pl: "Publikacja pierwszego protokołu", en: "Publish first minutes" },
      { pl: "Zebranie opinii", en: "Collect feedback" },
    ],
    metrics: [
      { pl: "Regularność publikacji", en: "Publication regularity" },
      { pl: "Liczba czytelników", en: "Number of readers" },
    ],
  },
  {
    id: "custom",
    title: { pl: "Własny plan", en: "Custom plan" },
    description: {
      pl: "Opracuj własny plan poprawy od zera",
      en: "Create your own improvement plan from scratch",
    },
    steps: [],
    metrics: [],
  },
];

export default async function ActionPage({
  params,
}: {
  params: Promise<{ locale: string; tenant: string }>;
}) {
  const { locale, tenant: tenantSlug } = await params;
  setRequestLocale(locale);

  const config = await getTenantConfig(tenantSlug);
  if (!config) notFound();

  const weakestPillar = config.pillars.find((p) => p.id === DEMO_WEAKEST) || config.pillars[0];
  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Certo Action</h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted">
          {locale === "pl"
            ? `Najsłabszy filar: ${t(weakestPillar.friendly_name)}`
            : `Weakest pillar: ${t(weakestPillar.friendly_name)}`}
        </p>
      </div>

      <CertoActionForm
        locale={locale}
        tenantSlug={tenantSlug}
        weakestPillar={weakestPillar}
        templates={DEMO_TEMPLATES}
        maxSteps={config.action_form.max_steps}
        maxWords={config.action_form.max_words}
      />
    </div>
  );
}
