import { getDocument, getDocumentSlugs, STATUS_CONFIG } from "@/lib/documents";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60;

export function generateStaticParams() {
  return getDocumentSlugs().map(slug => ({ slug }));
}

export default function DocumentPage({ params }: { params: { slug: string } }) {
  const doc = getDocument(params.slug);
  if (!doc) notFound();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{doc.entity === "foundation" ? "Fundacja Certo" : "Spółka Certo ID PSA"}</span>
          <span>•</span>
          <span>{doc.category}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{doc.title}</h1>
        <div className="mt-3 flex items-center gap-4">
          <span className={`text-sm px-3 py-1 rounded-full ${STATUS_CONFIG[doc.status]?.color}`}>
            {STATUS_CONFIG[doc.status]?.label}
          </span>
          <span className="text-sm text-gray-500">Wersja {doc.version}</span>
          {doc.lastReviewedAt && (
            <span className="text-sm text-gray-500">
              Recenzja: {doc.lastReviewedAt} ({doc.reviewedBy})
            </span>
          )}
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex gap-3 mb-8">
        {doc.docxUrl && (
          <a
            href={doc.docxUrl}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Pobierz DOCX
          </a>
        )}
        {doc.pdfUrl && (
          <a
            href={doc.pdfUrl}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Pobierz PDF
          </a>
        )}
        <a
          href={`https://github.com/certo-governance/certo-governance/blob/main/${doc.markdownPath}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Źródło (GitHub)
        </a>
      </div>

      {/* Content */}
      <article className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-teal-700 prose-table:text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.content || "Brak treści."}
        </ReactMarkdown>
      </article>
    </div>
  );
}
