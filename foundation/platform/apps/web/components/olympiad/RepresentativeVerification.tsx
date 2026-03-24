"use client";

import { useState, useCallback } from "react";

interface Representative {
  name: string;
  role: string;
  source: string;
}

interface LookupResult {
  success: boolean;
  data: {
    source: string;
    org_name: string | null;
    org_type: string | null;
    address: string | null;
    nip: string | null;
    regon: string | null;
    krs: string | null;
    representatives: Representative[];
  } | null;
  error: string | null;
}

interface RepresentativeVerificationProps {
  locale: string;
  onRepresentativeSelected: (rep: {
    name: string;
    role: string;
    isFromRegistry: boolean;
    documentUrl?: string;
    orgName: string;
    orgNip: string;
  }) => void;
}

export default function RepresentativeVerification({
  locale,
  onRepresentativeSelected,
}: RepresentativeVerificationProps) {
  const isPl = locale === "pl";

  const [nip, setNip] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [useOtherPerson, setUseOtherPerson] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const handleLookup = useCallback(async () => {
    const cleanNip = nip.replace(/[\s-]/g, "");
    if (cleanNip.length !== 10) return;

    setLoading(true);
    setResult(null);
    setSelectedRep(null);
    setUseOtherPerson(false);

    try {
      const response = await fetch(`/api/olympiad/registry-lookup?nip=${cleanNip}`);
      const data: LookupResult = await response.json();
      setResult(data);
    } catch {
      setResult({ success: false, data: null, error: "Błąd połączenia z rejestrem" });
    } finally {
      setLoading(false);
    }
  }, [nip]);

  const handleSelectRep = (rep: Representative) => {
    setSelectedRep(rep.name);
    setUseOtherPerson(false);
    onRepresentativeSelected({
      name: rep.name,
      role: rep.role,
      isFromRegistry: true,
      orgName: result?.data?.org_name || "",
      orgNip: nip.replace(/[\s-]/g, ""),
    });
  };

  const handleOtherPerson = () => {
    setSelectedRep(null);
    setUseOtherPerson(true);
  };

  const handleOtherConfirm = () => {
    if (!otherName.trim()) return;
    onRepresentativeSelected({
      name: otherName.trim(),
      role: otherRole.trim() || "Pełnomocnik",
      isFromRegistry: false,
      documentUrl: documentFile?.name, // In production: upload to S3/R2
      orgName: result?.data?.org_name || "",
      orgNip: nip.replace(/[\s-]/g, ""),
    });
  };

  const inputClass =
    "block w-full rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-certo-gold/50";

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm">
        {isPl ? "Weryfikacja reprezentanta podmiotu" : "Organization representative verification"}
      </h3>
      <p className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
        {isPl
          ? "Podaj NIP organizacji — sprawdzimy w rejestrze kto jest uprawniony do jej reprezentowania."
          : "Enter the organization's NIP — we'll check the registry for authorized representatives."}
      </p>

      {/* NIP input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nip}
          onChange={(e) => setNip(e.target.value.replace(/[^\d\s-]/g, ""))}
          className={`${inputClass} flex-1 font-mono`}
          placeholder="NIP: 000-000-00-00"
          maxLength={13}
        />
        <button
          onClick={handleLookup}
          disabled={loading || nip.replace(/[\s-]/g, "").length !== 10}
          className="px-6 py-3 bg-certo-navy text-white text-sm font-medium rounded-lg hover:bg-certo-navy/90 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {isPl ? "Szukam..." : "Searching..."}
            </span>
          ) : (
            isPl ? "🔍 Sprawdź" : "🔍 Check"
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-xl border border-certo-navy/10 dark:border-certo-dark-border overflow-hidden">
          {/* Org info header */}
          {result.data?.org_name && (
            <div className="bg-certo-navy/5 dark:bg-certo-dark-surface p-4 border-b border-certo-navy/10 dark:border-certo-dark-border">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm">{result.data.org_name}</h4>
                  {result.data.org_type && (
                    <span className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">{result.data.org_type}</span>
                  )}
                  {result.data.address && (
                    <p className="text-xs text-certo-navy/40 dark:text-certo-dark-muted mt-1">📍 {result.data.address}</p>
                  )}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium">
                  ✓ {result.data.source === "rspo" ? "RSPO" : "KRS"}
                </span>
              </div>
            </div>
          )}

          {/* Representatives list */}
          {result.data?.representatives && result.data.representatives.length > 0 ? (
            <div className="p-4">
              <p className="text-xs font-medium text-certo-navy/60 dark:text-certo-dark-muted mb-3">
                {isPl ? "Osoby uprawnione do reprezentacji:" : "Authorized representatives:"}
              </p>
              <div className="space-y-2">
                {result.data.representatives.map((rep, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectRep(rep)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      selectedRep === rep.name
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                        : "border-certo-navy/10 dark:border-certo-dark-border hover:border-certo-gold/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{rep.name}</span>
                        <span className="ml-2 text-xs text-certo-navy/50 dark:text-certo-dark-muted">{rep.role}</span>
                      </div>
                      {selectedRep === rep.name && (
                        <span className="text-emerald-500 text-sm">✓ {isPl ? "Wybrany" : "Selected"}</span>
                      )}
                    </div>
                  </button>
                ))}

                {/* Other person option */}
                <button
                  onClick={handleOtherPerson}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    useOtherPerson
                      ? "border-certo-gold bg-certo-gold/5"
                      : "border-dashed border-certo-navy/20 dark:border-certo-dark-border hover:border-certo-gold/50"
                  }`}
                >
                  <span className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
                    👤 {isPl
                      ? "Inna osoba (pełnomocnik, nowy dyrektor, osoba upoważniona)"
                      : "Other person (proxy, new director, authorized person)"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {result.error ? (
                <div className="text-center py-4">
                  <p className="text-sm text-certo-navy/50 dark:text-certo-dark-muted mb-3">
                    ⚠️ {result.error}
                  </p>
                  <button
                    onClick={handleOtherPerson}
                    className="px-4 py-2 bg-certo-gold text-white text-sm rounded-lg"
                  >
                    {isPl ? "Wprowadź dane ręcznie" : "Enter data manually"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-certo-navy/50 dark:text-certo-dark-muted text-center py-4">
                  {isPl ? "Nie znaleziono osób uprawnionych do reprezentacji." : "No authorized representatives found."}
                </p>
              )}
            </div>
          )}

          {/* Other person form */}
          {useOtherPerson && (
            <div className="p-4 border-t border-certo-navy/10 dark:border-certo-dark-border bg-certo-gold/5 dark:bg-certo-gold/10 space-y-3">
              <p className="text-xs text-certo-navy/60 dark:text-certo-dark-muted">
                {isPl
                  ? "Jeśli reprezentant nie figuruje w rejestrze (np. nowy dyrektor, pełnomocnik), podaj dane i załącz dokument poświadczający."
                  : "If the representative is not in the registry (e.g., new director, proxy), provide details and attach an authorization document."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={otherName}
                  onChange={(e) => setOtherName(e.target.value)}
                  className={inputClass}
                  placeholder={isPl ? "Imię i nazwisko" : "Full name"}
                />
                <input
                  type="text"
                  value={otherRole}
                  onChange={(e) => setOtherRole(e.target.value)}
                  className={inputClass}
                  placeholder={isPl ? "Funkcja (np. Pełnomocnik, p.o. Dyrektor)" : "Role (e.g., Proxy, Acting Director)"}
                />
              </div>

              {/* Document upload */}
              <div>
                <label className="text-xs font-medium text-certo-navy/60 dark:text-certo-dark-muted mb-1 block">
                  📎 {isPl
                    ? "Dokument poświadczający (pełnomocnictwo, powołanie, uchwała)"
                    : "Authorization document (power of attorney, appointment, resolution)"}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-certo-navy/50 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-certo-navy/10 file:text-certo-navy hover:file:bg-certo-navy/20"
                />
                {documentFile && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ {documentFile.name} ({(documentFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              <button
                onClick={handleOtherConfirm}
                disabled={!otherName.trim() || !documentFile}
                className="px-4 py-2 bg-certo-gold text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {isPl ? "Potwierdź reprezentanta" : "Confirm representative"}
              </button>
              {!documentFile && otherName.trim() && (
                <p className="text-xs text-red-500">
                  {isPl ? "Załącz dokument poświadczający upoważnienie." : "Please attach an authorization document."}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
