'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
  id: string;
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  created_at: string;
  votes: number;
  status: string;
  process_status: string | null;
  rating_score: number | null;
  applicant_type?: string | null;
};

type SortKey = 'organization_name' | 'city' | 'country' | 'sector' | 'created_at' | 'status';

// Submission type label
function getSubmissionType(app: Application): { label: string; icon: string } {
  return app.applicant_type === 'representative'
    ? { label: 'Zgłoszenie własne', icon: '🏢' }
    : { label: 'Zgłoszenie publiczne', icon: '👁️' };
}

// Process status: the public-facing rating pipeline stage
function getStatusInfo(app: Application): { label: string; className: string; order: number } {
  const ps = app.process_status || 'zgloszenie';

  if (ps === 'rating' && app.rating_score != null) {
    return {
      label: `Certo ${app.rating_score}`,
      className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      order: 0,
    };
  }
  switch (ps) {
    case 'ocena':
      return { label: 'W trakcie oceny', className: 'bg-certo-gold/15 text-certo-gold border border-certo-gold/20', order: 1 };
    case 'analiza':
      return { label: 'Analiza wstępna', className: 'bg-amber-50 text-amber-600 border border-amber-200', order: 2 };
    default: {
      const sub = getSubmissionType(app);
      return {
        label: sub.label,
        className: app.applicant_type === 'representative'
          ? 'bg-blue-50 text-blue-600 border border-blue-200'
          : 'bg-purple-50 text-purple-600 border border-purple-200',
        order: 3,
      };
    }
  }
}

export default function PilotTable({ applications, highlightedIds }: {
  applications: Application[];
  highlightedIds?: Set<string> | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'pl';
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const handleVote = async (id: string) => {
    if (votedIds.has(id)) return;
    setVotedIds((prev) => new Set(prev).add(id));
    await fetch('/api/pilot-vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };
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
        // Highlighted items first
        if (highlightedIds?.size) {
          const aH = highlightedIds.has(a.id) ? 0 : 1;
          const bH = highlightedIds.has(b.id) ? 0 : 1;
          if (aH !== bH) return aH - bH;
        }
        if (sortKey === 'status') {
          const aOrder = getStatusInfo(a).order;
          const bOrder = getStatusInfo(b).order;
          return sortAsc ? aOrder - bOrder : bOrder - aOrder;
        }
        const aVal = (a[sortKey] || '') as string;
        const bVal = (b[sortKey] || '') as string;
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
  }, [applications, search, sectorFilter, sortKey, sortAsc, highlightedIds]);

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
    <div className="space-y-4 bg-white rounded-2xl p-4 md:p-6">
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
              <th className="px-4 py-3 font-medium text-certo-navy cursor-pointer" onClick={() => toggleSort('status')}>
                Status <SortIcon col="status" />
              </th>
              <th className="px-4 py-3 font-medium text-certo-navy cursor-pointer" onClick={() => toggleSort('created_at')}>
                Data <SortIcon col="created_at" />
              </th>
              <th className="px-4 py-3 font-medium text-certo-navy text-center">Podbij</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-certo-navy/40">Brak wyników</td></tr>
            ) : (
              filtered.map((app, i) => {
                const isHighlighted = highlightedIds?.has(app.id);
                return (
                <tr key={i}
                  onClick={() => router.push(`/${locale}/entity/${app.id}`)}
                  className={`border-t border-certo-navy/5 transition-colors cursor-pointer ${
                  isHighlighted ? 'bg-certo-gold/10 ring-1 ring-inset ring-certo-gold/30' : 'hover:bg-certo-gold/5'
                }`}>
                  <td className="px-4 py-3 font-medium text-certo-navy hover:text-certo-gold transition-colors">{app.organization_name}</td>
                  <td className="px-4 py-3 text-certo-navy/60">{app.city || '—'}</td>
                  <td className="px-4 py-3 text-certo-navy/60">{app.country ? COUNTRY_NAMES[app.country] || app.country : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${SECTOR_COLORS[app.sector] || ''}`}>
                      {SECTOR_LABELS[app.sector] || app.sector}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(() => { const s = getStatusInfo(app); return (
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${s.className}`}>
                        {s.label}
                      </span>
                    ); })()}
                  </td>
                  <td className="px-4 py-3 text-certo-navy/40 text-xs">
                    {new Date(app.created_at).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVote(app.id); }}
                      disabled={votedIds.has(app.id)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        votedIds.has(app.id)
                          ? 'bg-certo-gold/20 text-certo-gold'
                          : 'bg-certo-navy/5 text-certo-navy/60 hover:bg-certo-gold/10 hover:text-certo-gold'
                      }`}
                    >
                      👍 {(app.votes || 0) + (votedIds.has(app.id) ? 1 : 0)}
                    </button>
                  </td>
                </tr>
                );
              })
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
            <div key={i}
              onClick={() => router.push(`/${locale}/entity/${app.id}`)}
              className={`rounded-xl border p-4 space-y-2 cursor-pointer ${
              highlightedIds?.has(app.id) ? 'bg-white border-certo-gold ring-2 ring-certo-gold/30' : 'bg-white border-certo-navy/5 hover:border-certo-gold/30'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-certo-navy text-sm hover:text-certo-gold transition-colors">{app.organization_name}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(() => { const s = getStatusInfo(app); return (
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${s.className}`}>
                      {s.label}
                    </span>
                  ); })()}
                  <span className={`px-2 py-0.5 text-[10px] rounded-full ${SECTOR_COLORS[app.sector] || ''}`}>
                    {(SECTOR_LABELS[app.sector] || app.sector).replace('Sektor ', '')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-certo-navy/50">
                  {app.city && <span>📍 {app.city}</span>}
                  {app.country && <span>{COUNTRY_NAMES[app.country] || app.country}</span>}
                  <span>{new Date(app.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
                <button
                  onClick={() => handleVote(app.id)}
                  disabled={votedIds.has(app.id)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    votedIds.has(app.id) ? 'bg-certo-gold/20 text-certo-gold' : 'bg-certo-navy/5 text-certo-navy/60'
                  }`}
                >
                  👍 {(app.votes || 0) + (votedIds.has(app.id) ? 1 : 0)}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
