import { getAllDocuments, ENTITY_LABELS, STATUS_CONFIG } from "@/lib/documents";
import Link from "next/link";

export const revalidate = 60; // ISR: revalidate every 60s

export default function HomePage() {
  const docs = getAllDocuments();
  
  const foundation = docs.filter(d => d.entity === "foundation");
  const company = docs.filter(d => d.entity === "company");

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dokumentacja Sprint 0</h2>
        <p className="mt-1 text-sm text-gray-500">
          Komplet dokumentów zatwierdzanych uchwałą Zarządu Fundacji Certo + opinia Izby Nadzoru
        </p>
      </div>

      <DocumentSection 
        title="Fundacja Certo" 
        subtitle="Dokumenty instytucjonalne i governance" 
        docs={foundation} 
      />
      
      <DocumentSection 
        title="Spółka Certo ID PSA" 
        subtitle="Dokumentacja techniczna i architektura" 
        docs={company} 
      />

      <div className="mt-12 rounded-lg bg-teal-50 border border-teal-200 p-6">
        <h3 className="font-semibold text-teal-800">Pipeline</h3>
        <p className="mt-1 text-sm text-teal-700">
          Dokumenty produkowane przez Claude Code, recenzowane automatycznie przez Gemini 2.5 Pro.
          Każda zmiana przechodzi CI/CD z weryfikacją spójności krzyżowej.
        </p>
        <div className="mt-3 flex gap-4 text-xs">
          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded">22 Hard Gates</span>
          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded">7 Workflowów</span>
          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded">14 reguł core Sprint 0</span>
        </div>
      </div>
    </div>
  );
}

function DocumentSection({ title, subtitle, docs }: { 
  title: string; 
  subtitle: string;
  docs: ReturnType<typeof getAllDocuments>;
}) {
  if (docs.length === 0) return null;
  
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      
      <div className="grid gap-3">
        {docs.map(doc => (
          <Link 
            key={doc.slug} 
            href={`/documents/${doc.slug}`}
            className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{doc.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {doc.category} • v{doc.version} • {doc.updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[doc.status]?.color || ''}`}>
                  {STATUS_CONFIG[doc.status]?.label || doc.status}
                </span>
                {doc.docxUrl && (
                  <span className="text-xs text-blue-600 hover:underline">DOCX</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
