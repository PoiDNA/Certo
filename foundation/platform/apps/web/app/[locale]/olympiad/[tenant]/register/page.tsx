import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTenantConfig } from "../../../../../lib/olympiad/data";
import RegisterForm from "../../../../../components/olympiad/RegisterForm";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

export default async function RegisterPage({
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
    <div className="w-full max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {locale === "pl"
            ? "Zarejestruj organizację"
            : "Register your organization"}
        </h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted">
          Olimpiada Certo — {t(config.tenant_name)}
        </p>
      </div>

      <RegisterForm config={config} locale={locale} />
    </div>
  );
}
