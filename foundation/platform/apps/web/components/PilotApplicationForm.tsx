'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function PilotApplicationForm() {
  const t = useTranslations('Pilot');
  const [state, setState] = useState<FormState>('idle');

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
          organization_name: data.get('organization_name'),
          sector: data.get('sector'),
          contact_person: data.get('contact_person'),
          email: data.get('email'),
          phone: data.get('phone') || null,
          motivation: data.get('motivation'),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="organization_name"
        required
        placeholder={t('form_org_name')}
        className={inputClass}
      />

      <select
        name="sector"
        required
        className={inputClass}
      >
        <option value="">{t('form_sector')}</option>
        <option value="publiczny">{t('form_sector_public')}</option>
        <option value="korporacyjny">{t('form_sector_corporate')}</option>
        <option value="pozarzadowy">{t('form_sector_ngo')}</option>
      </select>

      <input
        name="contact_person"
        required
        placeholder={t('form_contact_person')}
        className={inputClass}
      />

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
        placeholder={t('form_motivation')}
        className={`${inputClass} resize-none`}
      />

      <label className="flex items-start gap-3 text-sm text-certo-navy/70 cursor-pointer">
        <input
          name="consent"
          type="checkbox"
          required
          className="mt-1 accent-certo-gold"
        />
        <span>{t('form_consent')}</span>
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
