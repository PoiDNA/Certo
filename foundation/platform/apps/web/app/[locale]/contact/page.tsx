import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import ContactForm from '../../../components/ContactForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });
  return { title: t('title') };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Contact' });

  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-4">{t('title')}</h1>
        <p className="text-lg text-certo-navy/60 dark:text-certo-dark-text/60">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Contact info cards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-certo-dark-surface rounded-lg border border-certo-navy/5 dark:border-certo-dark-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-certo-navy rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C49A3C" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-certo-gold font-semibold">{t('label_address')}</h3>
            </div>
            <p className="text-sm text-certo-navy/70 dark:text-certo-dark-text/70 leading-relaxed pl-[52px]">
              Certo Governance Institute<br />
              {t('address')}
            </p>
          </div>

          <div className="bg-white dark:bg-certo-dark-surface rounded-lg border border-certo-navy/5 dark:border-certo-dark-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-certo-gold rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-certo-gold font-semibold">{t('label_email')}</h3>
            </div>
            <a href={`mailto:${t('email')}`} className="text-sm text-certo-navy/70 dark:text-certo-dark-text/70 hover:text-certo-gold transition-colors pl-[52px] block">
              {t('email')}
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-certo-dark-surface rounded-lg border border-certo-navy/5 dark:border-certo-dark-border p-8">
          <h2 className="text-xl font-serif font-bold text-certo-navy dark:text-certo-dark-text mb-6">{t('form_title')}</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
