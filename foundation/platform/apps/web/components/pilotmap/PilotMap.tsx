'use client';

import { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Country code → approximate center coordinates [lng, lat]
const COUNTRY_COORDS: Record<string, [number, number]> = {
  PL: [19.4, 52.0], AT: [13.3, 47.5], BE: [4.4, 50.8], BG: [25.5, 42.7],
  HR: [15.5, 45.1], CY: [33.4, 35.1], CZ: [15.5, 49.8], DK: [9.5, 56.3],
  EE: [25.0, 58.6], FI: [25.7, 61.9], FR: [2.2, 46.6], DE: [10.4, 51.2],
  GR: [21.8, 39.1], HU: [19.5, 47.2], IE: [-8.2, 53.4], IT: [12.6, 41.9],
  LV: [24.6, 56.9], LT: [23.9, 55.2], LU: [6.1, 49.8], MT: [14.4, 35.9],
  NL: [5.3, 52.1], PT: [-8.2, 39.4], RO: [24.7, 45.9], SK: [19.7, 48.7],
  SI: [14.5, 46.2], ES: [-3.7, 40.4], SE: [18.6, 60.1],
};

const SECTOR_COLORS: Record<string, string> = {
  publiczny: '#CC9B30',
  prywatny: '#0A1628',
  pozarzadowy: '#8B6914',
};

type Application = {
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  created_at: string;
};

function PilotMap({ applications }: { applications: Application[] }) {
  return (
    <div className="w-full bg-white rounded-xl border border-certo-navy/10 overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [15, 52],
          scale: 600,
        }}
        width={800}
        height={500}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#E8E0D4"
                stroke="#D4CCBE"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { fill: '#D4CCBE', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {applications.map((app, i) => {
          const coords = app.country ? COUNTRY_COORDS[app.country] : null;
          if (!coords) return null;

          // Offset duplicates slightly
          const offset = i * 0.3;
          const color = SECTOR_COLORS[app.sector] || '#CC9B30';

          return (
            <Marker key={`${app.organization_name}-${i}`} coordinates={[coords[0] + offset, coords[1] - offset * 0.5]}>
              <circle r={5} fill={color} stroke="#fff" strokeWidth={1.5} opacity={0.85} />
              <title>{`${app.organization_name}${app.city ? ` — ${app.city}` : ''}`}</title>
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 px-6 py-4 border-t border-certo-navy/5">
        {Object.entries({ publiczny: 'Sektor publiczny', prywatny: 'Sektor prywatny', pozarzadowy: 'Sektor pozarządowy' }).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-certo-navy/60">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SECTOR_COLORS[key] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PilotMap);
