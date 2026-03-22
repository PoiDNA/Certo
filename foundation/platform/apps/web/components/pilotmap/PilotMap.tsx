'use client';

import { memo, useState } from 'react';

// EU country codes → approximate SVG positions on a simplified Europe map (0-800 x 0-500)
const COUNTRY_POSITIONS: Record<string, [number, number]> = {
  PT: [120, 340], ES: [170, 320], FR: [250, 280], BE: [280, 230], NL: [285, 210],
  LU: [275, 245], DE: [320, 220], AT: [340, 260], IT: [330, 320], SI: [355, 275],
  HR: [370, 285], MT: [345, 395], CY: [520, 370], GR: [430, 340], BG: [450, 295],
  RO: [440, 265], HU: [385, 260], SK: [380, 240], CZ: [350, 235], PL: [390, 210],
  LT: [410, 165], LV: [410, 145], EE: [415, 120], FI: [415, 80], SE: [360, 100],
  DK: [320, 175], IE: [185, 190],
};

const SECTOR_COLORS: Record<string, string> = {
  publiczny: '#CC9B30',
  prywatny: '#0A1628',
  pozarzadowy: '#8B6914',
};

const SECTOR_LABELS: Record<string, string> = {
  publiczny: 'Sektor publiczny',
  prywatny: 'Sektor prywatny',
  pozarzadowy: 'Sektor pozarządowy',
};

type Application = {
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  created_at: string;
};

function PilotMap({ applications }: { applications: Application[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Group by country for stacking
  const byCountry: Record<string, Application[]> = {};
  applications.forEach((app) => {
    const c = app.country || 'PL';
    if (!byCountry[c]) byCountry[c] = [];
    byCountry[c].push(app);
  });

  return (
    <div className="w-full bg-white rounded-xl border border-certo-navy/10 overflow-hidden">
      <div className="relative">
        <svg viewBox="80 40 500 400" className="w-full h-auto" style={{ minHeight: 300 }}>
          {/* Background */}
          <rect x="80" y="40" width="500" height="400" fill="#F5F0E8" rx="8" />

          {/* Simplified Europe outline — decorative country shapes */}
          <g opacity="0.15" stroke="#0A1628" strokeWidth="0.5" fill="none">
            {/* Scandinavia */}
            <path d="M350,60 L370,50 L380,70 L390,60 L400,80 L420,70 L430,100 L420,130 L410,120 L400,130 L390,110 L380,120 L370,100 L360,110 L350,90 Z" />
            {/* British Isles */}
            <path d="M200,160 L220,150 L230,170 L240,160 L240,200 L230,210 L220,200 L210,210 L200,190 Z" />
            <path d="M175,175 L195,170 L200,190 L195,210 L180,200 Z" />
            {/* Iberia */}
            <path d="M130,290 L200,280 L220,300 L210,340 L190,360 L150,360 L120,340 Z" />
            {/* France */}
            <path d="M220,240 L280,220 L300,240 L290,280 L270,300 L240,310 L220,290 Z" />
            {/* Central Europe */}
            <path d="M280,200 L360,190 L400,200 L400,250 L370,270 L340,260 L310,250 L280,240 Z" />
            {/* Italy */}
            <path d="M310,270 L340,280 L350,310 L340,340 L330,370 L320,360 L310,330 L305,300 Z" />
            {/* Eastern Europe */}
            <path d="M360,170 L430,160 L450,200 L460,250 L450,280 L420,300 L400,270 L380,250 L370,220 Z" />
            {/* Greece */}
            <path d="M410,310 L440,300 L460,320 L450,360 L430,370 L410,350 Z" />
          </g>

          {/* Grid lines */}
          <g stroke="#0A1628" strokeWidth="0.1" opacity="0.1">
            {[100, 200, 300, 400, 500].map((x) => (
              <line key={`v${x}`} x1={x} y1={40} x2={x} y2={440} />
            ))}
            {[100, 200, 300, 400].map((y) => (
              <line key={`h${y}`} x1={80} y1={y} x2={580} y2={y} />
            ))}
          </g>

          {/* Country labels (faint) */}
          {Object.entries(COUNTRY_POSITIONS).map(([code, [x, y]]) => {
            const apps = byCountry[code];
            if (!apps) return (
              <text key={code} x={x} y={y + 4} textAnchor="middle" fontSize="8" fill="#0A1628" opacity="0.15" fontFamily="sans-serif">
                {code}
              </text>
            );
            return null;
          })}

          {/* Application markers */}
          {Object.entries(byCountry).map(([countryCode, apps]) => {
            const pos = COUNTRY_POSITIONS[countryCode];
            if (!pos) return null;

            return apps.map((app, i) => {
              const offsetX = (i % 3) * 12 - 12;
              const offsetY = Math.floor(i / 3) * 12;
              const cx = pos[0] + offsetX;
              const cy = pos[1] + offsetY;
              const color = SECTOR_COLORS[app.sector] || '#CC9B30';

              return (
                <g key={`${countryCode}-${i}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={7}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={2}
                    opacity={0.9}
                    className="cursor-pointer transition-all duration-200 hover:r-9"
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                      if (rect) {
                        setTooltip({
                          x: cx,
                          y: cy - 15,
                          text: `${app.organization_name}${app.city ? ` — ${app.city}` : ''}`,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <text x={cx} y={cy + 3} textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" pointerEvents="none">
                    {countryCode.charAt(0)}
                  </text>
                </g>
              );
            });
          })}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={tooltip.x - 80}
                y={tooltip.y - 18}
                width={160}
                height={22}
                rx={4}
                fill="#0A1628"
                opacity={0.9}
              />
              <text
                x={tooltip.x}
                y={tooltip.y - 4}
                textAnchor="middle"
                fontSize="8"
                fill="white"
                fontFamily="sans-serif"
              >
                {tooltip.text.length > 30 ? tooltip.text.slice(0, 30) + '...' : tooltip.text}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 px-6 py-4 border-t border-certo-navy/5">
        {Object.entries(SECTOR_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-certo-navy/60">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SECTOR_COLORS[key] }} />
            {label}
          </div>
        ))}
        <div className="ml-auto text-xs text-certo-navy/30">
          {applications.length} {applications.length === 1 ? 'podmiot' : 'podmiotów'}
        </div>
      </div>
    </div>
  );
}

export default memo(PilotMap);
