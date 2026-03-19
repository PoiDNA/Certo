'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('Contact');
  const [sent, setSent] = useState(false);

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
      <div className="bg-certo-gold/10 border border-certo-gold/30 rounded-[2px] p-8 text-center">
        <p className="text-sm text-certo-navy">{t('form_success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        required
        placeholder={t('form_name')}
        className="w-full px-4 py-3 bg-white border border-certo-navy/10 rounded-[2px] text-sm text-certo-navy placeholder:text-certo-navy/40 focus:outline-none focus:border-certo-gold transition-colors"
      />
      <input
        name="email"
        type="email"
        required
        placeholder={t('form_email')}
        className="w-full px-4 py-3 bg-white border border-certo-navy/10 rounded-[2px] text-sm text-certo-navy placeholder:text-certo-navy/40 focus:outline-none focus:border-certo-gold transition-colors"
      />
      <select
        name="subject"
        required
        className="w-full px-4 py-3 bg-white border border-certo-navy/10 rounded-[2px] text-sm text-certo-navy focus:outline-none focus:border-certo-gold transition-colors"
      >
        {subjectKeys.map((key) => (
          <option key={key} value={t(key)}>{t(key)}</option>
        ))}
      </select>
      <textarea
        name="message"
        required
        rows={5}
        placeholder={t('form_message')}
        className="w-full px-4 py-3 bg-white border border-certo-navy/10 rounded-[2px] text-sm text-certo-navy placeholder:text-certo-navy/40 focus:outline-none focus:border-certo-gold transition-colors resize-none"
      />
      <button
        type="submit"
        className="bg-certo-navy text-certo-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-certo-gold hover:text-white transition-colors duration-300 rounded-[2px]"
      >
        {t('form_submit')}
      </button>
    </form>
  );
}
