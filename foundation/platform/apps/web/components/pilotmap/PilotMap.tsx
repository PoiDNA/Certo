'use client';

import { memo, useState, useEffect, useRef } from 'react';

// TopoJSON world-atlas uses ISO 3166-1 NUMERIC codes (e.g. "616" for Poland)
// Map numeric → ISO2 for EU countries
const NUMERIC_TO_ISO2: Record<string, string> = {
  '040':'AT','056':'BE','100':'BG','191':'HR','196':'CY','203':'CZ',
  '208':'DK','233':'EE','246':'FI','250':'FR','276':'DE','300':'GR',
  '348':'HU','372':'IE','380':'IT','428':'LV','440':'LT','442':'LU',
  '470':'MT','528':'NL','616':'PL','620':'PT','642':'RO','703':'SK',
  '705':'SI','724':'ES','752':'SE',
};

// Also support ISO3 alpha codes as fallback (some TopoJSON variants)
const ISO3_TO_ISO2: Record<string, string> = {
  POL:'PL',AUT:'AT',BEL:'BE',BGR:'BG',HRV:'HR',CYP:'CY',CZE:'CZ',
  DNK:'DK',EST:'EE',FIN:'FI',FRA:'FR',DEU:'DE',GRC:'GR',HUN:'HU',
  IRL:'IE',ITA:'IT',LVA:'LV',LTU:'LT',LUX:'LU',MLT:'MT',NLD:'NL',
  PRT:'PT',ROU:'RO',SVK:'SK',SVN:'SI',ESP:'ES',SWE:'SE',
};

// Resolve any ID format to ISO2
function resolveToISO2(id: string): string {
  return NUMERIC_TO_ISO2[id] || ISO3_TO_ISO2[id] || '';
}

const EU_ISO2 = new Set(Object.values(NUMERIC_TO_ISO2));

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

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

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

type SectorFilter = 'all' | 'publiczny' | 'prywatny' | 'pozarzadowy';

const SECTOR_DOTS: Record<string, string> = {
  publiczny: 'bg-certo-gold',
  prywatny: 'bg-certo-navy',
  pozarzadowy: 'bg-amber-600',
};

const FILTER_ITEMS: { key: SectorFilter; label: string }[] = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'publiczny', label: 'Publiczny' },
  { key: 'prywatny', label: 'Prywatny' },
  { key: 'pozarzadowy', label: 'NGO' },
];

function PilotMap({ applications, onClusterSelect, sectorFilter, onSectorChange, sectorCounts }: {
  applications: Application[];
  onClusterSelect?: (apps: Application[] | null) => void;
  sectorFilter?: SectorFilter;
  onSectorChange?: (f: SectorFilter) => void;
  sectorCounts?: Record<SectorFilter, number>;
}) {
  const [paths, setPaths] = useState<{ id: string; d: string; isEU: boolean; iso2: string }[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; city: string; sector: string; date: string } | null>(null);
  const [zoom, setZoom] = useState<string>('EU');
  const [clusterPanel, setClusterPanel] = useState<{ x: number; y: number; apps: Application[] } | null>(null);
  const [showCountries, setShowCountries] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const closePanel = () => {
    setClusterPanel(null);
    onClusterSelect?.(null);
  };

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
          const id = String(geo.id || '');
          const iso2 = resolveToISO2(id);
          const isEU = EU_ISO2.has(iso2);

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

  const currentZoomName = COUNTRY_ZOOMS[zoom]?.name || (zoom.startsWith('_custom') ? 'Zbliżenie' : 'Europa');

  // Use refs for click/hover handlers to avoid stale closures
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // Native DOM click handler for country paths — bypasses React synthetic events
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const countryCode = target.getAttribute('data-country');
      if (countryCode && COUNTRY_ZOOMS[countryCode]) {
        e.stopPropagation();
        setZoom(zoomRef.current === countryCode ? 'EU' : countryCode);
        setShowCountries(false);
        setClusterPanel(null);
        onClusterSelect?.(null);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const code = target.getAttribute('data-country');
      setHoveredCountry(code || null);
    };

    const handleMouseLeave = () => setHoveredCountry(null);

    // Touch support
    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as SVGElement;
      const countryCode = target.getAttribute('data-country');
      if (countryCode && COUNTRY_ZOOMS[countryCode]) {
        e.preventDefault();
        e.stopPropagation();
        setZoom(zoomRef.current === countryCode ? 'EU' : countryCode);
        setShowCountries(false);
        setClusterPanel(null);
        onClusterSelect?.(null);
      }
    };

    svg.addEventListener('click', handleClick);
    svg.addEventListener('mousemove', handleMouseMove);
    svg.addEventListener('mouseleave', handleMouseLeave);
    svg.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      svg.removeEventListener('click', handleClick);
      svg.removeEventListener('mousemove', handleMouseMove);
      svg.removeEventListener('mouseleave', handleMouseLeave);
      svg.removeEventListener('touchend', handleTouchEnd);
    };
  }, [paths]); // re-attach when paths load

  return (
    <div className="w-full bg-white rounded-2xl border border-certo-navy/10 overflow-hidden relative">
      {/* Map SVG */}
      <svg
        ref={svgRef}
        viewBox={`${vb.x.toFixed(0)} ${vb.y.toFixed(0)} ${vb.w.toFixed(0)} ${vb.h.toFixed(0)}`}
        className="w-full h-auto transition-all duration-500"
        style={{ minHeight: 400, background: '#F8F5EE' }}
        onClick={() => closePanel()}
      >
        {/* Country shapes */}
        {paths.map(({ id, d, isEU, iso2 }) => (
          <path
            key={id}
            d={d}
            data-country={isEU && iso2 ? iso2 : undefined}
            fill={isEU ? (zoom === iso2 ? '#C8B898' : hoveredCountry === iso2 ? '#CCBB99' : '#E8E0D0') : '#F0ECE4'}
            stroke={isEU ? (hoveredCountry === iso2 ? '#A89870' : '#C8BBAA') : '#E0DCD4'}
            strokeWidth={isEU ? (hoveredCountry === iso2 ? 1.5 : 0.8) : 0.3}
            style={isEU ? { cursor: 'pointer', pointerEvents: 'all' } : undefined}
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
              pointerEvents="none"
            >
              {name}
            </text>
          );
        })}

        {/* Clustered application markers */}
        {(() => {
          const viewRatio = vb.w / europeViewBox.w;
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

          return clusters.map((cluster, ci) => {
            const count = cluster.apps.length;
            const isMulti = count > 1;
            const mainApp = cluster.apps[0];
            const color = isMulti ? '#CC9B30' : (SECTOR_COLORS[mainApp.sector] || '#CC9B30');
            const r = isMulti ? Math.min(4 + count * 2, 12) : 4;
            const label = formatCount(count);
            // Font size: shrink for wider labels like "4.0K"
            const fontSize = label.length > 3 ? 5 : label.length > 2 ? 6 : (r > 6 ? 8 : 6);

            return (
              <g key={`cluster-${ci}`}>
                {isMulti && (
                  <circle cx={cluster.cx} cy={cluster.cy} r={r + 6} fill={color} opacity={0.1}>
                    <animate attributeName="r" values={`${r + 3};${r + 8};${r + 3}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.03;0.15" dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={cluster.cx}
                  cy={cluster.cy}
                  r={r}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMulti) {
                      const country = mainApp.country;
                      if (zoom === 'EU' && country && COUNTRY_ZOOMS[country]) {
                        closePanel();
                        setZoom(country);
                      } else {
                        // Show panel with list + notify table
                        setTooltip(null);
                        setClusterPanel({ x: cluster.cx, y: cluster.cy, apps: cluster.apps });
                        onClusterSelect?.(cluster.apps);
                      }
                    }
                  }}
                  onMouseEnter={() => {
                    if (clusterPanel || isMulti) return;
                    setTooltip({
                      x: cluster.cx,
                      y: cluster.cy - r,
                      name: mainApp.organization_name,
                      city: mainApp.city || '',
                      sector: SECTOR_LABELS[mainApp.sector] || mainApp.sector,
                      date: new Date(mainApp.created_at).toLocaleDateString('pl-PL'),
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
                {isMulti && (
                  <text
                    x={cluster.cx}
                    y={cluster.cy + 3}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fill="white"
                    fontWeight="bold"
                    fontFamily="system-ui"
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          });
        })()}

      </svg>

      {/* ─── Floating controls: top-right ─── */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
        {/* Sector filter pills */}
        {onSectorChange && (
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-certo-navy/10 px-1 py-1">
            {FILTER_ITEMS.map(({ key, label }) => {
              const isActive = sectorFilter === key;
              const count = sectorCounts?.[key] ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => onSectorChange(isActive && key !== 'all' ? 'all' : key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-certo-navy text-white shadow-sm'
                      : 'text-certo-navy/60 hover:bg-certo-navy/5 hover:text-certo-navy'
                  }`}
                >
                  {key !== 'all' && (
                    <span className={`w-2 h-2 rounded-full ${SECTOR_DOTS[key]} ${isActive ? 'opacity-80' : 'opacity-50'}`} />
                  )}
                  <span>{label}</span>
                  <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-certo-navy/30'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Country zoom selector */}
        <div className="relative">
          <div className="flex items-center gap-0 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-certo-navy/10">
            {/* Back to Europa button — only when zoomed into a country */}
            {zoom !== 'EU' && (
              <button
                onClick={() => { setZoom('EU'); setShowCountries(false); }}
                className="flex items-center gap-1 pl-3 pr-2 py-1.5 text-[11px] font-medium text-certo-navy/50 hover:text-certo-navy border-r border-certo-navy/10 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Europa
              </button>
            )}
            {/* Current zoom / dropdown trigger */}
            <button
              onClick={() => setShowCountries(!showCountries)}
              className={`flex items-center gap-2 py-1.5 text-[11px] font-medium text-certo-navy hover:text-certo-navy/80 transition-colors ${zoom !== 'EU' ? 'pl-2 pr-3' : 'px-3'}`}
            >
              <span className="text-sm">📍</span>
              <span>{currentZoomName}</span>
              <svg className={`w-3 h-3 text-certo-navy/40 transition-transform ${showCountries ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showCountries && (
            <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-certo-navy/10 w-[280px] max-h-[300px] overflow-y-auto py-1 z-40">
              {/* Europa button */}
              <button
                onClick={() => { setZoom('EU'); setShowCountries(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-xs transition-colors ${
                  zoom === 'EU' ? 'bg-certo-navy text-white' : 'text-certo-navy hover:bg-certo-navy/5'
                }`}
              >
                <span className="text-sm">🌍</span>
                <span className="font-medium">Europa</span>
                <span className={`ml-auto text-[10px] ${zoom === 'EU' ? 'text-white/50' : 'text-certo-navy/30'}`}>
                  {applications.length}
                </span>
              </button>
              <div className="h-px bg-certo-navy/5 mx-3 my-1" />
              {/* Country list */}
              {Object.entries(COUNTRY_ZOOMS)
                .filter(([code]) => code !== 'EU' && !code.startsWith('_custom'))
                .sort((a, b) => {
                  // Countries with apps first
                  const aHas = countriesWithApps.has(a[0]) ? 0 : 1;
                  const bHas = countriesWithApps.has(b[0]) ? 0 : 1;
                  if (aHas !== bHas) return aHas - bHas;
                  return a[1].name.localeCompare(b[1].name);
                })
                .map(([code, { name }]) => {
                  const hasApps = countriesWithApps.has(code);
                  const appCount = applications.filter((a) => a.country === code).length;
                  return (
                    <button
                      key={code}
                      onClick={() => { setZoom(code); setShowCountries(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-1.5 text-xs transition-colors ${
                        zoom === code
                          ? 'bg-certo-gold text-white'
                          : hasApps
                            ? 'text-certo-navy hover:bg-certo-gold/5'
                            : 'text-certo-navy/30 hover:bg-certo-navy/5'
                      }`}
                    >
                      <span className="font-medium">{name}</span>
                      {hasApps && (
                        <span className={`ml-auto text-[10px] font-semibold ${
                          zoom === code ? 'text-white/60' : 'text-certo-gold'
                        }`}>
                          {appCount}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* HTML Tooltip */}
      {tooltip && !clusterPanel && svgRef.current && (() => {
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

      {/* Cluster panel — scrollable list */}
      {clusterPanel && svgRef.current && (() => {
        const svg = svgRef.current!;
        const rect = svg.getBoundingClientRect();
        const vbParts = svg.getAttribute('viewBox')?.split(' ').map(Number) || [100, 50, 600, 500];
        const [vbX, vbY, vbW, vbH] = vbParts;
        const pxX = ((clusterPanel.x - vbX) / vbW) * rect.width;
        const pxY = ((clusterPanel.y - vbY) / vbH) * rect.height;
        const panelApps = clusterPanel.apps;
        const onRight = pxX < rect.width * 0.6;
        return (
          <div
            className="absolute z-30"
            style={{
              left: onRight ? pxX + 20 : pxX - 20,
              top: Math.min(pxY - 20, rect.height - 40),
              transform: onRight ? 'translate(0, -50%)' : 'translate(-100%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-certo-navy/10 w-[280px] max-h-[300px] flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-certo-navy/5">
                <span className="text-xs font-semibold text-certo-navy">
                  Liczba podmiotów: {panelApps.length}
                </span>
                <button onClick={closePanel} className="text-certo-navy/30 hover:text-certo-navy text-sm leading-none">✕</button>
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-certo-navy/5">
                {panelApps.map((app, i) => (
                  <div key={i} className="px-4 py-2.5 hover:bg-certo-gold/5 transition-colors">
                    <div className="text-xs font-semibold text-certo-navy leading-tight">{app.organization_name}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-certo-navy/50">
                      {app.city && <span>{app.city}</span>}
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: SECTOR_COLORS[app.sector] || '#CC9B30' }} />
                      <span>{SECTOR_LABELS[app.sector]?.replace('Sektor ', '') || app.sector}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bottom bar — legend + count */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 border-t border-certo-navy/5 bg-white/80">
        {Object.entries(SECTOR_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-[10px] text-certo-navy/50">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTOR_COLORS[key] }} />
            {label}
          </div>
        ))}
        <div className="ml-auto text-[10px] text-certo-navy/30">
          {applications.length} {applications.length === 1 ? 'podmiot' : 'podmiotów'}
        </div>
      </div>
    </div>
  );
}

export default memo(PilotMap);
