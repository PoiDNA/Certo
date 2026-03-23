import { setRequestLocale } from "next-intl/server";
import { ChatPanel } from "../../../components/rag/ChatPanel";

export default async function RagPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Certo Methodology Agent
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Baza wiedzy: dokumenty Certo, regulacje, standardy governance
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-certo-gold/10 text-certo-gold font-medium">
            RAG
          </span>
        </div>
      </div>

      <ChatPanel />
    </main>
  );
}
