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
  status: string;
  process_status: string | null;
  rating_score: number | null;
  applicant_type?: string | null;
};

type SectorFilter = 'all' | 'publiczny' | 'prywatny' | 'pozarzadowy';

const SECTOR_DOTS: Record<string, string> = {
  publiczny: 'bg-certo-gold',
  prywatny: 'bg-certo-navy',
  pozarzadowy: 'bg-amber-600',
};

const FILTER_ITEMS: { key: SectorFilter; label: string; shortLabel: string }[] = [
  { key: 'all', label: 'Wszystkie zgłoszenia', shortLabel: 'Wszystkie' },
  { key: 'publiczny', label: 'Publiczny', shortLabel: 'Publiczny' },
  { key: 'prywatny', label: 'Prywatny', shortLabel: 'Prywatny' },
  { key: 'pozarzadowy', label: 'Pozarządowy', shortLabel: 'NGO' },
];

export default function PilotMapClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all');
  const [clusterHighlight, setClusterHighlight] = useState<Set<string> | null>(null);

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
      <div className="space-y-6">
        <div className="w-full h-[500px] bg-certo-card rounded-xl border border-certo-card-border animate-pulse" />
      </div>
    );
  }

  const filtered = sectorFilter === 'all'
    ? applications
    : applications.filter((a) => a.sector === sectorFilter);

  const getCount = (sector: SectorFilter) =>
    sector === 'all' ? applications.length : applications.filter((a) => a.sector === sector).length;

  return (
    <div className="space-y-6">
      {/* Map with integrated controls */}
      <PilotMap
        applications={filtered}
        onClusterSelect={(apps) => {
          if (apps) {
            setClusterHighlight(new Set(apps.map((a) => a.id)));
          } else {
            setClusterHighlight(null);
          }
        }}
        sectorFilter={sectorFilter}
        onSectorChange={setSectorFilter}
        sectorCounts={{
          all: getCount('all'),
          publiczny: getCount('publiczny'),
          prywatny: getCount('prywatny'),
          pozarzadowy: getCount('pozarzadowy'),
        }}
      />

      {/* Cluster filter indicator */}
      {clusterHighlight && (
        <div className="flex items-center justify-between bg-certo-card rounded-lg px-4 py-2 border border-certo-gold/30">
          <span className="text-xs text-certo-fg-muted">
            Wybrano <strong className="text-certo-navy">{clusterHighlight.size}</strong> podmiotów z mapy
          </span>
          <button onClick={() => setClusterHighlight(null)} className="text-xs text-certo-gold hover:text-certo-navy">
            ✕ Wyczyść wybór
          </button>
        </div>
      )}

      {/* Table */}
      <PilotTable applications={filtered} highlightedIds={clusterHighlight} />
    </div>
  );
}
