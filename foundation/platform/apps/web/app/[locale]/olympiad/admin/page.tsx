import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireAuth } from "../../../../lib/auth/session";
import AdminPanel from "./AdminPanel";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = "force-dynamic";

export default async function OlympiadAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireAuth();
  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/olympiad/admin`);
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1">
          {locale === "pl" ? "Panel administracyjny" : "Admin panel"}
        </h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted">
          Olimpiada Certo — {locale === "pl" ? "zarządzanie tenantami i rolami" : "tenant and role management"}
        </p>
        <p className="text-xs text-certo-navy/30 dark:text-certo-dark-muted mt-1">
          {user.email}
        </p>
      </div>
      <AdminPanel locale={locale} userId={user.id} />
    </div>
  );
}
