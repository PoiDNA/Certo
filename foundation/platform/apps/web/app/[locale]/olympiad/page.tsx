import { locales } from "@certo/i18n/config";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "../../../i18n-config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const TENANTS = [
  {
    slug: "schools",
    emoji: "🏫",
    name: { pl: "Szkoły", en: "Schools" },
    description: {
      pl: "Olimpiada governance dla szkół — oceń zarządzanie swoją szkołą razem z całą społecznością",
      en: "Governance olympiad for schools — assess your school's governance with the whole community",
    },
  },
];

export default async function OlympiadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Olimpiada Certo
        </h1>
        <p className="text-lg text-certo-navy/70 dark:text-certo-dark-muted max-w-2xl mx-auto">
          {locale === "pl"
            ? "Dobre zarządzanie to bezpieczeństwo i sukces"
            : "Good governance means safety and success"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TENANTS.map((tenant) => (
          <Link
            key={tenant.slug}
            href={`/olympiad/${tenant.slug}`}
            className="block p-6 rounded-2xl border border-certo-navy/10 dark:border-certo-dark-border hover:border-certo-gold/50 dark:hover:border-certo-gold/50 transition-colors bg-white dark:bg-certo-dark-surface"
          >
            <div className="text-4xl mb-4">{tenant.emoji}</div>
            <h2 className="text-xl font-bold mb-2">
              {tenant.name[locale as keyof typeof tenant.name] ||
                tenant.name.en}
            </h2>
            <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
              {tenant.description[
                locale as keyof typeof tenant.description
              ] || tenant.description.en}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
