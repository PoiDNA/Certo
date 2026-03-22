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

export default function PilotApplicationForm() {
  const t = useTranslations('Pilot');
  const [state, setState] = useState<FormState>('idle');
  const [step, setStep] = useState<Step>('type');
  const [applicantType, setApplicantType] = useState<ApplicantType>('representative');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('submitting');
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('/api/pilot-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_type: applicantType,
          organization_name: data.get('organization_name'),
          city: data.get('city') || null,
          country: data.get('country') || 'PL',
          address: data.get('address') || null,
          postal_code: data.get('postal_code') || null,
          nip: data.get('nip') || null,
          krs: data.get('krs') || null,
          regon: data.get('regon') || null,
          website: data.get('website') || null,
          sector: data.get('sector'),
          contact_person: data.get('contact_person'),
          role: applicantType === 'representative' ? data.get('role') : null,
          email: data.get('email'),
          phone: data.get('phone') || null,
          motivation: data.get('motivation'),
          relation: applicantType === 'observer' ? data.get('relation') || null : null,
          consent: data.get('consent') === 'on',
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
      {/* Turnstile — always loaded, hidden until step 4 */}
      <div className={step === 'details' ? 'px-8' : 'sr-only'}>
        <TurnstileWidget onVerify={handleTurnstileVerify} onExpire={handleTurnstileExpire} />
      </div>

      {/* Progress bar */}
      <div className="flex">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 transition-colors duration-300 ${
              i <= stepIndex ? 'bg-certo-gold' : 'bg-certo-navy/5'
            }`}
          />
        ))}
      </div>

      {/* Step indicator */}
      <div className="px-8 pt-6 flex items-center justify-between">
        <span className="text-xs text-certo-navy/30 font-medium">
          {stepIndex + 1} / {STEPS.length}
        </span>
        {stepIndex > 0 && (
          <button type="button" onClick={goBack} className="text-xs text-certo-gold hover:text-certo-navy transition-colors">
            ← Wróć
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-8 pt-4">
        {/* STEP 1: Applicant type */}
        {step === 'type' && <div>
          <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">{t('form_applicant_type')}</h3>
          <p className="text-sm text-certo-navy/70 mb-6">Wybierz swoją rolę w procesie zgłoszenia</p>

          <div className="space-y-3">
            {(['representative', 'observer'] as const).map((type) => (
              <label
                key={type}
                className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  applicantType === type
                    ? 'border-certo-gold bg-certo-gold/5 shadow-sm'
                    : 'border-transparent bg-certo-cream/30 hover:bg-certo-cream/50'
                }`}
              >
                <input
                  type="radio"
                  name="applicant_type"
                  value={type}
                  checked={applicantType === type}
                  onChange={() => setApplicantType(type)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  applicantType === type ? 'border-certo-gold' : 'border-certo-navy/20'
                }`}>
                  {applicantType === type && <div className="w-2.5 h-2.5 rounded-full bg-certo-gold" />}
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
        </div>}

        {/* STEP 2: Organization info */}
        {step === 'org' && <div>
          <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">Dane podmiotu</h3>
          <p className="text-sm text-certo-navy/70 mb-6">Informacje o organizacji zgłaszanej do oceny</p>

          <div className="space-y-4">
            <input name="organization_name" required placeholder={applicantType === 'observer' ? t('form_org_name_observer') : t('form_org_name')} className={input} />

            <div className="relative">
              <select name="sector" required className={`${input} appearance-none pr-10 cursor-pointer`} defaultValue="">
                <option value="" disabled>{t('form_sector')}</option>
                <option value="publiczny">{t('form_sector_public')}</option>
                <option value="prywatny">{t('form_sector_corporate')}</option>
                <option value="pozarzadowy">{t('form_sector_ngo')}</option>
              </select>
              {CHEVRON}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input name="city" placeholder={t('form_city')} className={input} />
              <div className="relative">
                <select name="country" className={`${input} appearance-none pr-10 cursor-pointer`} defaultValue="PL">
                  <option value="PL">Polska</option>
                  <option value="AT">Austria</option><option value="BE">Belgia</option><option value="BG">Bułgaria</option>
                  <option value="HR">Chorwacja</option><option value="CY">Cypr</option><option value="CZ">Czechy</option>
                  <option value="DK">Dania</option><option value="EE">Estonia</option><option value="FI">Finlandia</option>
                  <option value="FR">Francja</option><option value="DE">Niemcy</option><option value="GR">Grecja</option>
                  <option value="HU">Węgry</option><option value="IE">Irlandia</option><option value="IT">Włochy</option>
                  <option value="LV">Łotwa</option><option value="LT">Litwa</option><option value="LU">Luksemburg</option>
                  <option value="MT">Malta</option><option value="NL">Holandia</option><option value="PT">Portugalia</option>
                  <option value="RO">Rumunia</option><option value="SK">Słowacja</option><option value="SI">Słowenia</option>
                  <option value="ES">Hiszpania</option><option value="SE">Szwecja</option>
                </select>
                {CHEVRON}
              </div>
            </div>

            {/* Registration data */}
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-certo-navy/80 hover:text-certo-navy transition-colors py-1">
                <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {t('form_registration_toggle')}
              </summary>
              <div className="space-y-3 pt-3 mt-2 border-t border-certo-navy/5">
                <div className="grid grid-cols-2 gap-3">
                  <input name="nip" placeholder={t('form_nip')} className={input} />
                  <input name="krs" placeholder={t('form_krs')} className={input} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input name="regon" placeholder={t('form_regon')} className={input} />
                  <input name="website" type="url" placeholder={t('form_website')} className={input} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input name="address" placeholder={t('form_address')} className={`${input} col-span-2`} />
                  <input name="postal_code" placeholder={t('form_postal_code')} className={input} />
                </div>
              </div>
            </details>
          </div>

          <button type="button" onClick={goNext} className="w-full mt-6 bg-certo-navy text-certo-gold py-3.5 rounded-xl text-sm font-semibold hover:bg-certo-gold hover:text-white transition-colors duration-300">
            Dalej →
          </button>
        </div>}

        {/* STEP 3: Contact info */}
        {step === 'contact' && <div>
          <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">Dane kontaktowe</h3>
          <p className="text-sm text-certo-navy/70 mb-6">Osoba odpowiedzialna za zgłoszenie</p>

          <div className="space-y-4">
            <input name="contact_person" required placeholder={t('form_contact_person')} className={input} />

            {applicantType === 'representative' && (
              <input name="role" placeholder={t('form_role')} className={input} />
            )}

            <input name="email" type="email" required placeholder={t('form_email')} className={input} />
            <input name="phone" type="tel" placeholder={t('form_phone')} className={input} />

            {applicantType === 'observer' && (
              <input name="relation" placeholder={t('form_relation_placeholder')} className={input} />
            )}
          </div>

          <button type="button" onClick={goNext} className="w-full mt-6 bg-certo-navy text-certo-gold py-3.5 rounded-xl text-sm font-semibold hover:bg-certo-gold hover:text-white transition-colors duration-300">
            Dalej →
          </button>
        </div>}

        {/* STEP 4: Motivation + submit */}
        {step === 'details' && <div>
          <h3 className="font-serif font-bold text-certo-navy text-xl mb-1">Ostatni krok</h3>
          <p className="text-sm text-certo-navy/70 mb-6">Powiedz nam dlaczego</p>

          <div className="space-y-4">
            <textarea
              name="motivation"
              required
              rows={4}
              placeholder={applicantType === 'observer' ? t('form_motivation_observer') : t('form_motivation_representative')}
              className={`${input} resize-none`}
            />

            <label className="flex items-start gap-3 text-xs text-certo-navy/60 cursor-pointer p-4 bg-certo-cream/30 rounded-xl">
              <input name="consent" type="checkbox" required className="mt-0.5 accent-certo-gold shrink-0" />
              <span>
                {t('form_consent')}
                {applicantType === 'observer' && (
                  <span className="block text-certo-navy/40 mt-1">{t('form_consent_observer_note')}</span>
                )}
              </span>
            </label>

            {state === 'error' && (
              <p className="text-sm text-red-600 text-center">{t('form_error')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="w-full mt-6 bg-certo-gold text-white py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-certo-navy hover:text-certo-gold transition-colors duration-300 disabled:opacity-50 shadow-lg shadow-certo-gold/20"
          >
            {state === 'submitting' ? 'Wysyłanie...' : t('form_submit')}
          </button>
        </div>}
      </form>
    </div>
  );
}
