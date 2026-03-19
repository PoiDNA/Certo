import { getAllDocuments, ENTITY_LABELS, STATUS_CONFIG } from "@/lib/documents";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from "next/link";
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 60; // ISR: revalidate every 60s

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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Require authentication — internal documentation
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const docs = getAllDocuments();
  
  const foundation = docs.filter(d => d.entity === "foundation");
  const company = docs.filter(d => d.entity === "company");

  return (
    <div className="py-12">
      <div className="mb-12 border-b border-certo-gold/30 pb-6">
        <h2 className="text-3xl font-serif font-bold text-certo-navy tracking-tight">Dokumentacja Sprint 0</h2>
        <p className="mt-2 text-md text-certo-navy/70 max-w-2xl">
          Komplet dokumentów zatwierdzanych uchwałą Zarządu Fundacji Certo + opinia Izby Nadzoru
        </p>
      </div>

      <DocumentSection 
        locale={locale}
        title="Fundacja Certo" 
        subtitle="Dokumenty instytucjonalne i governance" 
        docs={foundation} 
      />
      
      <DocumentSection 
        locale={locale}
        title="Spółka Certo ID PSA" 
        subtitle="Dokumentacja techniczna i architektura" 
        docs={company} 
      />

      <div className="mt-16 rounded-sm bg-certo-navy border-[2px] border-certo-gold p-8 shadow-lg">
        <h3 className="font-serif text-xl font-bold text-certo-cream mb-2">Platforma Certo Pipeline</h3>
        <p className="text-sm text-certo-cream/80 leading-relaxed max-w-3xl">
          Dokumenty produkowane przez Claude Code, recenzowane automatycznie przez Gemini 2.5 Pro.
          Każda zmiana przechodzi CI/CD z weryfikacją spójności krzyżowej.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium tracking-wide">
          <span className="border border-certo-gold-light text-certo-gold-light px-3 py-1.5 rounded-sm uppercase">22 Hard Gates</span>
          <span className="border border-certo-gold-light text-certo-gold-light px-3 py-1.5 rounded-sm uppercase">7 Workflowów</span>
          <span className="border border-certo-gold-light text-certo-gold-light px-3 py-1.5 rounded-sm uppercase">14 reguł core Sprint 0</span>
        </div>
      </div>
    </div>
  );
}

function DocumentSection({ locale, title, subtitle, docs }: { 
  locale: string;
  title: string; 
  subtitle: string;
  docs: ReturnType<typeof getAllDocuments>;
}) {
  if (docs.length === 0) return null;
  
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-serif font-bold text-certo-navy mb-1">{title}</h3>
      <p className="text-sm text-certo-navy/60 mb-6 font-medium tracking-wide uppercase">{subtitle}</p>
      
      <div className="grid gap-4">
        {docs.map(doc => (
          <Link 
            key={doc.slug} 
            href={`/${locale}/documents/${doc.slug}`}
            className="block bg-white border border-certo-navy/10 p-5 hover:border-certo-gold hover:shadow-md transition-all duration-300 rounded-[2px] group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h4 className="font-serif font-semibold text-lg text-certo-navy group-hover:text-certo-gold transition-colors">{doc.title}</h4>
                <p className="text-xs text-certo-navy/50 mt-2 font-medium tracking-wide uppercase">
                  {doc.category} <span className="mx-1.5 text-certo-gold/50">•</span> v{doc.version} <span className="mx-1.5 text-certo-gold/50">•</span> {doc.updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-sm font-medium tracking-wide uppercase border ${STATUS_CONFIG[doc.status]?.color || 'border-certo-navy/20 text-certo-navy/60'}`}>
                  {STATUS_CONFIG[doc.status]?.label || doc.status}
                </span>
                {doc.docxUrl && (
                  <span className="text-xs font-semibold text-certo-navy hover:text-certo-gold uppercase tracking-wide transition-colors">DOCX</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
