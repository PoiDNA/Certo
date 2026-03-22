'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type ApplicantType = 'representative' | 'observer';

export default function PilotApplicationForm() {
  const t = useTranslations('Pilot');
  const [state, setState] = useState<FormState>('idle');
  const [applicantType, setApplicantType] = useState<ApplicantType>('representative');

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
          sector: data.get('sector'),
          contact_person: data.get('contact_person'),
          role: applicantType === 'representative' ? data.get('role') : null,
          email: data.get('email'),
          phone: data.get('phone') || null,
          motivation: data.get('motivation'),
          relation: applicantType === 'observer' ? data.get('relation') || null : null,
          consent: data.get('consent') === 'on',
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

  const inputClass = 'w-full px-4 py-3 bg-white border border-certo-navy/10 rounded-[2px] text-sm text-certo-navy placeholder:text-certo-navy/40 focus:outline-none focus:border-certo-gold transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Applicant type selector */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-certo-navy mb-2">{t('form_applicant_type')}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`relative flex flex-col p-4 border cursor-pointer transition-all ${
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
            className={`relative flex flex-col p-4 border cursor-pointer transition-all ${
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
          <option value="korporacyjny">{t('form_sector_corporate')}</option>
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

      {state === 'error' && (
        <p className="text-sm text-red-600">{t('form_error')}</p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="bg-certo-navy text-certo-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-certo-gold hover:text-white transition-colors duration-300 disabled:opacity-50"
      >
        {state === 'submitting' ? '...' : t('form_submit')}
      </button>
    </form>
  );
}
