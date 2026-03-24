"use client";

import { useCallback } from "react";
import SurveyForm from "../../../../../components/olympiad/SurveyForm";
import type { SurveyQuestion } from "../../../../../lib/olympiad/types";

interface SurveyPageClientProps {
  questions: SurveyQuestion[];
  locale: string;
  groupName: string;
  tenantSlug: string;
  groupId: string;
  linkHash?: string;
}

export default function SurveyPageClient({
  questions,
  locale,
  groupName,
  tenantSlug,
  groupId,
  linkHash,
}: SurveyPageClientProps) {
  const handleSubmit = useCallback(
    async (pillarScores: Record<string, number>) => {
      const res = await fetch("/api/olympiad/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantSlug,
          group_id: groupId,
          pillar_scores: pillarScores,
          link_hash: linkHash,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Survey submission failed");
      }
    },
    [tenantSlug, groupId, linkHash]
  );

  return (
    <SurveyForm
      questions={questions}
      locale={locale}
      groupName={groupName}
      orgName="Demo School"
      onSubmit={handleSubmit}
    />
  );
}
