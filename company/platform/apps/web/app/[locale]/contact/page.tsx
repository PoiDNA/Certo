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
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-certo-teal-darker mb-3">{t('title')}</h1>
        <p className="text-certo-teal-darker/60">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-certo-teal font-semibold mb-2">{t('label_address')}</h3>
            <p className="text-sm text-certo-teal-darker/80 leading-relaxed">
              Certo ID PSA<br />
              {t('address')}
            </p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-certo-teal font-semibold mb-2">{t('label_email')}</h3>
            <a href={`mailto:${t('email')}`} className="text-sm text-certo-teal-darker/80 hover:text-certo-teal transition-colors">
              {t('email')}
            </a>
          </div>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-xl font-semibold text-certo-teal-darker mb-6">{t('form_title')}</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
