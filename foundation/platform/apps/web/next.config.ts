import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  // Output standalone for Vercel
  output: "standalone",
  
  // Enable MDX if needed later
  pageExtensions: ["tsx", "ts", "mdx", "md"],
  
  // Rewrite API to Supabase if needed
  async rewrites() {
    return [];
  },
};

// @ts-ignore
export default withNextIntl(nextConfig);
