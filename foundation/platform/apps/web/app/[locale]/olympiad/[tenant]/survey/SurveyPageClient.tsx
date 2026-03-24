"use client";

import { useCallback, useState } from "react";
import SurveyForm from "../../../../../components/olympiad/SurveyForm";
import type { SurveyQuestion } from "../../../../../lib/olympiad/types";

interface SurveyPageClientProps {
  questions: SurveyQuestion[];
  locale: string;
  groupName: string;
  tenantSlug: string;
  groupId: string;
  linkHash?: string;
  orgName?: string;
}

export default function SurveyPageClient({
  questions,
  locale,
  groupName,
  tenantSlug,
  groupId,
  linkHash,
  orgName,
}: SurveyPageClientProps) {
  const [totalRespondents, setTotalRespondents] = useState<number | undefined>(undefined);

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

      const data = await res.json();
      if (data.total_responses !== undefined) {
        setTotalRespondents(data.total_responses);
      }
    },
    [tenantSlug, groupId, linkHash]
  );

  return (
    <SurveyForm
      questions={questions}
      locale={locale}
      groupName={groupName}
      orgName={orgName || locale === "pl" ? "Twoja organizacja" : "your organization"}
      onSubmit={handleSubmit}
      totalRespondents={totalRespondents}
    />
  );
}
