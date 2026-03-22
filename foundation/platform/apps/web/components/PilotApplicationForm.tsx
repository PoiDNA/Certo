'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import TurnstileWidget from './TurnstileWidget';

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type ApplicantType = 'representative' | 'observer';

const STEPS = ['type', 'org', 'contact', 'details'] as const;
type Step = (typeof STEPS)[number];

const CHEVRON = (
  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-certo-navy/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface FormData {
  applicant_type: ApplicantType;
  organization_name: string;
  sector: string;
  city: string;
  country: string;
  address: string;
  postal_code: string;
  nip: string;
  krs: string;
  regon: string;
  website: string;
  contact_person: string;
  role: string;
  email: string;
  phone: string;
  relation: string;
  motivation: string;
  consent: boolean;
}

const INITIAL_DATA: FormData = {
  applicant_type: 'representative',
  organization_name: '', sector: '', city: '', country: 'PL',
  address: '', postal_code: '', nip: '', krs: '', regon: '', website: '',
  contact_person: '', role: '', email: '', phone: '', relation: '',
  motivation: '', consent: false,
};

export default function PilotApplicationForm() {
  const t = useTranslations('Pilot');
  const [state, setState] = useState<FormState>('idle');
  const [step, setStep] = useState<Step>('type');
  const [fd, setFd] = useState<FormData>(INITIAL_DATA);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const lookupEntity = async () => {
    if (!fd.nip && !fd.krs) return;
    setLookupState('loading');
    try {
      const res = await fetch('/api/lookup-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip: fd.nip, krs: fd.krs, country: fd.country }),
      });
      const data = await res.json();
      if (data.found) {
        setFd((prev) => ({
          ...prev,
          organization_name: data.name || prev.organization_name,
          address: data.address || prev.address,
          city: data.city || prev.city,
          postal_code: data.postalCode || prev.postal_code,
        }));
        setLookupState('found');
      } else {
        setLookupState('not_found');
      }
    } catch {
      setLookupState('not_found');
    }
  };

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);

  const set = (field: keyof FormData, value: string | boolean) =>
    setFd((prev) => ({ ...prev, [field]: value }));

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!fd.organization_name) missing.push('Nazwa podmiotu');
    if (!fd.sector) missing.push('Sektor');
    if (!fd.contact_person) missing.push('Imię i nazwisko');
    if (!fd.email) missing.push('Email');
    if (!fd.motivation) missing.push('Motywacja');
    if (!fd.consent) missing.push('Zgoda RODO');
    return missing;
  };

  const handleSubmit = async () => {
    const missing = getMissingFields();
    if (missing.length > 0) {
      setState('error');
      return;
    }
    setState('submitting');
    try {
      const res = await fetch('/api/pilot-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_type: fd.applicant_type,
          organization_name: fd.organization_name,
          city: fd.city || null,
          country: fd.country || 'PL',
          address: fd.address || null,
          postal_code: fd.postal_code || null,
          nip: fd.nip || null,
          krs: fd.krs || null,
          regon: fd.regon || null,
          website: fd.website || null,
          sector: fd.sector,
          contact_person: fd.contact_person,
          role: fd.applicant_type === 'representative' ? fd.role || null : null,
          email: fd.email,
          phone: fd.phone || null,
          motivation: fd.motivation,
          relation: fd.applicant_type === 'observer' ? fd.relation || null : null,
          consent: fd.consent,
          turnstile_token: turnstileToken,
        }),
      });
      setState(res.ok ? 'success' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 bg-certo-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CC9B30" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="font-serif font-bold text-certo-navy text-2xl mb-4">Zgłoszenie przyjęte</h3>
        <p className="text-base text-certo-navy/60 leading-relaxed">{t('form_success')}</p>
      </div>
    );
  }

  const input = 'w-full px-4 py-3.5 bg-certo-cream/30 border border-certo-navy/8 rounded-xl text-sm text-certo-navy placeholder:text-certo-navy/60 focus:outline-none focus:border-certo-gold focus:bg-white focus:shadow-sm transition-all duration-200';

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-xl mx-auto">
      {/* Turnstile — always loaded */}
      <div className={step === 'details' ? 'px-8' : 'sr-only'}>
        <TurnstileWidget onVerify={handleTurnstileVerify} onExpire={handleTurnstileExpire} />
      </div>

      {/* Progress bar */}
      <div className="flex">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-1 transition-colors duration-300 ${i <= stepIndex ? 'bg-certo-gold' : 'bg-certo-navy/5'}`} />
        ))}
      </div>

      {/* Step indicator */}
      <div className="px-8 pt-6 flex items-center justify-between">
        <span className="text-xs text-certo-navy/30 font-medium">{stepIndex + 1} / {STEPS.length}</span>
        {stepIndex > 0 && (
          <button type="button" onClick={goBack} className="text-xs text-certo-gold hover:text-certo-navy transition-colors">← Wróć</button>
        )}
      </div>

      <div className="p-8 pt-4">
        {/* STEP 1: Applicant type */}
        {step === 'type' && (
          <div>
            <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">{t('form_applicant_type')}</h3>
            <p className="text-sm text-certo-navy/70 mb-6">Wybierz swoją rolę w procesie zgłoszenia</p>
            <div className="space-y-3">
              {(['representative', 'observer'] as const).map((type) => (
                <label key={type} className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  fd.applicant_type === type ? 'border-certo-gold bg-certo-gold/5 shadow-sm' : 'border-transparent bg-certo-cream/30 hover:bg-certo-cream/50'
                }`}>
                  <input type="radio" value={type} checked={fd.applicant_type === type} onChange={() => set('applicant_type', type)} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${fd.applicant_type === type ? 'border-certo-gold' : 'border-certo-navy/20'}`}>
                    {fd.applicant_type === type && <div className="w-2.5 h-2.5 rounded-full bg-certo-gold" />}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-certo-navy block">{t(`form_type_${type}`)}</span>
                    <span className="text-xs text-certo-navy/50 mt-0.5 block">{t(`form_type_${type}_desc`)}</span>
                  </div>
                </label>
              ))}
            </div>
            <button type="button" onClick={goNext} className="w-full mt-6 bg-certo-navy text-certo-gold py-3.5 rounded-xl text-sm font-semibold hover:bg-certo-gold hover:text-white transition-colors duration-300">
              Dalej →
            </button>
          </div>
        )}

        {/* STEP 2: Organization info */}
        {step === 'org' && (
          <div>
            <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">Dane podmiotu</h3>
            <p className="text-sm text-certo-navy/70 mb-4">Wpisz NIP/VAT lub KRS — pobierzemy dane automatycznie</p>

            <div className="space-y-4">
              {/* Country selector first */}
              <div className="relative">
                <select value={fd.country} onChange={(e) => { set('country', e.target.value); setLookupState('idle'); }} className={`${input} appearance-none pr-10 cursor-pointer`}>
                  <option value="PL">🇵🇱 Polska</option><option value="AT">🇦🇹 Austria</option><option value="BE">🇧🇪 Belgia</option>
                  <option value="BG">🇧🇬 Bułgaria</option><option value="HR">🇭🇷 Chorwacja</option><option value="CY">🇨🇾 Cypr</option>
                  <option value="CZ">🇨🇿 Czechy</option><option value="DK">🇩🇰 Dania</option><option value="EE">🇪🇪 Estonia</option>
                  <option value="FI">🇫🇮 Finlandia</option><option value="FR">🇫🇷 Francja</option><option value="DE">🇩🇪 Niemcy</option>
                  <option value="GR">🇬🇷 Grecja</option><option value="HU">🇭🇺 Węgry</option><option value="IE">🇮🇪 Irlandia</option>
                  <option value="IT">🇮🇹 Włochy</option><option value="LV">🇱🇻 Łotwa</option><option value="LT">🇱🇹 Litwa</option>
                  <option value="LU">🇱🇺 Luksemburg</option><option value="MT">🇲🇹 Malta</option><option value="NL">🇳🇱 Holandia</option>
                  <option value="PT">🇵🇹 Portugalia</option><option value="RO">🇷🇴 Rumunia</option><option value="SK">🇸🇰 Słowacja</option>
                  <option value="SI">🇸🇮 Słowenia</option><option value="ES">🇪🇸 Hiszpania</option><option value="SE">🇸🇪 Szwecja</option>
                </select>
                {CHEVRON}
              </div>

              {/* NIP + KRS + Lookup button */}
              <div className="bg-certo-cream/40 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={fd.nip} onChange={(e) => { set('nip', e.target.value); setLookupState('idle'); }} placeholder={fd.country === 'PL' ? 'NIP (np. 5252344078)' : `VAT ID (np. ${fd.country}123456789)`} className={input} />
                  {fd.country === 'PL' && (
                    <input value={fd.krs} onChange={(e) => { set('krs', e.target.value); setLookupState('idle'); }} placeholder="KRS (opcjonalnie)" className={input} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={lookupEntity}
                  disabled={lookupState === 'loading' || (!fd.nip && !fd.krs)}
                  className="w-full py-2.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 bg-certo-gold/10 text-certo-gold hover:bg-certo-gold/20 border border-certo-gold/20"
                >
                  {lookupState === 'loading' ? '🔍 Wyszukuję w rejestrach...' : '🔍 Pobierz dane z rejestru'}
                </button>

                {lookupState === 'found' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                    ✅ Znaleziono podmiot. Dane zostały uzupełnione — sprawdź i potwierdź poniżej.
                  </div>
                )}
                {lookupState === 'not_found' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    ⚠️ Nie znaleziono podmiotu w rejestrze. Wypełnij dane ręcznie poniżej.
                  </div>
                )}
              </div>

              {/* Auto-filled or manual fields */}
              <input value={fd.organization_name} onChange={(e) => set('organization_name', e.target.value)} placeholder={fd.applicant_type === 'observer' ? t('form_org_name_observer') : t('form_org_name')} className={`${input} ${lookupState === 'found' && fd.organization_name ? 'border-green-300 bg-green-50/30' : ''}`} />

              <div className="relative">
                <select value={fd.sector} onChange={(e) => set('sector', e.target.value)} className={`${input} appearance-none pr-10 cursor-pointer`}>
                  <option value="" disabled>{t('form_sector')}</option>
                  <option value="publiczny">{t('form_sector_public')}</option>
                  <option value="prywatny">{t('form_sector_corporate')}</option>
                  <option value="pozarzadowy">{t('form_sector_ngo')}</option>
                </select>
                {CHEVRON}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input value={fd.city} onChange={(e) => set('city', e.target.value)} placeholder={t('form_city')} className={`${input} ${lookupState === 'found' && fd.city ? 'border-green-300 bg-green-50/30' : ''}`} />
                <input value={fd.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder={t('form_postal_code')} className={`${input} ${lookupState === 'found' && fd.postal_code ? 'border-green-300 bg-green-50/30' : ''}`} />
              </div>

              <input value={fd.address} onChange={(e) => set('address', e.target.value)} placeholder={t('form_address')} className={`${input} ${lookupState === 'found' && fd.address ? 'border-green-300 bg-green-50/30' : ''}`} />

              {/* Website */}
              <input value={fd.website} onChange={(e) => set('website', e.target.value)} type="url" placeholder={t('form_website')} className={input} />
            </div>
            <button type="button" onClick={goNext} className="w-full mt-6 bg-certo-navy text-certo-gold py-3.5 rounded-xl text-sm font-semibold hover:bg-certo-gold hover:text-white transition-colors duration-300">
              Dalej →
            </button>
          </div>
        )}

        {/* STEP 3: Contact info */}
        {step === 'contact' && (
          <div>
            <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">Dane kontaktowe</h3>
            <p className="text-sm text-certo-navy/70 mb-6">Osoba odpowiedzialna za zgłoszenie</p>
            <div className="space-y-4">
              <input value={fd.contact_person} onChange={(e) => set('contact_person', e.target.value)} placeholder={t('form_contact_person')} className={input} />
              {fd.applicant_type === 'representative' && (
                <input value={fd.role} onChange={(e) => set('role', e.target.value)} placeholder={t('form_role')} className={input} />
              )}
              <input value={fd.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder={t('form_email')} className={input} />
              <input value={fd.phone} onChange={(e) => set('phone', e.target.value)} type="tel" placeholder={t('form_phone')} className={input} />
              {fd.applicant_type === 'observer' && (
                <input value={fd.relation} onChange={(e) => set('relation', e.target.value)} placeholder={t('form_relation_placeholder')} className={input} />
              )}
            </div>
            <button type="button" onClick={goNext} className="w-full mt-6 bg-certo-navy text-certo-gold py-3.5 rounded-xl text-sm font-semibold hover:bg-certo-gold hover:text-white transition-colors duration-300">
              Dalej →
            </button>
          </div>
        )}

        {/* STEP 4: Motivation + submit */}
        {step === 'details' && (
          <div>
            <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">Ostatni krok</h3>
            <p className="text-sm text-certo-navy/70 mb-6">Powiedz nam dlaczego</p>
            <div className="space-y-4">
              <textarea
                value={fd.motivation}
                onChange={(e) => set('motivation', e.target.value)}
                rows={4}
                placeholder={fd.applicant_type === 'observer' ? t('form_motivation_observer') : t('form_motivation_representative')}
                className={`${input} resize-none`}
              />
              <label className="flex items-start gap-3 text-xs text-certo-navy/60 cursor-pointer p-4 bg-certo-cream/30 rounded-xl">
                <input type="checkbox" checked={fd.consent} onChange={(e) => set('consent', e.target.checked)} className="mt-0.5 accent-certo-gold shrink-0" />
                <span>
                  {t('form_consent')}
                  {fd.applicant_type === 'observer' && (
                    <span className="block text-certo-navy/40 mt-1">{t('form_consent_observer_note')}</span>
                  )}
                </span>
              </label>
              {state === 'error' && (
                <div className="text-sm text-red-600 text-center space-y-1">
                  <p>{t('form_error')}</p>
                  {getMissingFields().length > 0 && (
                    <p className="text-xs text-red-400">Uzupełnij: {getMissingFields().join(', ')}</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={state === 'submitting' || !fd.motivation || !fd.consent}
              className="w-full mt-6 bg-certo-gold text-white py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-certo-navy hover:text-certo-gold transition-colors duration-300 disabled:opacity-50 shadow-lg shadow-certo-gold/20"
            >
              {state === 'submitting' ? 'Wysyłanie...' : t('form_submit')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
