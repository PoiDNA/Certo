'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShareButton from '../../../../components/pilotmap/ShareButton';

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

const SECTOR_ICONS: Record<string, string> = {
  publiczny: '🏛️',
  prywatny: '🏢',
  pozarzadowy: '🤝',
};

type Entity = {
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
  nip: string | null;
  applicant_type: string | null;
};

function getProcessStage(ps: string | null, ratingScore: number | null) {
  const stages = [
    { key: 'zgloszenie', label: 'Zgłoszenie', icon: '📋' },
    { key: 'analiza', label: 'Analiza wstępna', icon: '🔍' },
    { key: 'ocena', label: 'W trakcie oceny', icon: '⚖️' },
    { key: 'rating', label: ratingScore != null ? `Certo ${ratingScore}` : 'Ocena Certo', icon: '⭐' },
  ];
  const current = ps || 'zgloszenie';
  const currentIdx = stages.findIndex(s => s.key === current);
  return { stages, currentIdx };
}

export default function EntityPageClient({ id, locale }: { id: string; locale: string }) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/entity/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setEntity(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleVote = async () => {
    if (!entity || votedIds.has(entity.id)) return;
    setVotedIds(prev => new Set(prev).add(entity.id));
    await fetch('/api/pilot-vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entity.id }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-certo-beige to-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-certo-gold/20" />
          <div className="h-4 w-48 bg-certo-navy/10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-certo-beige to-white flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-certo-navy">Podmiot nie znaleziony</h1>
        <p className="text-certo-navy/50">Ten podmiot nie istnieje lub został usunięty.</p>
        <Link href={`/${locale}/pilotmap`} className="text-certo-gold hover:underline">
          ← Wróć do mapy zgłoszeń
        </Link>
      </div>
    );
  }

  const { stages, currentIdx } = getProcessStage(entity.process_status, entity.rating_score);
  const countryName = entity.country ? COUNTRY_NAMES[entity.country] || entity.country : null;
  const isOwnSubmission = entity.applicant_type === 'representative';
  const submissionLabel = isOwnSubmission ? 'Zgłoszenie własne' : 'Zgłoszenie publiczne';
  const submissionIcon = isOwnSubmission ? '🏢' : '👁️';

  return (
    <div className="min-h-screen bg-gradient-to-b from-certo-beige to-white">
      {/* Header */}
      <div className="bg-certo-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
          <Link href={`/${locale}/pilotmap`} className="text-white/50 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            ← Mapa Zgłoszeń
          </Link>

          <div className="flex items-start gap-4 mt-2">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl shrink-0">
              {SECTOR_ICONS[entity.sector] || '🏢'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold tracking-tight truncate">
                {entity.organization_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/60">
                {entity.city && <span className="flex items-center gap-1">📍 {entity.city}</span>}
                {countryName && <span>{countryName}</span>}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isOwnSubmission ? 'bg-blue-500/20 text-blue-200' : 'bg-purple-500/20 text-purple-200'
                }`}>
                  {submissionIcon} {submissionLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-xs">
                  {SECTOR_LABELS[entity.sector] || entity.sector}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Process Pipeline */}
        <div className="bg-white rounded-2xl border border-certo-navy/10 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-certo-navy/50 uppercase tracking-wider mb-6">
            Proces oceny Ocena Certo
          </h2>

          {/* Pipeline steps */}
          <div className="flex items-center justify-between gap-1 md:gap-2">
            {stages.map((stage, i) => {
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              const isFuture = i > currentIdx;

              return (
                <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line */}
                  {i > 0 && (
                    <div className={`absolute top-5 -left-1/2 w-full h-0.5 ${
                      isCompleted ? 'bg-certo-gold' : 'bg-certo-navy/10'
                    }`} style={{ zIndex: 0 }} />
                  )}

                  {/* Circle */}
                  <div className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                    isCurrent
                      ? 'bg-certo-gold text-white shadow-lg shadow-certo-gold/30 ring-4 ring-certo-gold/20'
                      : isCompleted
                        ? 'bg-certo-gold/80 text-white'
                        : 'bg-certo-navy/5 text-certo-navy/30'
                  }`}>
                    {isCompleted ? '✓' : stage.icon}
                  </div>

                  {/* Label */}
                  <span className={`mt-2 text-[10px] md:text-xs text-center leading-tight ${
                    isCurrent ? 'font-bold text-certo-navy' :
                    isCompleted ? 'font-medium text-certo-gold' :
                    'text-certo-navy/30'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rating score display */}
          {entity.process_status === 'rating' && entity.rating_score != null && (
            <div className="mt-8 flex items-center justify-center">
              <div className="bg-gradient-to-br from-certo-gold to-amber-600 text-white rounded-2xl px-8 py-6 text-center shadow-xl shadow-certo-gold/20">
                <div className="text-xs uppercase tracking-widest text-white/70 mb-1">Certo Rating</div>
                <div className="text-5xl md:text-6xl font-bold">{entity.rating_score}</div>
                <div className="text-sm text-white/70 mt-1">/ 100</div>
              </div>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-certo-navy/10 p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-certo-navy/40 uppercase tracking-wider mb-4">Dane podmiotu</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-certo-navy/40">Nazwa</dt>
                <dd className="text-sm font-medium text-certo-navy">{entity.organization_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-certo-navy/40">Sektor</dt>
                <dd className="text-sm text-certo-navy">{SECTOR_LABELS[entity.sector] || entity.sector}</dd>
              </div>
              {entity.nip && (
                <div>
                  <dt className="text-xs text-certo-navy/40">NIP</dt>
                  <dd className="text-sm text-certo-navy font-mono">{entity.nip}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-certo-navy/40">Lokalizacja</dt>
                <dd className="text-sm text-certo-navy">
                  {[entity.city, countryName].filter(Boolean).join(', ') || '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-certo-navy/10 p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-certo-navy/40 uppercase tracking-wider mb-4">Status procesu</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-certo-navy/40">Typ zgłoszenia</dt>
                <dd className="text-sm font-medium text-certo-navy">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isOwnSubmission
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-purple-50 text-purple-600 border border-purple-200'
                  }`}>
                    {submissionIcon} {submissionLabel}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-certo-navy/40">Etap</dt>
                <dd className="text-sm font-medium text-certo-navy">
                  {stages[currentIdx]?.icon} {stages[currentIdx]?.label}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-certo-navy/40">Data zgłoszenia</dt>
                <dd className="text-sm text-certo-navy">
                  {new Date(entity.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
              {entity.rating_score != null && (
                <div>
                  <dt className="text-xs text-certo-navy/40">Certo Rating</dt>
                  <dd className="text-2xl font-bold text-certo-gold">{entity.rating_score}<span className="text-sm text-certo-navy/30 ml-1">/ 100</span></dd>
                </div>
              )}
            </dl>
          </div>

          {/* Community */}
          <div className="bg-white rounded-2xl border border-certo-navy/10 p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-certo-navy/40 uppercase tracking-wider mb-4">Społeczność</h3>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-certo-navy">
                  {(entity.votes || 0) + (votedIds.has(entity.id) ? 1 : 0)}
                </div>
                <div className="text-xs text-certo-navy/40">głosów poparcia</div>
              </div>
              <button
                onClick={handleVote}
                disabled={votedIds.has(entity.id)}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                  votedIds.has(entity.id)
                    ? 'bg-certo-gold/10 text-certo-gold border border-certo-gold/20'
                    : 'bg-certo-gold text-white hover:bg-certo-gold/90 shadow-lg shadow-certo-gold/20'
                }`}
              >
                {votedIds.has(entity.id) ? '✓ Poparcie oddane' : '👍 Poprzyj ten podmiot'}
              </button>
              <ShareButton
                id={entity.id}
                name={entity.organization_name}
                city={entity.city}
                country={entity.country}
                sector={entity.sector}
                locale={locale}
                votes={entity.votes}
              />
            </div>
          </div>
        </div>

        {/* Future: authenticated section */}
        <div className="bg-certo-navy/5 rounded-2xl border border-dashed border-certo-navy/10 p-8 text-center">
          <div className="text-3xl mb-3">🔐</div>
          <h3 className="text-lg font-semibold text-certo-navy mb-2">Panel reprezentanta</h3>
          <p className="text-sm text-certo-navy/50 max-w-md mx-auto">
            Zaloguj się jako reprezentant podmiotu, aby zobaczyć szczegóły procesu,
            rekomendacje i feedback z oceny Ocena Certo.
          </p>
          <button className="mt-4 px-6 py-2.5 bg-certo-navy text-white rounded-xl text-sm hover:bg-certo-navy/90 transition-colors">
            Zaloguj się
          </button>
        </div>
      </div>
    </div>
  );
}
