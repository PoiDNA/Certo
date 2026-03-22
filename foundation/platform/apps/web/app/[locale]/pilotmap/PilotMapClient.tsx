'use client';

import { useEffect, useState } from 'react';
import PilotMap from '../../../components/pilotmap/PilotMap';
import PilotTable from '../../../components/pilotmap/PilotTable';

type Application = {
  id: string;
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  created_at: string;
  votes: number;
};

type SectorFilter = 'all' | 'publiczny' | 'prywatny' | 'pozarzadowy';

const FILTER_BUTTONS: { key: SectorFilter; label: string; color: string; activeColor: string }[] = [
  { key: 'all', label: 'Podmiotów', color: 'text-certo-navy', activeColor: 'border-certo-navy bg-certo-navy/5' },
  { key: 'publiczny', label: 'Sektor publiczny', color: 'text-certo-gold', activeColor: 'border-certo-gold bg-certo-gold/5' },
  { key: 'prywatny', label: 'Sektor prywatny', color: 'text-certo-navy', activeColor: 'border-certo-navy bg-certo-navy/5' },
  { key: 'pozarzadowy', label: 'Sektor pozarządowy', color: 'text-amber-700', activeColor: 'border-amber-600 bg-amber-50' },
];

export default function PilotMapClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all');

  useEffect(() => {
    fetch('/api/pilot-applications-public')
      .then((res) => res.json())
      .then((json) => {
        setApplications(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="w-full h-[400px] bg-white rounded-xl border border-certo-navy/10 animate-pulse" />
        <div className="w-full h-[200px] bg-white rounded-xl border border-certo-navy/10 animate-pulse" />
      </div>
    );
  }

  const filtered = sectorFilter === 'all'
    ? applications
    : applications.filter((a) => a.sector === sectorFilter);

  const getCount = (sector: SectorFilter) =>
    sector === 'all' ? applications.length : applications.filter((a) => a.sector === sector).length;

  return (
    <div className="space-y-8">
      {/* Stats — clickable filter buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FILTER_BUTTONS.map(({ key, label, color, activeColor }) => {
          const isActive = sectorFilter === key;
          const count = getCount(key);
          return (
            <button
              key={key}
              onClick={() => setSectorFilter(isActive ? 'all' : key)}
              className={`rounded-xl p-5 text-center transition-all duration-300 border-2 cursor-pointer hover:shadow-md ${
                isActive
                  ? `${activeColor} shadow-md scale-[1.02]`
                  : 'bg-white border-transparent hover:border-certo-navy/10'
              }`}
            >
              <div className={`text-3xl font-serif font-bold ${color} transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {count}
              </div>
              <div className={`text-xs mt-1 transition-colors ${isActive ? 'text-certo-navy/70 font-medium' : 'text-certo-navy/40'}`}>
                {label}
              </div>
              {isActive && key !== 'all' && (
                <div className="text-[10px] text-certo-navy/30 mt-1">Kliknij ponownie aby wyświetlić wszystkie</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active filter indicator */}
      {sectorFilter !== 'all' && (
        <div className="flex items-center justify-between bg-certo-gold/5 rounded-lg px-4 py-2">
          <span className="text-xs text-certo-navy/60">
            Filtr: <strong className="text-certo-navy">{FILTER_BUTTONS.find((b) => b.key === sectorFilter)?.label}</strong> — {filtered.length} z {applications.length} podmiotów
          </span>
          <button onClick={() => setSectorFilter('all')} className="text-xs text-certo-gold hover:text-certo-navy">
            ✕ Wyczyść filtr
          </button>
        </div>
      )}

      {/* Map — receives filtered applications */}
      <PilotMap applications={filtered} />

      {/* Table — receives filtered applications */}
      <PilotTable applications={filtered} />
    </div>
  );
}
