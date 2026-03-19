'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('Contact');
  const [sent, setSent] = useState(false);

  const subjectKeys = ['subject_general', 'subject_advisory', 'subject_accreditation', 'subject_cooperation'] as const;

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
      <div className="bg-certo-accent/10 border border-certo-accent/30 p-8 text-center">
        <p className="text-sm text-certo-primary font-light">{t('form_success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        name="name"
        required
        placeholder={t('form_name')}
        className="w-full px-4 py-4 bg-certo-surface/50 border border-certo-border text-sm text-certo-primary placeholder:text-certo-muted focus:outline-none focus:border-certo-accent transition-colors"
      />
      <input
        name="email"
        type="email"
        required
        placeholder={t('form_email')}
        className="w-full px-4 py-4 bg-certo-surface/50 border border-certo-border text-sm text-certo-primary placeholder:text-certo-muted focus:outline-none focus:border-certo-accent transition-colors"
      />
      <select
        name="subject"
        required
        className="w-full px-4 py-4 bg-certo-surface/50 border border-certo-border text-sm text-certo-primary focus:outline-none focus:border-certo-accent transition-colors"
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
        className="w-full px-4 py-4 bg-certo-surface/50 border border-certo-border text-sm text-certo-primary placeholder:text-certo-muted focus:outline-none focus:border-certo-accent transition-colors resize-none"
      />
      <button
        type="submit"
        className="bg-certo-primary text-white py-4 px-10 font-semibold uppercase tracking-[0.15em] text-xs hover:bg-certo-accent transition-colors duration-300"
      >
        {t('form_submit')}
      </button>
    </form>
  );
}
