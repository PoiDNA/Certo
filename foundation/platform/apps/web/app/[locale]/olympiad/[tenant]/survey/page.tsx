import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTenantConfig } from "../../../../../lib/olympiad/data";
import { getAudioUrl } from "../../../../../lib/olympiad/tts";
import SurveyPageClient from "./SurveyPageClient";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tenant: string }>;
  searchParams: Promise<{ group?: string; link?: string }>;
}) {
  const { locale, tenant: tenantSlug } = await params;
  const { group: groupId, link: linkHash } = await searchParams;
  setRequestLocale(locale);

  const config = await getTenantConfig(tenantSlug);
  if (!config) notFound();

  // Find the survey group
  const group = groupId
    ? config.survey_groups.find((g) => g.group_id === groupId)
    : config.survey_groups[0]; // default to first group for demo

  if (!group) notFound();

  const surveyConfig = config.surveys[group.group_id];
  if (!surveyConfig) notFound();

  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Olimpiada Certo
        </h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted">
          {locale === "pl"
            ? "Anonimowa ankieta — Twoja opinia się liczy"
            : "Anonymous survey — Your opinion matters"}
        </p>
      </div>

      <SurveyPageClient
        questions={surveyConfig.questions.map((q) => ({
          ...q,
          audioUrl: surveyConfig.audio_tts === "static_mp3"
            ? getAudioUrl(q.text[locale] || q.text.pl || Object.values(q.text)[0] || "", locale)
            : undefined,
        }))}
        locale={locale}
        groupName={t(group.name)}
        tenantSlug={tenantSlug}
        groupId={group.group_id}
        linkHash={linkHash}
      />
    </div>
  );
}
