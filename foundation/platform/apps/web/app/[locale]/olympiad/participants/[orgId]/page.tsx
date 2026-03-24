import Link from "next/link";
import OrgDetailClient from "./OrgDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { orgId } = await params;
  return {
    title: `Organizacja ${orgId} — Olimpiada Certo`,
  };
}

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await params;
  return <OrgDetailClient locale={locale} orgId={orgId} />;
}
