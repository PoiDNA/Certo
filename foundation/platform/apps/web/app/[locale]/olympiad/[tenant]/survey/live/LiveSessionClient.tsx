"use client";

import { useState, useEffect, useCallback } from "react";
import type { SurveyGroup } from "../../../../../../lib/olympiad/types";

interface LiveSessionClientProps {
  locale: string;
  tenantSlug: string;
  tenantName: string;
  groups: SurveyGroup[];
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function generateQRUrl(tenantSlug: string, groupId: string, pin: string): string {
  // In production: would use a short URL like certo.id/live/XXXX
  // For demo: link to survey page with session params
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/pl/olympiad/${tenantSlug}/survey?group=${groupId}&pin=${pin}`;
}

export default function LiveSessionClient({
  locale,
  tenantSlug,
  tenantName,
  groups,
}: LiveSessionClientProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [pin, setPin] = useState("");
  const [respondents, setRespondents] = useState(0);
  const [maxUses, setMaxUses] = useState(30);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min in seconds
  const [pinTimeLeft, setPinTimeLeft] = useState(600); // 10 min PIN refresh

  const t = useCallback(
    (key: Record<string, string>) =>
      key[locale] || key.en || key.pl || Object.values(key)[0] || "",
    [locale]
  );

  // Countdown timer
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
      setPinTimeLeft((prev) => {
        if (prev <= 1) {
          // Refresh PIN every 10 minutes
          setPin(generatePin());
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  function startSession() {
    if (!selectedGroup) return;
    const newPin = generatePin();
    setPin(newPin);
    setSessionActive(true);
    setRespondents(0);
    setTimeLeft(900);
    setPinTimeLeft(600);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Pre-session: select group and max uses
  if (!sessionActive) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-2">Live Session</h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted mb-8">
          {locale === "pl"
            ? "Wyświetl QR na rzutniku — rodzice skanują swoimi telefonami"
            : "Display QR on projector — parents scan with their phones"}
        </p>

        <div className="space-y-4 text-left">
          <label className="block">
            <span className="text-sm font-medium">
              {locale === "pl" ? "Grupa" : "Group"}
            </span>
            <select
              value={selectedGroup || ""}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface px-4 py-3 text-base"
            >
              <option value="">
                {locale === "pl" ? "Wybierz grupę..." : "Select group..."}
              </option>
              {groups.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  {t(g.name)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              {locale === "pl" ? "Limit odpowiedzi" : "Response limit"}
            </span>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              min={5}
              max={200}
              className="mt-1 block w-full rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface px-4 py-3 text-base"
            />
          </label>

          <button
            onClick={startSession}
            disabled={!selectedGroup}
            className="w-full px-6 py-4 bg-certo-gold text-white font-bold rounded-xl text-lg hover:bg-certo-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locale === "pl" ? "Rozpocznij sesję" : "Start session"}
          </button>
        </div>
      </div>
    );
  }

  // Active session: fullscreen QR + PIN
  const qrUrl = generateQRUrl(tenantSlug, selectedGroup!, pin);
  // Use a QR code API for demo (Google Charts)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;

  return (
    <div className="fixed inset-0 bg-certo-navy dark:bg-certo-dark-bg flex flex-col items-center justify-center text-white z-50">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="text-sm opacity-70">
          Olimpiada Certo — {tenantName}
        </div>
        <button
          onClick={() => setSessionActive(false)}
          className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30"
        >
          {locale === "pl" ? "Zakończ sesję" : "End session"}
        </button>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-2xl mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageUrl}
          alt="QR Code"
          width={300}
          height={300}
          className="block"
        />
      </div>

      {/* PIN */}
      <div className="text-center mb-8">
        <div className="text-sm uppercase tracking-widest opacity-60 mb-2">
          PIN
        </div>
        <div className="text-7xl font-mono font-bold tracking-[0.3em] text-certo-gold">
          {pin}
        </div>
        <div className="text-xs opacity-40 mt-2">
          {locale === "pl"
            ? `PIN odświeża się za ${formatTime(pinTimeLeft)}`
            : `PIN refreshes in ${formatTime(pinTimeLeft)}`}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-3xl font-bold">{respondents}</div>
          <div className="text-xs opacity-60">
            / {maxUses}{" "}
            {locale === "pl" ? "odpowiedzi" : "responses"}
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
          <div className="text-xs opacity-60">
            {locale === "pl" ? "pozostało" : "remaining"}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 text-center text-sm opacity-50">
        {locale === "pl"
          ? "Zeskanuj QR swoim telefonem i wpisz PIN"
          : "Scan QR with your phone and enter PIN"}
      </div>
    </div>
  );
}
