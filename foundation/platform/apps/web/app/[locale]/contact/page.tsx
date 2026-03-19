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
    <div className="py-16 md:py-24 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-certo-navy mb-4">{t('title')}</h1>
        <p className="text-lg text-certo-navy/60">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-certo-gold font-semibold mb-2">Adres</h3>
            <p className="text-sm text-certo-navy/80 leading-relaxed">
              Certo Governance Institute<br />
              {t('address')}
            </p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-certo-gold font-semibold mb-2">Email</h3>
            <a href={`mailto:${t('email')}`} className="text-sm text-certo-navy/80 hover:text-certo-gold transition-colors">
              {t('email')}
            </a>
          </div>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-xl font-serif text-certo-navy mb-6">{t('form_title')}</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
