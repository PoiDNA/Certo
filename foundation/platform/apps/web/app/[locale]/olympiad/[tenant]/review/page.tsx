import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTenantConfig } from "../../../../../lib/olympiad/data";
import PeerReviewClient from "../../../../../components/olympiad/PeerReviewClient";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

// Demo: Certo Action to review (from another anonymous school)
const DEMO_ACTION = {
  weakest_pillar: "decisions",
  what_to_change:
    "Chcemy wprowadzić regularne konsultacje z samorządem uczniowskim przed podejmowaniem kluczowych decyzji dotyczących regulaminu szkoły. Obecnie decyzje są podejmowane wyłącznie przez radę pedagogiczną, bez udziału uczniów.",
  steps: [
    "Ustalenie harmonogramu miesięcznych spotkań samorządu z dyrekcją",
    "Stworzenie formularza zgłaszania tematów do konsultacji",
    "Przeprowadzenie pierwszej konsultacji pilotażowej",
    "Zebranie feedbacku i modyfikacja procesu",
  ],
  success_metrics: [
    "Liczba decyzji konsultowanych z samorządem (cel: min. 3/miesiąc)",
    "Ocena procesu przez uczniów (ankieta, cel: >70% pozytywnych)",
  ],
  template_used: null,
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; tenant: string }>;
}) {
  const { locale, tenant: tenantSlug } = await params;
  setRequestLocale(locale);

  const config = await getTenantConfig(tenantSlug);
  if (!config) notFound();

  const weakestPillar = config.pillars.find(
    (p) => p.id === DEMO_ACTION.weakest_pillar
  );

  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">
          {locale === "pl" ? "Peer-Review" : "Peer Review"}
        </h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted">
          {locale === "pl"
            ? "Oceń plan poprawy innej organizacji (anonimowo)"
            : "Review another organization's improvement plan (anonymously)"}
        </p>
      </div>

      <PeerReviewClient
        locale={locale}
        tenantSlug={tenantSlug}
        action={DEMO_ACTION}
        pillarFriendlyName={
          weakestPillar
            ? t(weakestPillar.friendly_name)
            : DEMO_ACTION.weakest_pillar
        }
        pillarName={
          weakestPillar
            ? t(weakestPillar.name)
            : DEMO_ACTION.weakest_pillar
        }
      />
    </div>
  );
}
