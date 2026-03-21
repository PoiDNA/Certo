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
      {
        source: '/:locale/methodology',
        destination: '/:locale/ratings',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

// @ts-ignore
export default withNextIntl(nextConfig);
