import { supabase } from "@/lib/documents";

export const revalidate = 30;

export default async function PipelinePage() {
  const { data: runs } = await supabase
    .from("pipeline_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, documents(title, slug)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pipeline Status</h2>
      <p className="text-sm text-gray-500 mb-8">
        Claude Code → Gemini 2.5 Pro → automatyczny review i merge
      </p>

      {/* Active runs */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktywne zadania</h3>
        {(!runs || runs.length === 0) ? (
          <p className="text-sm text-gray-400 italic">Brak aktywnych zadań. Stwórz Issue na GitHub z labelem pipeline/doc.</p>
        ) : (
          <div className="grid gap-3">
            {runs?.map((run: any) => (
              <div key={run.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Issue #{run.issue_number}</span>
                    <span className="text-sm text-gray-500 ml-2">• {run.branch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={run.status} />
                    <span className="text-xs text-gray-400">
                      iter. {run.iterations}/{run.max_iterations}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent reviews */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ostatnie review (Gemini)</h3>
        {(!reviews || reviews.length === 0) ? (
          <p className="text-sm text-gray-400 italic">Brak recenzji.</p>
        ) : (
          <div className="grid gap-3">
            {reviews?.map((review: any) => (
              <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{review.documents?.title || "—"}</span>
                    <span className="text-sm text-gray-500 ml-2">• PR #{review.pr_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      review.decision === "APPROVED" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {review.decision === "APPROVED" ? "✅ Approved" : "🔄 Changes"}
                    </span>
                    <span className="text-xs text-gray-500">{review.score}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    RUNNING: { label: "W toku", color: "bg-blue-100 text-blue-800" },
    REVIEWING: { label: "Gemini review", color: "bg-purple-100 text-purple-800" },
    APPROVED: { label: "Zatwierdzony", color: "bg-green-100 text-green-800" },
    FAILED: { label: "Błąd", color: "bg-red-100 text-red-800" },
    ESCALATED: { label: "Eskalacja", color: "bg-orange-100 text-orange-800" },
  };
  const c = config[status] || { label: status, color: "bg-gray-100" };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>;
}
