'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollReveal } from '../shared/useScrollReveal';

const pillars = [
  { key: '1', weight: 25, color: '#CC9B30', hoverColor: '#E5B04A' },
  { key: '2', weight: 25, color: '#B8891A', hoverColor: '#D4A030' },
  { key: '3', weight: 25, color: '#0A1628', hoverColor: '#1A2A45' },
  { key: '4', weight: 25, color: '#2A3F5F', hoverColor: '#3A5580' },
];

function getDonutPaths(data: typeof pillars, innerRadius: number, outerRadius: number) {
  const total = data.reduce((s, d) => s + d.weight, 0);
  const paths: { d: string; key: string; midAngle: number; weight: number; color: string; hoverColor: string }[] = [];
  let cumulative = 0;
  const gap = 0.02; // small gap between segments

  data.forEach((item) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2 + gap;
    cumulative += item.weight;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2 - gap;
    const midAngle = (startAngle + endAngle) / 2;

    const x1o = Math.cos(startAngle) * outerRadius;
    const y1o = Math.sin(startAngle) * outerRadius;
    const x2o = Math.cos(endAngle) * outerRadius;
    const y2o = Math.sin(endAngle) * outerRadius;
    const x1i = Math.cos(endAngle) * innerRadius;
    const y1i = Math.sin(endAngle) * innerRadius;
    const x2i = Math.cos(startAngle) * innerRadius;
    const y2i = Math.sin(startAngle) * innerRadius;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1o} ${y1o}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      'Z',
    ].join(' ');

    paths.push({ d, key: item.key, midAngle, weight: item.weight, color: item.color, hoverColor: item.hoverColor });
  });

  return paths;
}

export default function PillarsSection() {
  const t = useTranslations('Rating');
  const { ref, isVisible } = useScrollReveal();
  const [active, setActive] = useState<number | null>(null);

  const outerR = 140;
  const innerR = 85;
  const paths = getDonutPaths(pillars, innerR, outerR);
  const activePillar = active !== null ? pillars[active] : null;

  return (
    <section ref={ref} className={`mb-20 reveal-base ${isVisible ? 'reveal-visible' : ''}`}>
      <h2 className="text-3xl font-serif font-bold text-certo-fg mb-10 text-center">
        {t('pillars_title')}
      </h2>

      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Donut chart */}
        <div className="relative shrink-0">
          <svg
            viewBox="-160 -160 320 320"
            className="w-[280px] h-[280px] md:w-[340px] md:h-[340px]"
            role="img"
            aria-label="Wykres kołowy filarów ratingu"
          >
            {paths.map((path, i) => (
              <path
                key={path.key}
                d={path.d}
                fill={active === i ? path.hoverColor : path.color}
                className="cursor-pointer transition-all duration-300"
                style={{
                  transform: active === i ? `scale(1.06)` : 'scale(1)',
                  transformOrigin: '0 0',
                  filter: active === i ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' : 'none',
                }}
                onClick={() => setActive(active === i ? null : i)}
                onMouseEnter={() => setActive(i)}
              />
            ))}
            {/* Center text */}
            <text
              x="0"
              y={active !== null ? '-12' : '0'}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-certo-fg font-serif font-bold"
              fontSize={active !== null ? '28' : '16'}
            >
              {active !== null ? `${pillars[active].weight}%` : '100%'}
            </text>
            {active !== null && (
              <text
                x="0"
                y="16"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-certo-fg-muted"
                fontSize="10"
              >
                {t(`pillar_${pillars[active].key}_name`)}
              </text>
            )}
          </svg>
        </div>

        {/* Details panel */}
        <div className="flex-1 w-full">
          {active !== null && activePillar ? (
            <div className="animate-fadeIn">
              <div className="flex items-baseline gap-4 mb-4">
                <span
                  className="text-5xl md:text-6xl font-serif font-bold leading-none"
                  style={{ color: activePillar.color }}
                >
                  {activePillar.weight}%
                </span>
                <h3 className="font-serif font-extrabold text-certo-fg text-2xl md:text-3xl">
                  {t(`pillar_${activePillar.key}_name`)}
                </h3>
              </div>
              <p className="text-base md:text-lg text-certo-fg-muted leading-relaxed">
                {t(`pillar_${activePillar.key}_desc`)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pillars.map((pillar, i) => (
                <button
                  key={pillar.key}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-lg bg-certo-card border border-certo-card-border hover:border-certo-gold/30 transition-all duration-200"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: pillar.color }}
                  />
                  <span className="font-serif font-bold text-certo-fg text-base flex-1">
                    {t(`pillar_${pillar.key}_name`)}
                  </span>
                  <span className="text-sm font-bold text-certo-fg-muted">
                    {pillar.weight}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {active !== null && (
            <button
              onClick={() => setActive(null)}
              className="mt-6 text-sm text-certo-gold-text hover:text-certo-gold transition-colors underline underline-offset-2 decoration-certo-gold-text/30 hover:decoration-certo-gold"
            >
              ← {t('pillars_title')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
