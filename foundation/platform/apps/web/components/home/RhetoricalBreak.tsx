'use client';

import { useScrollReveal } from '../shared/useScrollReveal';

export default function RhetoricalBreak({
  question,
  dark = true,
}: {
  question: string;
  dark?: boolean;
}) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className={`w-full py-32 md:py-48 lg:py-64 flex items-center justify-center ${dark ? 'bg-certo-navy' : 'bg-certo-cream'}`}>
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-6 text-center reveal-base ${isVisible ? 'reveal-visible' : ''}`}
      >
        <p className={`text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed ${dark ? 'text-certo-gold' : 'text-certo-navy'}`}>
          {question}
        </p>
      </div>
    </section>
  );
}
