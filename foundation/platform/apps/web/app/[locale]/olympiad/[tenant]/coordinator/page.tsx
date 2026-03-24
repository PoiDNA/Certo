import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { getTenantConfig } from "../../../../../lib/olympiad/data";
import { requireAuth } from "../../../../../lib/auth/session";
import CoordinatorDashboard from "../../../../../components/olympiad/CoordinatorDashboard";

export function generateStaticParams() {
  const tenants = ["schools"];
  return locales.flatMap((locale) =>
    tenants.map((tenant) => ({ locale, tenant }))
  );
}

export const dynamic = "force-dynamic"; // auth requires dynamic rendering

export default async function CoordinatorPage({
  params,
}: {
  params: Promise<{ locale: string; tenant: string }>;
}) {
  const { locale, tenant: tenantSlug } = await params;
  setRequestLocale(locale);

  const config = await getTenantConfig(tenantSlug);
  if (!config) notFound();

  // Auth check — redirect to login if not authenticated
  const user = await requireAuth();
  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/olympiad/${tenantSlug}/coordinator`);
  }

  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1">
          {locale === "pl" ? "Panel koordynatora" : "Coordinator dashboard"}
        </h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted">
          Olimpiada Certo — {t(config.tenant_name)}
        </p>
        <p className="text-xs text-certo-navy/30 dark:text-certo-dark-muted mt-1">
          {user.email}
        </p>
      </div>

      <CoordinatorDashboard config={config} locale={locale} tenantSlug={tenantSlug} />
    </div>
  );
}
