'use client';

import { memo, useState, useEffect } from 'react';

// EU country ISO codes
const EU_COUNTRIES = new Set([
  'POL','AUT','BEL','BGR','HRV','CYP','CZE','DNK','EST','FIN',
  'FRA','DEU','GRC','HUN','IRL','ITA','LVA','LTU','LUX','MLT',
  'NLD','PRT','ROU','SVK','SVN','ESP','SWE',
]);

// ISO Alpha-3 → Alpha-2 mapping for our data
const ISO3_TO_ISO2: Record<string, string> = {
  POL:'PL',AUT:'AT',BEL:'BE',BGR:'BG',HRV:'HR',CYP:'CY',CZE:'CZ',
  DNK:'DK',EST:'EE',FIN:'FI',FRA:'FR',DEU:'DE',GRC:'GR',HUN:'HU',
  IRL:'IE',ITA:'IT',LVA:'LV',LTU:'LT',LUX:'LU',MLT:'MT',NLD:'NL',
  PRT:'PT',ROU:'RO',SVK:'SK',SVN:'SI',ESP:'ES',SWE:'SE',
};

// Country centroids for markers [lng, lat]
const COUNTRY_COORDS: Record<string, [number, number]> = {
  PL:[19.4,52.0],AT:[13.3,47.5],BE:[4.4,50.8],BG:[25.5,42.7],
  HR:[15.5,45.1],CY:[33.4,35.1],CZ:[15.5,49.8],DK:[9.5,56.3],
  EE:[25.0,58.6],FI:[25.7,61.9],FR:[2.2,46.6],DE:[10.4,51.2],
  GR:[21.8,39.1],HU:[19.5,47.2],IE:[-8.2,53.4],IT:[12.6,41.9],
  LV:[24.6,56.9],LT:[23.9,55.2],LU:[6.1,49.8],MT:[14.4,35.9],
  NL:[5.3,52.1],PT:[-8.2,39.4],RO:[24.7,45.9],SK:[19.7,48.7],
  SI:[14.5,46.2],ES:[-3.7,40.4],SE:[18.6,60.1],
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

type GeoFeature = {
  type: string;
  properties: { name: string; [k: string]: unknown };
  geometry: { type: string; coordinates: number[][][][] | number[][][] };
  id?: string;
};

// Mercator projection helpers
function project(lng: number, lat: number, cx: number, cy: number, scale: number): [number, number] {
  const x = (lng - cx) * scale;
  const latRad = (lat * Math.PI) / 180;
  const mercY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const cyRad = (cy * Math.PI) / 180;
  const mercCy = Math.log(Math.tan(Math.PI / 4 + cyRad / 2));
  const y = -(mercY - mercCy) * scale * (180 / Math.PI);
  return [400 + x, 300 + y];
}

function coordsToPath(
  coords: number[][],
  cx: number,
  cy: number,
  scale: number
): string {
  return coords
    .map((pt, i) => {
      const [x, y] = project(pt[0], pt[1], cx, cy, scale);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ') + 'Z';
}

function PilotMap({ applications }: { applications: Application[] }) {
  const [paths, setPaths] = useState<{ id: string; d: string; isEU: boolean }[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const cx = 15;
  const cy = 52;
  const scale = 9.5;

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then((r) => r.json())
      .then((topology) => {
        // Convert TopoJSON to GeoJSON manually
        const geometries = topology.objects.countries.geometries;
        const arcs = topology.arcs;
        const tf = topology.transform;

        function decodeArc(arcIdx: number): number[][] {
          const isReversed = arcIdx < 0;
          const idx = isReversed ? ~arcIdx : arcIdx;
          const arc = arcs[idx];
          const coords: number[][] = [];
          let x = 0, y = 0;
          for (const [dx, dy] of arc) {
            x += dx;
            y += dy;
            coords.push([
              x * tf.scale[0] + tf.translate[0],
              y * tf.scale[1] + tf.translate[1],
            ]);
          }
          return isReversed ? coords.reverse() : coords;
        }

        function decodeRing(ring: number[]): number[][] {
          const points: number[][] = [];
          for (const arcIdx of ring) {
            const decoded = decodeArc(arcIdx);
            // Skip first point of subsequent arcs (shared with previous arc's last point)
            points.push(...(points.length > 0 ? decoded.slice(1) : decoded));
          }
          return points;
        }

        const result: { id: string; d: string; isEU: boolean }[] = [];

        for (const geo of geometries) {
          const id = geo.id || '';
          const isEU = EU_COUNTRIES.has(id);

          if (geo.type === 'Polygon') {
            const rings = geo.arcs as number[][];
            const d = rings
              .map((ring: number[]) => coordsToPath(decodeRing(ring), cx, cy, scale))
              .join(' ');
            result.push({ id, d, isEU });
          } else if (geo.type === 'MultiPolygon') {
            const polys = geo.arcs as number[][][];
            const d = polys
              .map((poly: number[][]) =>
                poly.map((ring: number[]) => coordsToPath(decodeRing(ring), cx, cy, scale)).join(' ')
              )
              .join(' ');
            result.push({ id, d, isEU });
          }
        }

        setPaths(result);
      })
      .catch(console.error);
  }, []);

  // Group applications by country
  const byCountry: Record<string, Application[]> = {};
  applications.forEach((app) => {
    const c = app.country || 'PL';
    if (!byCountry[c]) byCountry[c] = [];
    byCountry[c].push(app);
  });

  return (
    <div className="w-full bg-white rounded-xl border border-certo-navy/10 overflow-hidden">
      <div className="relative">
        <svg
          viewBox="100 50 600 500"
          className="w-full h-auto"
          style={{ minHeight: 350, background: '#F5F0E8' }}
        >
          {/* Country shapes */}
          {paths.map(({ id, d, isEU }) => {
            const iso2 = ISO3_TO_ISO2[id];
            const isHovered = hoveredCountry === iso2;
            const hasApps = iso2 && byCountry[iso2];

            return (
              <path
                key={id}
                d={d}
                fill={isEU ? (isHovered ? '#D4C9B0' : '#E2DAC8') : '#EEEAE2'}
                stroke={isEU ? '#C4B89C' : '#DDD8CE'}
                strokeWidth={isEU ? 0.8 : 0.3}
                className={isEU ? 'transition-colors duration-200' : ''}
                onMouseEnter={() => iso2 && setHoveredCountry(iso2)}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: hasApps ? 'pointer' : 'default' }}
              />
            );
          })}

          {/* Application markers */}
          {Object.entries(byCountry).map(([countryCode, apps]) => {
            const coords = COUNTRY_COORDS[countryCode];
            if (!coords) return null;

            return apps.map((app, i) => {
              const offsetX = (i % 4) * 8 - 12;
              const offsetY = Math.floor(i / 4) * 8;
              const [px, py] = project(coords[0] + offsetX * 0.15, coords[1] - offsetY * 0.1, cx, cy, scale);
              const color = SECTOR_COLORS[app.sector] || '#CC9B30';

              return (
                <circle
                  key={`${countryCode}-${i}`}
                  cx={px}
                  cy={py}
                  r={6}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  opacity={0.9}
                  className="cursor-pointer hover:opacity-100"
                  onMouseEnter={(e) => {
                    const svg = (e.target as SVGElement).closest('svg');
                    if (svg) {
                      setTooltip({
                        x: px,
                        y: py - 16,
                        text: `${app.organization_name}${app.city ? ` — ${app.city}` : ''}`,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            });
          })}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={tooltip.x - 90}
                y={tooltip.y - 16}
                width={180}
                height={20}
                rx={4}
                fill="#0A1628"
                opacity={0.92}
              />
              <text
                x={tooltip.x}
                y={tooltip.y - 3}
                textAnchor="middle"
                fontSize="9"
                fill="white"
                fontFamily="system-ui, sans-serif"
              >
                {tooltip.text.length > 35 ? tooltip.text.slice(0, 35) + '…' : tooltip.text}
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
