'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import TurnstileWidget from './TurnstileWidget';

export default function ContactForm() {
  const t = useTranslations('Contact');
  const [sent, setSent] = useState(false);
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const handleTurnstileVerify = useCallback(() => setTurnstileVerified(true), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileVerified(false), []);

  const subjectKeys = ['subject_general', 'subject_rating', 'subject_methodology', 'subject_cooperation', 'subject_media'] as const;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const mailto = `mailto:${t('email')}?subject=${encodeURIComponent(data.get('subject') as string)}&body=${encodeURIComponent(
      `${data.get('name')}\n${data.get('email')}\n\n${data.get('message')}`
    )}`;
    window.location.href = mailto;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-certo-gold/10 border border-certo-gold/30 rounded-lg p-8 text-center">
        <p className="text-sm text-certo-navy">{t('form_success')}</p>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 bg-white border border-certo-navy/10 rounded-lg text-sm text-certo-navy placeholder:text-certo-navy/40 focus:outline-none focus:border-certo-gold focus:ring-1 focus:ring-certo-gold/20 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="name"
          required
          placeholder={t('form_name')}
          className={inputClass}
        />
        <input
          name="email"
          type="email"
          required
          placeholder={t('form_email')}
          className={inputClass}
        />
      </div>

      <div className="relative">
        <select
          name="subject"
          required
          className={`${inputClass} appearance-none pr-10 cursor-pointer`}
          defaultValue=""
        >
          <option value="" disabled>{t('subject_general')}</option>
          {subjectKeys.map((key) => (
            <option key={key} value={t(key)}>{t(key)}</option>
          ))}
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

      <textarea
        name="message"
        required
        rows={5}
        placeholder={t('form_message')}
        className={`${inputClass} resize-none`}
      />

      <TurnstileWidget onVerify={handleTurnstileVerify} onExpire={handleTurnstileExpire} />

      <button
        type="submit"
        disabled={!turnstileVerified && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        className="bg-certo-navy text-certo-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg hover:bg-certo-gold hover:text-white transition-colors duration-300 disabled:opacity-50"
      >
        {t('form_submit')}
      </button>
    </form>
  );
}
