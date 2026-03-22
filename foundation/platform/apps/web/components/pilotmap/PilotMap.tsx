'use client';

import { memo, useState, useEffect, useRef } from 'react';

const EU_COUNTRIES = new Set([
  'POL','AUT','BEL','BGR','HRV','CYP','CZE','DNK','EST','FIN',
  'FRA','DEU','GRC','HUN','IRL','ITA','LVA','LTU','LUX','MLT',
  'NLD','PRT','ROU','SVK','SVN','ESP','SWE',
]);

const ISO3_TO_ISO2: Record<string, string> = {
  POL:'PL',AUT:'AT',BEL:'BE',BGR:'BG',HRV:'HR',CYP:'CY',CZE:'CZ',
  DNK:'DK',EST:'EE',FIN:'FI',FRA:'FR',DEU:'DE',GRC:'GR',HUN:'HU',
  IRL:'IE',ITA:'IT',LVA:'LV',LTU:'LT',LUX:'LU',MLT:'MT',NLD:'NL',
  PRT:'PT',ROU:'RO',SVK:'SK',SVN:'SI',ESP:'ES',SWE:'SE',
};

// Country label positions [lng, lat]
const COUNTRY_LABELS: Record<string, { pos: [number, number]; name: string }> = {
  PL: { pos: [19.4, 52.0], name: 'PL' },
  AT: { pos: [13.3, 47.5], name: 'AT' },
  BE: { pos: [4.4, 50.8], name: 'BE' },
  BG: { pos: [25.5, 42.7], name: 'BG' },
  HR: { pos: [15.5, 45.1], name: 'HR' },
  CY: { pos: [33.4, 35.1], name: 'CY' },
  CZ: { pos: [15.5, 49.8], name: 'CZ' },
  DK: { pos: [9.5, 56.3], name: 'DK' },
  EE: { pos: [25.0, 58.6], name: 'EE' },
  FI: { pos: [25.7, 61.9], name: 'FI' },
  FR: { pos: [2.2, 46.6], name: 'FR' },
  DE: { pos: [10.4, 51.2], name: 'DE' },
  GR: { pos: [21.8, 39.1], name: 'GR' },
  HU: { pos: [19.5, 47.2], name: 'HU' },
  IE: { pos: [-8.2, 53.4], name: 'IE' },
  IT: { pos: [12.6, 41.9], name: 'IT' },
  LV: { pos: [24.6, 56.9], name: 'LV' },
  LT: { pos: [23.9, 55.2], name: 'LT' },
  LU: { pos: [6.1, 49.8], name: 'LU' },
  MT: { pos: [14.4, 35.9], name: 'MT' },
  NL: { pos: [5.3, 52.1], name: 'NL' },
  PT: { pos: [-8.2, 39.4], name: 'PT' },
  RO: { pos: [24.7, 45.9], name: 'RO' },
  SK: { pos: [19.7, 48.7], name: 'SK' },
  SI: { pos: [14.5, 46.2], name: 'SI' },
  ES: { pos: [-3.7, 40.4], name: 'ES' },
  SE: { pos: [18.6, 60.1], name: 'SE' },
};

// Known city coordinates [lng, lat] for precise placement
const CITY_COORDS: Record<string, [number, number]> = {
  'warszawa': [21.01, 52.23], 'kraków': [19.94, 50.06], 'wrocław': [17.04, 51.10],
  'gdańsk': [18.65, 54.35], 'poznań': [16.93, 52.41], 'łódź': [19.46, 51.77],
  'katowice': [19.02, 50.26], 'lublin': [22.57, 51.25], 'szczecin': [14.55, 53.43],
  'bydgoszcz': [18.00, 53.12], 'białystok': [23.16, 53.13], 'rzeszów': [22.00, 50.04],
  'toruń': [18.60, 53.01], 'kielce': [20.63, 50.87], 'olsztyn': [20.48, 53.78],
  'opole': [17.93, 50.67], 'zielona góra': [15.51, 51.94], 'gorzów wielkopolski': [15.23, 52.73],
  // Major EU cities
  'berlin': [13.40, 52.52], 'münchen': [11.58, 48.14], 'hamburg': [9.99, 53.55],
  'paris': [2.35, 48.86], 'lyon': [4.83, 45.76], 'marseille': [5.37, 43.30],
  'madrid': [-3.70, 40.42], 'barcelona': [2.17, 41.39],
  'roma': [12.50, 41.90], 'milano': [9.19, 45.46],
  'amsterdam': [4.90, 52.37], 'bruxelles': [4.35, 50.85], 'brussels': [4.35, 50.85],
  'wien': [16.37, 48.21], 'vienna': [16.37, 48.21],
  'praha': [14.42, 50.08], 'prague': [14.42, 50.08],
  'budapest': [19.04, 47.50], 'bucuresti': [26.10, 44.43], 'bucharest': [26.10, 44.43],
  'sofia': [23.32, 42.70], 'zagreb': [15.98, 45.81],
  'lisboa': [-9.14, 38.74], 'lisbon': [-9.14, 38.74],
  'stockholm': [18.07, 59.33], 'helsinki': [24.94, 60.17],
  'tallinn': [24.75, 59.44], 'riga': [24.11, 56.95], 'vilnius': [25.28, 54.69],
  'dublin': [-6.26, 53.35], 'copenhagen': [12.57, 55.68], 'københavn': [12.57, 55.68],
  'bratislava': [17.11, 48.14], 'ljubljana': [14.51, 46.06],
  'athens': [23.73, 37.98], 'ateny': [23.73, 37.98],
  'valletta': [14.51, 35.90], 'nicosia': [33.38, 35.17],
  'luxembourg': [6.13, 49.61], 'luksemburg': [6.13, 49.61],
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
  id: string;
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  created_at: string;
  votes: number;
};

// Mercator projection
function project(lng: number, lat: number, cx: number, cy: number, scale: number): [number, number] {
  const x = (lng - cx) * scale;
  const latRad = (lat * Math.PI) / 180;
  const mercY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const cyRad = (cy * Math.PI) / 180;
  const mercCy = Math.log(Math.tan(Math.PI / 4 + cyRad / 2));
  const y = -(mercY - mercCy) * scale * (180 / Math.PI);
  return [400 + x, 300 + y];
}

function coordsToPath(coords: number[][], cx: number, cy: number, scale: number): string {
  return coords
    .map((pt, i) => {
      const [x, y] = project(pt[0], pt[1], cx, cy, scale);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ') + 'Z';
}

function getMarkerPosition(app: Application, cx: number, cy: number, scale: number): [number, number] | null {
  // Try city first
  if (app.city) {
    const cityKey = app.city.toLowerCase().trim();
    const cityCoord = CITY_COORDS[cityKey];
    if (cityCoord) return project(cityCoord[0], cityCoord[1], cx, cy, scale);
  }
  // Fallback to country center
  if (app.country) {
    const label = COUNTRY_LABELS[app.country];
    if (label) return project(label.pos[0], label.pos[1], cx, cy, scale);
  }
  return null;
}

// Country zoom presets: [centerLng, centerLat, scale]
const COUNTRY_ZOOMS: Record<string, { center: [number, number]; scale: number; name: string }> = {
  EU: { center: [15, 52], scale: 9.5, name: 'Europa' },
  PL: { center: [19.4, 51.9], scale: 28, name: 'Polska' },
  DE: { center: [10.4, 51.2], scale: 22, name: 'Niemcy' },
  FR: { center: [2.5, 46.6], scale: 18, name: 'Francja' },
  ES: { center: [-3.7, 40.0], scale: 18, name: 'Hiszpania' },
  IT: { center: [12.6, 42.5], scale: 20, name: 'Włochy' },
  NL: { center: [5.3, 52.1], scale: 45, name: 'Holandia' },
  BE: { center: [4.4, 50.5], scale: 50, name: 'Belgia' },
  AT: { center: [13.3, 47.5], scale: 30, name: 'Austria' },
  CZ: { center: [15.5, 49.8], scale: 32, name: 'Czechy' },
  SE: { center: [16.0, 62.0], scale: 12, name: 'Szwecja' },
  FI: { center: [26.0, 64.0], scale: 12, name: 'Finlandia' },
  RO: { center: [24.7, 45.9], scale: 22, name: 'Rumunia' },
  GR: { center: [22.0, 39.0], scale: 22, name: 'Grecja' },
  HU: { center: [19.5, 47.2], scale: 32, name: 'Węgry' },
  PT: { center: [-8.2, 39.4], scale: 22, name: 'Portugalia' },
  BG: { center: [25.5, 42.7], scale: 28, name: 'Bułgaria' },
  HR: { center: [15.5, 45.1], scale: 28, name: 'Chorwacja' },
  SK: { center: [19.7, 48.7], scale: 35, name: 'Słowacja' },
  DK: { center: [9.5, 56.0], scale: 28, name: 'Dania' },
  IE: { center: [-8.0, 53.4], scale: 22, name: 'Irlandia' },
  LT: { center: [23.9, 55.2], scale: 30, name: 'Litwa' },
  LV: { center: [24.6, 56.9], scale: 32, name: 'Łotwa' },
  EE: { center: [25.0, 58.8], scale: 35, name: 'Estonia' },
  SI: { center: [14.5, 46.1], scale: 42, name: 'Słowenia' },
  LU: { center: [6.1, 49.8], scale: 70, name: 'Luksemburg' },
  CY: { center: [33.4, 35.1], scale: 45, name: 'Cypr' },
  MT: { center: [14.4, 35.9], scale: 80, name: 'Malta' },
};

function PilotMap({ applications }: { applications: Application[] }) {
  const [paths, setPaths] = useState<{ id: string; d: string; isEU: boolean; iso2: string }[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; city: string; sector: string; date: string } | null>(null);
  const [zoom, setZoom] = useState<string>('EU');
  const [spiderfied, setSpiderfied] = useState<number | null>(null); // cluster index that is expanded
  const svgRef = useRef<SVGSVGElement>(null);

  // Always render paths with Europe-level projection
  const baseCx = 15;
  const baseCy = 52;
  const baseScale = 9.5;

  // For markers and labels, use same base projection
  const cx = baseCx;
  const cy = baseCy;
  const scale = baseScale;

  // Compute viewBox based on zoom level
  const europeViewBox = { x: 100, y: 50, w: 600, h: 500 };
  const computeViewBox = () => {
    if (zoom === 'EU') return europeViewBox;
    const view = COUNTRY_ZOOMS[zoom];
    if (!view) return europeViewBox;
    const [svgX, svgY] = project(view.center[0], view.center[1], baseCx, baseCy, baseScale);
    // More aggressive zoom — halve the ratio for bigger country view
    const zoomRatio = (baseScale / view.scale) * 0.6;
    const w = 600 * zoomRatio;
    const h = 500 * zoomRatio;
    return { x: svgX - w / 2, y: svgY - h / 2, w, h };
  };
  const vb = computeViewBox();

  // Countries that have applications
  const countriesWithApps = new Set(applications.map((a) => a.country).filter(Boolean));

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then((r) => r.json())
      .then((topology) => {
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
            x += dx; y += dy;
            coords.push([x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]]);
          }
          return isReversed ? coords.reverse() : coords;
        }

        function decodeRing(ring: number[]): number[][] {
          const points: number[][] = [];
          for (const arcIdx of ring) {
            const decoded = decodeArc(arcIdx);
            points.push(...(points.length > 0 ? decoded.slice(1) : decoded));
          }
          return points;
        }

        const result: { id: string; d: string; isEU: boolean; iso2: string }[] = [];
        for (const geo of geometries) {
          const id = geo.id || '';
          const isEU = EU_COUNTRIES.has(id);
          const iso2 = ISO3_TO_ISO2[id] || '';

          let d = '';
          if (geo.type === 'Polygon') {
            d = (geo.arcs as number[][]).map((ring: number[]) => coordsToPath(decodeRing(ring), cx, cy, scale)).join(' ');
          } else if (geo.type === 'MultiPolygon') {
            d = (geo.arcs as number[][][]).map((poly: number[][]) =>
              poly.map((ring: number[]) => coordsToPath(decodeRing(ring), cx, cy, scale)).join(' ')
            ).join(' ');
          }
          if (d) result.push({ id, d, isEU, iso2 });
        }
        setPaths(result);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="w-full bg-white rounded-xl border border-certo-navy/10 overflow-hidden relative">
      {/* Zoom controls */}
      <div className="px-4 py-3 border-b border-certo-navy/5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setZoom('EU')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            zoom === 'EU' ? 'bg-certo-navy text-white' : 'bg-certo-navy/5 text-certo-navy/60 hover:bg-certo-navy/10'
          }`}
        >
          🌍 Europa
        </button>
        <span className="text-certo-navy/20 text-xs">|</span>
        {Object.entries(COUNTRY_ZOOMS)
          .filter(([code]) => code !== 'EU' && !code.startsWith('_custom'))
          .sort((a, b) => a[1].name.localeCompare(b[1].name))
          .map(([code, { name }]) => {
            const hasApps = countriesWithApps.has(code);
            return (
              <button
                key={code}
                onClick={() => setZoom(code)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  zoom === code
                    ? 'bg-certo-gold text-white'
                    : hasApps
                      ? 'bg-certo-gold/10 text-certo-gold hover:bg-certo-gold/20 font-medium'
                      : 'text-certo-navy/30 hover:text-certo-navy/50 hover:bg-certo-navy/5'
                }`}
              >
                {name}
              </button>
            );
          })}
      </div>

      <svg
        ref={svgRef}
        viewBox={`${vb.x.toFixed(0)} ${vb.y.toFixed(0)} ${vb.w.toFixed(0)} ${vb.h.toFixed(0)}`}
        className="w-full h-auto transition-all duration-500"
        style={{ minHeight: 350, background: '#F8F5EE' }}
        onClick={() => { if (spiderfied !== null) setSpiderfied(null); }}
      >
        {/* Country shapes */}
        {paths.map(({ id, d, isEU, iso2 }) => (
          <path
            key={id}
            d={d}
            fill={isEU ? (zoom === iso2 ? '#D8CEB8' : '#E8E0D0') : '#F0ECE4'}
            stroke={isEU ? '#C8BBAA' : '#E0DCD4'}
            strokeWidth={isEU ? 0.8 : 0.3}
            onClick={() => isEU && iso2 && COUNTRY_ZOOMS[iso2] && setZoom(zoom === iso2 ? 'EU' : iso2)}
            className={isEU ? 'cursor-pointer hover:fill-[#D8CEB8] transition-colors duration-200' : ''}
          />
        ))}

        {/* EU country labels */}
        {Object.entries(COUNTRY_LABELS).map(([iso2, { pos, name }]) => {
          const [x, y] = project(pos[0], pos[1], cx, cy, scale);
          return (
            <text
              key={iso2}
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontSize="7"
              fill="#0A1628"
              opacity="0.25"
              fontFamily="system-ui, sans-serif"
              fontWeight="600"
            >
              {name}
            </text>
          );
        })}

        {/* Clustered application markers */}
        {(() => {
          // Cluster nearby markers — scale radius with viewBox so clusters split when zoomed
          const viewRatio = vb.w / europeViewBox.w; // <1 when zoomed in
          const CLUSTER_RADIUS = (zoom === 'EU' ? 15 : 10) * viewRatio;
          type Cluster = { cx: number; cy: number; apps: typeof applications };
          const clusters: Cluster[] = [];

          applications.forEach((app) => {
            const pos = getMarkerPosition(app, cx, cy, scale);
            if (!pos) return;

            const nearby = clusters.find((c) => {
              const dx = c.cx - pos[0];
              const dy = c.cy - pos[1];
              return Math.sqrt(dx * dx + dy * dy) < CLUSTER_RADIUS;
            });

            if (nearby) {
              nearby.apps.push(app);
              nearby.cx = (nearby.cx * (nearby.apps.length - 1) + pos[0]) / nearby.apps.length;
              nearby.cy = (nearby.cy * (nearby.apps.length - 1) + pos[1]) / nearby.apps.length;
            } else {
              clusters.push({ cx: pos[0], cy: pos[1], apps: [app] });
            }
          });

          // Check if a cluster's apps all share the same position (can't split by zooming)
          function clusterIsSamePosition(cluster: Cluster): boolean {
            if (cluster.apps.length <= 1) return false;
            const positions = cluster.apps.map((a) => getMarkerPosition(a, cx, cy, scale)).filter(Boolean) as [number, number][];
            if (positions.length <= 1) return true;
            const [x0, y0] = positions[0];
            return positions.every(([x, y]) => Math.abs(x - x0) < 0.5 && Math.abs(y - y0) < 0.5);
          }

          // Spider layout: spread N points in a circle around center
          const SPIDER_RADIUS = vb.w * 0.06; // relative to viewBox width
          function spiderPositions(centerX: number, centerY: number, count: number): [number, number][] {
            return Array.from({ length: count }, (_, i) => {
              const angle = (2 * Math.PI * i) / count - Math.PI / 2;
              return [
                centerX + Math.cos(angle) * SPIDER_RADIUS,
                centerY + Math.sin(angle) * SPIDER_RADIUS,
              ];
            });
          }

          return clusters.map((cluster, ci) => {
            const count = cluster.apps.length;
            const isMulti = count > 1;
            const mainApp = cluster.apps[0];
            const color = isMulti ? '#CC9B30' : (SECTOR_COLORS[mainApp.sector] || '#CC9B30');
            const r = isMulti ? Math.min(4 + count * 2, 12) : 4;
            const isSpiderfied = spiderfied === ci;
            const samePos = isMulti && clusterIsSamePosition(cluster);

            // Spiderfied view: show individual markers spread in circle
            if (isSpiderfied && isMulti) {
              const positions = spiderPositions(cluster.cx, cluster.cy, count);
              const markerR = 4;
              return (
                <g key={`cluster-${ci}`}>
                  {/* Spider legs — lines from center to each marker */}
                  {positions.map(([sx, sy], si) => (
                    <line
                      key={`leg-${si}`}
                      x1={cluster.cx} y1={cluster.cy}
                      x2={sx} y2={sy}
                      stroke="#CC9B30" strokeWidth={0.5} opacity={0.4}
                    />
                  ))}
                  {/* Center dot */}
                  <circle cx={cluster.cx} cy={cluster.cy} r={2} fill="#CC9B30" opacity={0.3} />
                  {/* Individual markers */}
                  {cluster.apps.map((app, ai) => {
                    const [sx, sy] = positions[ai];
                    const appColor = SECTOR_COLORS[app.sector] || '#CC9B30';
                    return (
                      <circle
                        key={`spider-${ai}`}
                        cx={sx} cy={sy} r={markerR}
                        fill={appColor} stroke="#fff" strokeWidth={1.5}
                        className="cursor-pointer"
                        onMouseEnter={() => setTooltip({
                          x: sx, y: sy - markerR,
                          name: app.organization_name,
                          city: app.city || '',
                          sector: SECTOR_LABELS[app.sector] || app.sector,
                          date: new Date(app.created_at).toLocaleDateString('pl-PL'),
                        })}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    );
                  })}
                </g>
              );
            }

            return (
              <g key={`cluster-${ci}`}>
                {/* Pulse ring for clusters */}
                {isMulti && (
                  <circle cx={cluster.cx} cy={cluster.cy} r={r + 6} fill={color} opacity={0.1}>
                    <animate attributeName="r" values={`${r + 3};${r + 8};${r + 3}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.03;0.15" dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Marker circle */}
                <circle
                  cx={cluster.cx}
                  cy={cluster.cy}
                  r={r}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  className="cursor-pointer"
                  onClick={() => {
                    if (isMulti) {
                      // If all apps share the same position, spiderfy instead of zooming
                      if (samePos) {
                        setSpiderfied(ci);
                        return;
                      }
                      const country = mainApp.country;
                      if (zoom === 'EU' && country && COUNTRY_ZOOMS[country]) {
                        setSpiderfied(null);
                        setZoom(country);
                      } else {
                        const currentView = COUNTRY_ZOOMS[zoom] || COUNTRY_ZOOMS.EU;
                        const MAX_SCALE = 200;
                        if (currentView.scale >= MAX_SCALE) {
                          // At max zoom and still clustered — spiderfy
                          setSpiderfied(ci);
                          return;
                        }
                        const [lng, lat] = [
                          (cluster.cx - 400) / scale + cx,
                          cy - ((cluster.cy - 300) / scale),
                        ];
                        const deeperScale = Math.min(currentView.scale * 2, MAX_SCALE);
                        Object.keys(COUNTRY_ZOOMS).filter(k => k.startsWith('_custom')).forEach(k => delete COUNTRY_ZOOMS[k]);
                        const customKey = `_custom_${Date.now()}`;
                        COUNTRY_ZOOMS[customKey] = { center: [lng, lat], scale: deeperScale, name: 'Zbliżenie' };
                        setSpiderfied(null);
                        setZoom(customKey);
                      }
                    }
                  }}
                  onMouseEnter={() => setTooltip({
                    x: cluster.cx,
                    y: cluster.cy - r,
                    name: isMulti
                      ? cluster.apps.slice(0, 3).map((a) => a.organization_name).join('\n')
                      : mainApp.organization_name,
                    city: isMulti
                      ? (count > 3 ? `...i ${count - 3} więcej` : '')
                      : mainApp.city || '',
                    sector: isMulti
                      ? (samePos ? 'Kliknij aby rozwinąć' : 'Kliknij aby przybliżyć')
                      : (SECTOR_LABELS[mainApp.sector] || mainApp.sector),
                    date: isMulti ? '' : new Date(mainApp.created_at).toLocaleDateString('pl-PL'),
                  })}
                  onMouseLeave={() => setTooltip(null)}
                />
                {/* Count label for clusters */}
                {isMulti && (
                  <text
                    x={cluster.cx}
                    y={cluster.cy + 3}
                    textAnchor="middle"
                    fontSize={r > 6 ? '8' : '6'}
                    fill="white"
                    fontWeight="bold"
                    fontFamily="system-ui"
                    pointerEvents="none"
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          });
        })()}

      </svg>

      {/* HTML Tooltip — fixed size regardless of zoom */}
      {tooltip && svgRef.current && (() => {
        const svg = svgRef.current!;
        const rect = svg.getBoundingClientRect();
        const vbParts = svg.getAttribute('viewBox')?.split(' ').map(Number) || [100, 50, 600, 500];
        const [vbX, vbY, vbW, vbH] = vbParts;
        const pxX = ((tooltip.x - vbX) / vbW) * rect.width;
        const pxY = ((tooltip.y - vbY) / vbH) * rect.height;
        return (
          <div
            className="absolute pointer-events-none z-20"
            style={{ left: pxX, top: pxY, transform: 'translate(-50%, -100%)' }}
          >
            <div className="bg-[#0A1628]/95 text-white rounded-lg px-4 py-2.5 text-center shadow-xl mb-1.5 max-w-[250px]">
              {tooltip.name.split('\n').map((line, i) => (
                <div key={i} className="text-xs font-semibold leading-tight">
                  {line.length > 35 ? line.slice(0, 35) + '…' : line}
                </div>
              ))}
              {(tooltip.city || tooltip.sector) && (
                <div className="text-[10px] text-[#CC9B30] mt-1">
                  {[tooltip.city, tooltip.sector].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            <div className="w-2.5 h-2.5 bg-[#0A1628]/95 rotate-45 mx-auto -mt-2.5" />
          </div>
        );
      })()}

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
