import { supabase } from "@/lib/documents";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 30;

async function getUser() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export default async function PipelinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Require authentication — pipeline data is internal
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

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
    <div className="py-12 max-w-6xl mx-auto px-6">
      <div className="mb-12 border-b border-certo-gold/30 pb-6">
        <h2 className="text-3xl font-serif font-bold text-certo-navy dark:text-certo-dark-text tracking-tight">Pipeline Status</h2>
        <p className="mt-2 text-md text-certo-navy/70 dark:text-certo-dark-text/70 max-w-2xl font-medium tracking-wide">
          Claude Code <span className="text-certo-gold">→</span> Gemini 2.5 Pro <span className="text-certo-gold">→</span> Automatyczny Review i Merge
        </p>
      </div>

      {/* Active runs */}
      <section className="mb-12">
        <h3 className="text-2xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-6">Aktywne zadania</h3>
        {(!runs || runs.length === 0) ? (
          <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted italic p-6 border border-dashed border-certo-navy/20 dark:border-certo-dark-border text-center">
            Brak aktywnych zadań. Stwórz Issue na GitHub z labelem <code className="bg-certo-navy/5 text-certo-navy px-1.5 py-0.5 rounded-sm">pipeline/doc</code>.
          </p>
        ) : (
          <div className="grid gap-4">
            {runs?.map((run: any) => (
              <div key={run.id} className="bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border p-5 hover:border-certo-gold hover:shadow-md transition-all duration-300 rounded-[2px] group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-serif font-semibold text-lg text-certo-navy dark:text-certo-dark-text group-hover:text-certo-gold transition-colors">Issue #{run.issue_number}</span>
                    <span className="text-xs text-certo-navy/50 ml-3 font-medium tracking-wide uppercase"><span className="text-certo-gold/50 mr-2">•</span> {run.branch}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={run.status} />
                    <span className="text-xs text-certo-navy/50 font-medium tracking-wide uppercase">
                      Iter. <span className="text-certo-navy">{run.iterations}</span>/{run.max_iterations}
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
        <h3 className="text-2xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-6">Ostatnie recenzje <span className="text-certo-gold">(Gemini)</span></h3>
        {(!reviews || reviews.length === 0) ? (
          <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted italic p-6 border border-dashed border-certo-navy/20 dark:border-certo-dark-border text-center">
            Brak zrealizowanych recenzji.
          </p>
        ) : (
          <div className="grid gap-4">
            {reviews?.map((review: any) => (
              <div key={review.id} className="bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border p-5 hover:border-certo-gold hover:shadow-md transition-all duration-300 rounded-[2px] group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-serif font-semibold text-lg text-certo-navy dark:text-certo-dark-text group-hover:text-certo-gold transition-colors">{review.documents?.title || "—"}</span>
                    <span className="text-xs text-certo-navy/50 ml-3 font-medium tracking-wide uppercase"><span className="text-certo-gold/50 mr-2">•</span> PR #{review.pr_number}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2.5 py-1 rounded-sm font-medium tracking-wide uppercase border ${
                      review.decision === "APPROVED" 
                        ? "border-green-300 bg-green-50 text-green-800" 
                        : "border-yellow-300 bg-yellow-50 text-yellow-800"
                    }`}>
                      {review.decision === "APPROVED" ? "✓ Approved" : "↻ Changes"}
                    </span>
                    <span className="text-xs text-certo-navy/50 font-medium tracking-wide uppercase">Wynik <span className="text-certo-navy font-bold">{review.score}</span>/10</span>
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
    RUNNING: { label: "W toku", color: "bg-blue-50 text-blue-900 border-blue-200" },
    REVIEWING: { label: "Gemini review", color: "bg-purple-50 text-purple-900 border-purple-200" },
    APPROVED: { label: "Zatwierdzony", color: "bg-green-50 text-green-900 border-green-200" },
    FAILED: { label: "Błąd", color: "bg-red-50 text-red-900 border-red-200" },
    ESCALATED: { label: "Eskalacja", color: "bg-orange-50 text-orange-900 border-orange-200" },
  };
  const c = config[status] || { label: status, color: "bg-certo-navy/5 text-certo-navy border-certo-navy/20" };
  return <span className={`text-xs px-2.5 py-1 rounded-sm border font-medium tracking-wide uppercase ${c.color}`}>{c.label}</span>;
}
