import { getTranslations } from "next-intl/server";
import ParticipantsClient from "./ParticipantsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Olympiad" });
  return {
    title: `${t("participants_title")} — Olimpiada Certo`,
    description: t("participants_subtitle"),
  };
}

export default async function ParticipantsPage() {
  return <ParticipantsClient />;
}
