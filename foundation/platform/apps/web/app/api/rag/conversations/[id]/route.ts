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
 * GET /api/rag/conversations/[id] — get conversation with messages
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sb = getServiceSupabase();

  // Verify ownership
  const { data: conv, error } = await sb
    .from("rag_conversations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get messages (rag_messages not in generated types yet)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messages } = await (sb.from("rag_messages") as any)
    .select("id, role, content, thinking, sources, model, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ ...(conv as Record<string, unknown>), messages: messages || [] });
}

/**
 * PATCH /api/rag/conversations/[id] — update title, model, thinking
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { title?: string; model?: string; thinking_enabled?: boolean };
  try { body = await request.json(); } catch { body = {}; }

  const sb = getServiceSupabase();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.model !== undefined) updates.model = body.model;
  if (body.thinking_enabled !== undefined) updates.thinking_enabled = body.thinking_enabled;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from("rag_conversations") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * DELETE /api/rag/conversations/[id] — delete conversation + messages
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sb = getServiceSupabase();

  const { error } = await sb
    .from("rag_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
