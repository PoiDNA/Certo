'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PilotTable from '../../../components/pilotmap/PilotTable';

// Dynamic import to avoid SSR issues with react-simple-maps
const PilotMap = dynamic(() => import('../../../components/pilotmap/PilotMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-white rounded-xl border border-certo-navy/10 flex items-center justify-center">
      <div className="text-certo-navy/30 text-sm">Ładowanie mapy...</div>
    </div>
  ),
});

type Application = {
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  created_at: string;
};

export default function PilotMapClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-12">
      {/* Map */}
      <PilotMap applications={applications} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-certo-navy/5 text-center">
          <div className="text-3xl font-serif font-bold text-certo-navy">{applications.length}</div>
          <div className="text-xs text-certo-navy/40 mt-1">Podmiotów</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-certo-navy/5 text-center">
          <div className="text-3xl font-serif font-bold text-certo-gold">
            {applications.filter((a) => a.sector === 'publiczny').length}
          </div>
          <div className="text-xs text-certo-navy/40 mt-1">Sektor publiczny</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-certo-navy/5 text-center">
          <div className="text-3xl font-serif font-bold text-certo-navy">
            {applications.filter((a) => a.sector === 'prywatny').length}
          </div>
          <div className="text-xs text-certo-navy/40 mt-1">Sektor prywatny</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-certo-navy/5 text-center">
          <div className="text-3xl font-serif font-bold text-amber-700">
            {applications.filter((a) => a.sector === 'pozarzadowy').length}
          </div>
          <div className="text-xs text-certo-navy/40 mt-1">Sektor pozarządowy</div>
        </div>
      </div>

      {/* Table */}
      <PilotTable applications={applications} />
    </div>
  );
}
