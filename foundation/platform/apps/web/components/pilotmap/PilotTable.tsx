'use client';

import { useState, useMemo } from 'react';

const COUNTRY_NAMES: Record<string, string> = {
  PL: 'Polska', AT: 'Austria', BE: 'Belgia', BG: 'Bułgaria', HR: 'Chorwacja',
  CY: 'Cypr', CZ: 'Czechy', DK: 'Dania', EE: 'Estonia', FI: 'Finlandia',
  FR: 'Francja', DE: 'Niemcy', GR: 'Grecja', HU: 'Węgry', IE: 'Irlandia',
  IT: 'Włochy', LV: 'Łotwa', LT: 'Litwa', LU: 'Luksemburg', MT: 'Malta',
  NL: 'Holandia', PT: 'Portugalia', RO: 'Rumunia', SK: 'Słowacja',
  SI: 'Słowenia', ES: 'Hiszpania', SE: 'Szwecja',
};

const SECTOR_LABELS: Record<string, string> = {
  publiczny: 'Sektor publiczny',
  prywatny: 'Sektor prywatny',
  pozarzadowy: 'Sektor pozarządowy',
};

const SECTOR_COLORS: Record<string, string> = {
  publiczny: 'bg-certo-gold/20 text-certo-gold',
  prywatny: 'bg-certo-navy/10 text-certo-navy',
  pozarzadowy: 'bg-amber-100 text-amber-800',
};

type Application = {
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  created_at: string;
};

type SortKey = 'organization_name' | 'city' | 'country' | 'sector' | 'created_at';

export default function PilotTable({ applications }: { applications: Application[] }) {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return applications
      .filter((a) => {
        if (sectorFilter && a.sector !== sectorFilter) return false;
        if (!q) return true;
        const countryName = a.country ? COUNTRY_NAMES[a.country]?.toLowerCase() || '' : '';
        return (
          a.organization_name.toLowerCase().includes(q) ||
          (a.city?.toLowerCase().includes(q) ?? false) ||
          countryName.includes(q)
        );
      })
      .sort((a, b) => {
        const aVal = (a[sortKey] || '') as string;
        const bVal = (b[sortKey] || '') as string;
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
  }, [applications, search, sectorFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 text-certo-navy/30">
      {sortKey === col ? (sortAsc ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po nazwie, mieście lub kraju..."
          className="flex-1 px-4 py-3 bg-white border border-certo-navy/10 rounded-lg text-sm text-certo-navy placeholder:text-certo-navy/40 focus:outline-none focus:border-certo-gold"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSectorFilter(null)}
            className={`px-3 py-2 text-xs rounded-lg transition-colors ${
              !sectorFilter ? 'bg-certo-navy text-white' : 'bg-white border border-certo-navy/10 text-certo-navy/60 hover:border-certo-navy/30'
            }`}
          >
            Wszystkie
          </button>
          {Object.entries(SECTOR_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSectorFilter(sectorFilter === key ? null : key)}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                sectorFilter === key ? 'bg-certo-navy text-white' : 'bg-white border border-certo-navy/10 text-certo-navy/60 hover:border-certo-navy/30'
              }`}
            >
              {label.replace('Sektor ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-certo-navy/40">
        Łączna liczba zgłoszeń: <strong className="text-certo-navy">{filtered.length}</strong>
      </p>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-certo-navy/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-certo-navy/5 text-left">
              <th className="px-4 py-3 font-medium text-certo-navy cursor-pointer" onClick={() => toggleSort('organization_name')}>
                Nazwa podmiotu <SortIcon col="organization_name" />
              </th>
              <th className="px-4 py-3 font-medium text-certo-navy cursor-pointer" onClick={() => toggleSort('city')}>
                Miasto <SortIcon col="city" />
              </th>
              <th className="px-4 py-3 font-medium text-certo-navy cursor-pointer" onClick={() => toggleSort('country')}>
                Kraj <SortIcon col="country" />
              </th>
              <th className="px-4 py-3 font-medium text-certo-navy cursor-pointer" onClick={() => toggleSort('sector')}>
                Sektor <SortIcon col="sector" />
              </th>
              <th className="px-4 py-3 font-medium text-certo-navy cursor-pointer" onClick={() => toggleSort('created_at')}>
                Data <SortIcon col="created_at" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-certo-navy/40">Brak wyników</td></tr>
            ) : (
              filtered.map((app, i) => (
                <tr key={i} className="border-t border-certo-navy/5 hover:bg-certo-gold/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-certo-navy">{app.organization_name}</td>
                  <td className="px-4 py-3 text-certo-navy/60">{app.city || '—'}</td>
                  <td className="px-4 py-3 text-certo-navy/60">{app.country ? COUNTRY_NAMES[app.country] || app.country : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${SECTOR_COLORS[app.sector] || ''}`}>
                      {SECTOR_LABELS[app.sector] || app.sector}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-certo-navy/40 text-xs">
                    {new Date(app.created_at).toLocaleDateString('pl-PL')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-certo-navy/40">Brak wyników</div>
        ) : (
          filtered.map((app, i) => (
            <div key={i} className="bg-white rounded-xl border border-certo-navy/5 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-certo-navy text-sm">{app.organization_name}</h3>
                <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full ${SECTOR_COLORS[app.sector] || ''}`}>
                  {(SECTOR_LABELS[app.sector] || app.sector).replace('Sektor ', '')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-certo-navy/50">
                {app.city && <span>📍 {app.city}</span>}
                {app.country && <span>{COUNTRY_NAMES[app.country] || app.country}</span>}
                <span>{new Date(app.created_at).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
