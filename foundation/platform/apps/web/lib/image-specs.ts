/**
 * Image specifications for the Foundation website.
 * Each entry defines a required image with its usage context,
 * dimensions, and an AI prompt for generation/sourcing.
 *
 * Images should be uploaded to R2 as WebP at the specified r2Path.
 */

export interface ImageSpec {
  id: string;
  usage: string;
  dimensions: string;
  aspectRatio: string;
  description: string;
  aiPrompt: string;
  alt: string;
  r2Path: string;
}

export const imageSpecs: ImageSpec[] = [
  {
    id: 'hero-main',
    usage: 'HeroSection — full-viewport background',
    dimensions: '1920x1080',
    aspectRatio: '16:9',
    description: 'Nowoczesny europejski budynek instytucji o zmierzchu',
    aiPrompt: 'Modern European government building at dusk, warm golden lighting, clean contemporary architecture, slight depth of field, cinematic color grading, navy blue sky with warm accent lights, professional institutional atmosphere, no text or people',
    alt: 'Nowoczesny budynek instytucji europejskiej o zmierzchu',
    r2Path: 'foundation/images/site/hero-main.webp',
  },
  {
    id: 'why-governance',
    usage: 'WhySection — governance gap illustration',
    dimensions: '1200x900',
    aspectRatio: '4:3',
    description: 'Obywatele w nowoczesnym urzędzie / konferencja',
    aiPrompt: 'Diverse group of citizens in a modern public service office, some waiting, natural diffused lighting, documentary photography style, neutral warm tones, focus on human expressions, subtle sense of waiting and institutional process',
    alt: 'Obywatele w nowoczesnym urzędzie publicznym',
    r2Path: 'foundation/images/site/why-governance.webp',
  },
  {
    id: 'divider-parliament',
    usage: 'PhotoDivider #1 — European institution panorama',
    dimensions: '2100x900',
    aspectRatio: '21:9',
    description: 'Panorama europejskiego budynku instytucjonalnego',
    aiPrompt: 'Ultra-wide panoramic view of European institutional building exterior, evening golden hour light, majestic columns or modern glass facade, navy blue and gold color tones, architectural photography, no people, clean composition',
    alt: 'Panorama europejskiego budynku instytucjonalnego',
    r2Path: 'foundation/images/site/divider-parliament.webp',
  },
  {
    id: 'founder-portrait',
    usage: 'FounderPreamble — portrait of the Founder',
    dimensions: '800x800',
    aspectRatio: '1:1',
    description: 'Portret Fundatorki — prawdziwe zdjęcie do dostarczenia',
    aiPrompt: 'DO NOT GENERATE — use actual photograph of the Founder. Placeholder: Professional portrait, mature female executive, neutral background, confident and warm expression, business attire',
    alt: 'Elżbieta Maria Kuc — Fundatorka Certo Governance Institute',
    r2Path: 'foundation/images/site/founder-portrait.webp',
  },
  {
    id: 'data-analysis',
    usage: 'ScrollRevealSection — Certo Fact DeNoiser background',
    dimensions: '1920x1080',
    aspectRatio: '16:9',
    description: 'Wizualizacja danych i analityka',
    aiPrompt: 'Abstract data visualization on dark screens, blue and gold color palette, modern office background with depth of field, flowing data streams and network graphs, technological but elegant, no text overlays',
    alt: 'Wizualizacja danych analitycznych',
    r2Path: 'foundation/images/site/data-analysis.webp',
  },
  {
    id: 'divider-collaboration',
    usage: 'PhotoDivider #2 — academic/professional collaboration',
    dimensions: '2100x900',
    aspectRatio: '21:9',
    description: 'Profesorowie i profesjonaliści przy stole roboczym',
    aiPrompt: 'University professors and professionals collaborating at a workshop table, natural daylight from windows, warm tones, documents and laptops on table, engaged discussion, scholarly atmosphere, ultra-wide composition',
    alt: 'Profesjonaliści przy stole roboczym w atmosferze współpracy',
    r2Path: 'foundation/images/site/divider-collaboration.webp',
  },
  {
    id: 'pilot-hero',
    usage: 'Pilot page — hero background',
    dimensions: '1920x800',
    aspectRatio: '12:5',
    description: 'Wschód słońca nad instytucją — nowe początki',
    aiPrompt: 'Sunrise over modern institutional building, hopeful atmosphere, clean architectural lines, warm golden light breaking through, morning mist, symbolic of new beginnings and transparency',
    alt: 'Wschód słońca nad nowoczesnym budynkiem instytucji',
    r2Path: 'foundation/images/site/pilot-hero.webp',
  },
  {
    id: 'experts-hero',
    usage: 'Experts page — header background',
    dimensions: '1920x800',
    aspectRatio: '12:5',
    description: 'Ręce przeglądające dokumenty governance',
    aiPrompt: 'Close-up of hands reviewing governance documents on a desk, professional setting, warm lighting, scholarly atmosphere, selective focus, papers and pen visible, no faces, emphasis on expertise and careful analysis',
    alt: 'Ręce przeglądające dokumenty dotyczące zarządzania',
    r2Path: 'foundation/images/site/experts-hero.webp',
  },
];
