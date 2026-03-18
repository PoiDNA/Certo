import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  // Output standalone for Vercel
  output: "standalone",
  
  // Enable MDX if needed later
  pageExtensions: ["tsx", "ts", "mdx", "md"],
  
  async redirects() {
    return [
      {
        source: '/:locale/pp',
        destination: '/:locale/privacy',
        permanent: true,
      },
    ];
  },
};

// @ts-ignore
export default withNextIntl(nextConfig);
