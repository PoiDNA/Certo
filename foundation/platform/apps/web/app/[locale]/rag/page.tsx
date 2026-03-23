import { setRequestLocale } from "next-intl/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChatPanel } from "../../../components/rag/ChatPanel";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Certo Methodology Agent",
    robots: { index: false, follow: false },
  };
}

async function getUser() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}

export default async function RagPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/rag`);
  }

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
