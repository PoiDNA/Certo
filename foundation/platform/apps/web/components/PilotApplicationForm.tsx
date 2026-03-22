'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import TurnstileWidget from './TurnstileWidget';

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type ApplicantType = 'representative' | 'observer';

export default function PilotApplicationForm() {
  const t = useTranslations('Pilot');
  const [state, setState] = useState<FormState>('idle');
  const [applicantType, setApplicantType] = useState<ApplicantType>('representative');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

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

      if (res.ok) {
        setState('success');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="bg-certo-gold/10 border border-certo-gold/30 p-8 text-center">
        <p className="text-sm text-certo-navy">{t('form_success')}</p>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 bg-white border border-certo-navy/10 rounded-lg text-sm text-certo-navy placeholder:text-certo-navy/40 focus:outline-none focus:border-certo-gold focus:ring-1 focus:ring-certo-gold/20 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Applicant type selector */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-certo-navy mb-2">{t('form_applicant_type')}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
              applicantType === 'representative'
                ? 'border-certo-gold bg-certo-gold/5'
                : 'border-certo-navy/10 hover:border-certo-navy/30'
            }`}
          >
            <input
              type="radio"
              name="applicant_type"
              value="representative"
              checked={applicantType === 'representative'}
              onChange={() => setApplicantType('representative')}
              className="sr-only"
            />
            <span className="text-sm font-semibold text-certo-navy">{t('form_type_representative')}</span>
            <span className="text-xs text-certo-navy/50 mt-1">{t('form_type_representative_desc')}</span>
            {applicantType === 'representative' && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-certo-gold rounded-full" />
            )}
          </label>
          <label
            className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
              applicantType === 'observer'
                ? 'border-certo-gold bg-certo-gold/5'
                : 'border-certo-navy/10 hover:border-certo-navy/30'
            }`}
          >
            <input
              type="radio"
              name="applicant_type"
              value="observer"
              checked={applicantType === 'observer'}
              onChange={() => setApplicantType('observer')}
              className="sr-only"
            />
            <span className="text-sm font-semibold text-certo-navy">{t('form_type_observer')}</span>
            <span className="text-xs text-certo-navy/50 mt-1">{t('form_type_observer_desc')}</span>
            {applicantType === 'observer' && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-certo-gold rounded-full" />
            )}
          </label>
        </div>
      </fieldset>

      <input
        name="organization_name"
        required
        placeholder={applicantType === 'observer' ? t('form_org_name_observer') : t('form_org_name')}
        className={inputClass}
      />

      <div className="relative">
        <select
          name="sector"
          required
          className={`${inputClass} appearance-none pr-10 cursor-pointer`}
          defaultValue=""
        >
          <option value="" disabled>{t('form_sector')}</option>
          <option value="publiczny">{t('form_sector_public')}</option>
          <option value="prywatny">{t('form_sector_corporate')}</option>
          <option value="pozarzadowy">{t('form_sector_ngo')}</option>
        </select>
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-certo-navy/40 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="city"
          placeholder={t('form_city')}
          className={inputClass}
        />
        <div className="relative">
          <select
            name="country"
            className={`${inputClass} appearance-none pr-10 cursor-pointer`}
            defaultValue="PL"
          >
            <option value="PL">Polska</option>
            <option value="AT">Austria</option>
            <option value="BE">Belgia</option>
            <option value="BG">Bułgaria</option>
            <option value="HR">Chorwacja</option>
            <option value="CY">Cypr</option>
            <option value="CZ">Czechy</option>
            <option value="DK">Dania</option>
            <option value="EE">Estonia</option>
            <option value="FI">Finlandia</option>
            <option value="FR">Francja</option>
            <option value="DE">Niemcy</option>
            <option value="GR">Grecja</option>
            <option value="HU">Węgry</option>
            <option value="IE">Irlandia</option>
            <option value="IT">Włochy</option>
            <option value="LV">Łotwa</option>
            <option value="LT">Litwa</option>
            <option value="LU">Luksemburg</option>
            <option value="MT">Malta</option>
            <option value="NL">Holandia</option>
            <option value="PT">Portugalia</option>
            <option value="RO">Rumunia</option>
            <option value="SK">Słowacja</option>
            <option value="SI">Słowenia</option>
            <option value="ES">Hiszpania</option>
            <option value="SE">Szwecja</option>
          </select>
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-certo-navy/40 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Registration data — collapsible */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-certo-navy/60 hover:text-certo-navy transition-colors py-2">
          <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {t('form_registration_toggle')}
        </summary>
        <div className="space-y-4 pt-3 pl-6 border-l-2 border-certo-gold/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="address"
              placeholder={t('form_address')}
              className={inputClass}
            />
            <input
              name="postal_code"
              placeholder={t('form_postal_code')}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              name="nip"
              placeholder={t('form_nip')}
              className={inputClass}
            />
            <input
              name="krs"
              placeholder={t('form_krs')}
              className={inputClass}
            />
            <input
              name="regon"
              placeholder={t('form_regon')}
              className={inputClass}
            />
          </div>
          <input
            name="website"
            type="url"
            placeholder={t('form_website')}
            className={inputClass}
          />
        </div>
      </details>

      <input
        name="contact_person"
        required
        placeholder={t('form_contact_person')}
        className={inputClass}
      />

      {applicantType === 'representative' && (
        <input
          name="role"
          placeholder={t('form_role')}
          className={inputClass}
        />
      )}

      <input
        name="email"
        type="email"
        required
        placeholder={t('form_email')}
        className={inputClass}
      />

      <input
        name="phone"
        type="tel"
        placeholder={t('form_phone')}
        className={inputClass}
      />

      <textarea
        name="motivation"
        required
        rows={4}
        placeholder={applicantType === 'observer' ? t('form_motivation_observer') : t('form_motivation_representative')}
        className={`${inputClass} resize-none`}
      />

      {applicantType === 'observer' && (
        <input
          name="relation"
          placeholder={t('form_relation_placeholder')}
          className={inputClass}
        />
      )}

      <label className="flex items-start gap-3 text-sm text-certo-navy/70 cursor-pointer">
        <input
          name="consent"
          type="checkbox"
          required
          className="mt-1 accent-certo-gold"
        />
        <span>
          {t('form_consent')}
          {applicantType === 'observer' && (
            <span className="block text-xs text-certo-navy/50 mt-1">{t('form_consent_observer_note')}</span>
          )}
        </span>
      </label>

      <TurnstileWidget onVerify={handleTurnstileVerify} onExpire={handleTurnstileExpire} />

      {state === 'error' && (
        <p className="text-sm text-red-600">{t('form_error')}</p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="bg-certo-navy text-certo-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg hover:bg-certo-gold hover:text-white transition-colors duration-300 disabled:opacity-50"
      >
        {state === 'submitting' ? '...' : t('form_submit')}
      </button>
    </form>
  );
}
