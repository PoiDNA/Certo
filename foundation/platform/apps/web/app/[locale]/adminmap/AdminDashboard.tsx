'use client';

import { useEffect, useState } from 'react';

type Application = {
  id: string;
  applicant_type: string;
  organization_name: string;
  sector: string;
  city: string | null;
  country: string | null;
  contact_person: string;
  email: string;
  phone: string | null;
  motivation: string;
  role: string | null;
  relation: string | null;
  nip: string | null;
  krs: string | null;
  regon: string | null;
  website: string | null;
  address: string | null;
  postal_code: string | null;
  status: string;
  votes: number;
  submission_count: number;
  duplicate_of: string | null;
  ai_verified: boolean | null;
  ai_verification_notes: string | null;
  rating_score: number | null;
  consent: boolean;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const SECTOR_LABELS: Record<string, string> = {
  publiczny: 'Publiczny',
  prywatny: 'Prywatny',
  pozarzadowy: 'Pozarządowy',
};

const COUNTRY_NAMES: Record<string, string> = {
  PL:'Polska',AT:'Austria',BE:'Belgia',BG:'Bułgaria',HR:'Chorwacja',CY:'Cypr',
  CZ:'Czechy',DK:'Dania',EE:'Estonia',FI:'Finlandia',FR:'Francja',DE:'Niemcy',
  GR:'Grecja',HU:'Węgry',IE:'Irlandia',IT:'Włochy',LV:'Łotwa',LT:'Litwa',
  LU:'Luksemburg',MT:'Malta',NL:'Holandia',PT:'Portugalia',RO:'Rumunia',
  SK:'Słowacja',SI:'Słowenia',ES:'Hiszpania',SE:'Szwecja',
};

export default function AdminDashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchApps = async (key: string) => {
    try {
      const res = await fetch(`/api/admin-applications?status=${filter}`, {
        headers: { 'x-admin-key': key },
      });
      if (res.status === 401) { setAuthenticated(false); return; }
      const json = await res.json();
      setApps(json.data || []);
      setAuthenticated(true);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchApps(adminKey);
  }, [filter, authenticated]);

  const verifyAI = async (id: string) => {
    setUpdating(id);
    await fetch('/api/verify-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchApps(adminKey);
    setUpdating(null);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch('/api/admin-applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id, status }),
    });
    await fetchApps(adminKey);
    setUpdating(null);
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <h2 className="font-serif font-bold text-certo-navy text-xl mb-4 text-center">Autoryzacja</h2>
        <div className="space-y-4">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Klucz administratora"
            className="w-full px-4 py-3 border border-certo-navy/10 rounded-xl text-sm"
          />
          <button
            onClick={() => { setLoading(true); fetchApps(adminKey); }}
            className="w-full bg-certo-navy text-certo-gold py-3 rounded-xl text-sm font-semibold"
          >
            Zaloguj
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-certo-navy/30">Ładowanie...</div>;
  }

  const stats = {
    total: apps.length,
    new: apps.filter((a) => a.status === 'new').length,
    accepted: apps.filter((a) => a.status === 'accepted').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border text-center">
          <div className="text-2xl font-bold text-certo-navy">{stats.total}</div>
          <div className="text-xs text-certo-navy/40">Wszystkie</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border text-center">
          <div className="text-2xl font-bold text-blue-700">{stats.new}</div>
          <div className="text-xs text-blue-600/60">Nowe</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border text-center">
          <div className="text-2xl font-bold text-green-700">{stats.accepted}</div>
          <div className="text-xs text-green-600/60">Zaakceptowane</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border text-center">
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-xs text-red-600/60">Odrzucone</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'new', 'reviewed', 'accepted', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-xs rounded-lg transition-colors ${
              filter === s ? 'bg-certo-navy text-white' : 'bg-white border text-certo-navy/60 hover:border-certo-navy/30'
            }`}
          >
            {s === 'all' ? 'Wszystkie' : s === 'new' ? 'Nowe' : s === 'reviewed' ? 'Rozpatrywane' : s === 'accepted' ? 'Zaakceptowane' : 'Odrzucone'}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-3">
        {apps.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-certo-navy/30">Brak zgłoszeń</div>
        ) : (
          apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-certo-cream/30 transition-colors"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[app.status] || ''}`}>
                  {app.status}
                </span>
                {app.ai_verified && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">AI ✓</span>
                )}
                <span className="font-medium text-sm text-certo-navy flex-1">{app.organization_name}</span>
                <span className="text-xs text-certo-navy/40">{SECTOR_LABELS[app.sector]}</span>
                <span className="text-xs text-certo-navy/40">{app.city || ''} {app.country ? COUNTRY_NAMES[app.country] || app.country : ''}</span>
                <span className="text-xs text-certo-navy/30">{new Date(app.created_at).toLocaleDateString('pl-PL')}</span>
                {app.votes > 0 && (
                  <span className="text-xs bg-certo-gold/10 text-certo-gold px-2 py-0.5 rounded-full">👍 {app.votes}</span>
                )}
                {app.submission_count > 1 && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">×{app.submission_count}</span>
                )}
                <svg className={`w-4 h-4 text-certo-navy/30 transition-transform ${expanded === app.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded details */}
              {expanded === app.id && (
                <div className="border-t p-4 bg-certo-cream/20 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div><span className="text-certo-navy/40 block">Typ zgłaszającego</span><span className="text-certo-navy">{app.applicant_type}</span></div>
                    <div><span className="text-certo-navy/40 block">Osoba kontaktowa</span><span className="text-certo-navy">{app.contact_person}</span></div>
                    <div><span className="text-certo-navy/40 block">Email</span><a href={`mailto:${app.email}`} className="text-certo-gold">{app.email}</a></div>
                    {app.phone && <div><span className="text-certo-navy/40 block">Telefon</span><span className="text-certo-navy">{app.phone}</span></div>}
                    {app.role && <div><span className="text-certo-navy/40 block">Funkcja</span><span className="text-certo-navy">{app.role}</span></div>}
                    {app.relation && <div><span className="text-certo-navy/40 block">Relacja</span><span className="text-certo-navy">{app.relation}</span></div>}
                    {app.nip && <div><span className="text-certo-navy/40 block">NIP</span><span className="text-certo-navy">{app.nip}</span></div>}
                    {app.krs && <div><span className="text-certo-navy/40 block">KRS</span><span className="text-certo-navy">{app.krs}</span></div>}
                    {app.regon && <div><span className="text-certo-navy/40 block">REGON</span><span className="text-certo-navy">{app.regon}</span></div>}
                    {app.website && <div><span className="text-certo-navy/40 block">WWW</span><a href={app.website} target="_blank" rel="noopener" className="text-certo-gold">{app.website}</a></div>}
                    {app.address && <div><span className="text-certo-navy/40 block">Adres</span><span className="text-certo-navy">{app.address} {app.postal_code || ''}</span></div>}
                  </div>

                  {app.motivation && (
                    <div className="text-xs">
                      <span className="text-certo-navy/40 block mb-1">Motywacja</span>
                      <p className="text-certo-navy bg-white p-3 rounded-lg">{app.motivation}</p>
                    </div>
                  )}

                  {app.ai_verification_notes && (
                    <div className="text-xs bg-purple-50 p-3 rounded-lg">
                      <span className="text-purple-700 font-medium block mb-1">Notatki AI</span>
                      <div className="text-purple-600 space-y-1">
                        {app.ai_verification_notes.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.duplicate_of && (
                    <div className="text-xs bg-orange-50 p-3 rounded-lg text-orange-700">
                      Duplikat zgłoszenia: {app.duplicate_of}
                    </div>
                  )}

                  {/* Rating Score */}
                  {app.status === 'accepted' && (
                    <div className="flex items-center gap-3 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <label className="text-xs font-medium text-emerald-700 whitespace-nowrap">⭐ Rating Certo:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={app.rating_score ?? ''}
                        placeholder="np. 76"
                        className="w-20 px-2 py-1 text-sm border border-emerald-300 rounded bg-white text-emerald-800 focus:outline-none focus:border-emerald-500"
                        onBlur={async (e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : null;
                          if (val === app.rating_score) return;
                          setUpdating(app.id);
                          await fetch('/api/admin-applications', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                            body: JSON.stringify({ id: app.id, rating_score: val }),
                          });
                          await fetchApps(adminKey);
                          setUpdating(null);
                        }}
                      />
                      <span className="text-[10px] text-emerald-600">0–100 · zapisuje automatycznie</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t flex-wrap">
                    <button
                      onClick={() => verifyAI(app.id)}
                      disabled={updating === app.id}
                      className="px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-30 transition-colors"
                    >
                      🤖 Weryfikuj AI
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'accepted')}
                      disabled={updating === app.id || app.status === 'accepted'}
                      className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-30 transition-colors"
                    >
                      ✓ Akceptuj
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'reviewed')}
                      disabled={updating === app.id}
                      className="px-4 py-2 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-30 transition-colors"
                    >
                      Rozpatruj
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'rejected')}
                      disabled={updating === app.id || app.status === 'rejected'}
                      className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-30 transition-colors"
                    >
                      ✗ Odrzuć
                    </button>
                    {updating === app.id && <span className="text-xs text-certo-navy/30 self-center">Aktualizowanie...</span>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
