'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('Contact');
  const [sent, setSent] = useState(false);

  const subjectKeys = ['subject_general', 'subject_implementation', 'subject_technical', 'subject_cooperation'] as const;

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
      <div className="bg-certo-teal/10 border border-certo-teal/30 rounded p-8 text-center">
        <p className="text-sm text-certo-teal-darker">{t('form_success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        required
        placeholder={t('form_name')}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm text-certo-teal-darker placeholder:text-gray-400 focus:outline-none focus:border-certo-teal transition-colors"
      />
      <input
        name="email"
        type="email"
        required
        placeholder={t('form_email')}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm text-certo-teal-darker placeholder:text-gray-400 focus:outline-none focus:border-certo-teal transition-colors"
      />
      <select
        name="subject"
        required
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm text-certo-teal-darker focus:outline-none focus:border-certo-teal transition-colors"
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
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm text-certo-teal-darker placeholder:text-gray-400 focus:outline-none focus:border-certo-teal transition-colors resize-none"
      />
      <button
        type="submit"
        className="bg-certo-teal text-white px-8 py-3 text-sm font-semibold rounded hover:bg-certo-teal-darker transition-colors duration-300"
      >
        {t('form_submit')}
      </button>
    </form>
  );
}
