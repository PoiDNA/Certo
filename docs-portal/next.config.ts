import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Vercel
  output: "standalone",
  
  // Enable MDX if needed later
  pageExtensions: ["tsx", "ts", "mdx", "md"],
  
  // Rewrite API to Supabase if needed
  async rewrites() {
    return [];
  },
};

export default nextConfig;
