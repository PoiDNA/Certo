'use client';

import { useScrollReveal } from '../shared/useScrollReveal';

export default function ScrollRevealSection({
  imageUrl,
  alt,
  children,
  overlay = 'bg-certo-navy/80',
}: {
  imageUrl?: string;
  alt: string;
  children: React.ReactNode;
  overlay?: string;
}) {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section
      className="relative w-full min-h-[60vh] flex items-center bg-fixed-cover"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      {/* Fallback bg when no image */}
      {!imageUrl && <div className="absolute inset-0 bg-certo-surface" />}

      <div className={`absolute inset-0 ${overlay}`} />

      <div
        ref={ref}
        className={`relative z-10 w-full max-w-4xl mx-auto px-6 py-20 md:py-32 reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        {children}
      </div>
    </section>
  );
}
