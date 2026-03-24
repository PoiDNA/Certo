import { tenantConfigSchema, type TenantConfig } from "./types";
import { schoolsTenantConfig } from "./tenants/schools";

/**
 * In-memory tenant configs for static generation (SSG).
 * At runtime, these are fetched from Supabase; for build-time,
 * we use hardcoded configs so pages can be statically generated.
 */
const STATIC_TENANTS: Record<string, TenantConfig> = {
  schools: schoolsTenantConfig,
};

/**
 * Get tenant config by slug.
 * Uses static data for SSG, with Supabase fallback at runtime.
 */
export async function getTenantConfig(
  slug: string
): Promise<TenantConfig | null> {
  // Static/build-time: use hardcoded configs
  const staticConfig = STATIC_TENANTS[slug];
  if (staticConfig) {
    return staticConfig;
  }

  // Runtime: try Supabase (lazy import to avoid issues during build)
  try {
    const { getServiceSupabase } = await import("../rag/supabase");
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("olympiad_tenants")
      .select("config")
      .eq("tenant_slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;

    // Validate with Zod
    const row = data as { config: unknown };
    const parsed = tenantConfigSchema.safeParse(row.config);
    if (!parsed.success) {
      console.error(
        `Invalid TenantConfig for ${slug}:`,
        parsed.error.issues
      );
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Get all active tenant slugs (for generateStaticParams).
 */
export function getActiveTenantSlugs(): string[] {
  return Object.keys(STATIC_TENANTS);
}
