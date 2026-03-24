import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Get the current user session from Supabase Auth cookies.
 * Use in Server Components and API routes.
 * Returns null if not authenticated.
 */
export async function getSession() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value
    || cookieStore.get(`sb-${new URL(url).hostname.split(".")[0]}-auth-token`)?.value;

  if (!accessToken) return null;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return { user, supabase };
}

/**
 * Require authentication. Returns user or null.
 * Pair with redirect in page components.
 */
export async function requireAuth() {
  const session = await getSession();
  return session?.user || null;
}
