import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/rag/supabase";

async function getAuthUser() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

/**
 * POST /api/rag/conversations/[id]/messages — save a message pair (user + assistant)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sb = getServiceSupabase();

  // Verify ownership
  const { data: conv } = await sb
    .from("rag_conversations")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: {
    userMessage: string;
    assistantMessage: string;
    thinking?: string;
    sources?: unknown;
    model?: string;
  };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Insert both messages (cast to any — rag_messages not in generated types yet)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from("rag_messages") as any).insert([
    {
      conversation_id: id,
      role: "user",
      content: body.userMessage,
    },
    {
      conversation_id: id,
      role: "assistant",
      content: body.assistantMessage,
      thinking: body.thinking || null,
      sources: body.sources || null,
      model: body.model || "sonnet",
    },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update conversation metadata
  const title = body.userMessage.slice(0, 80) + (body.userMessage.length > 80 ? "..." : "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countResult = await (sb.from("rag_messages") as any).select("id", { count: "exact" }).eq("conversation_id", id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (sb.from("rag_conversations") as any).update({
    title,
    updated_at: new Date().toISOString(),
    message_count: countResult.count || 0,
  }).eq("id", id);

  return NextResponse.json({ ok: true }, { status: 201 });
}
