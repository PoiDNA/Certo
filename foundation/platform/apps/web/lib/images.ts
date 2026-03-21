/**
 * R2 image URLs for the Foundation website.
 * All images served from Cloudflare R2 CDN.
 */

const R2 = 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1';

export const images = {
  heroMain: `${R2}/Certo_1_kero-main-1920-1980.png`,
  whyGovernance: `${R2}/Cero_2__why-governance.png`,
  dividerParliament: `${R2}/3.1%20divider-parliament.png`,
  founderPortrait: `${R2}/4.%20-%20founder-portrait.png`,
  dataAnalysis: `${R2}/5.1%20data-analysis.png`,
  dividerCollaboration: `${R2}/6.1%20divider-collaboration.png`,
  pilotHero: `${R2}/7.%20pilot-hero.png`,
  expertsHero: `${R2}/8.%20experts-hero.png`,
} as const;
