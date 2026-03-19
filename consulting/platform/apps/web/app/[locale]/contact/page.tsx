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
    <div className="pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <div className="text-center mb-20">
          <h1 className="font-display text-4xl md:text-5xl text-certo-primary font-light mb-4">{t('title')}</h1>
          <p className="text-certo-muted">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-16">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-certo-accent font-semibold mb-3">{t('label_address')}</h3>
              <p className="text-sm text-certo-muted leading-relaxed font-light">
                Certo ID PSA<br />
                {t('address')}
              </p>
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-certo-accent font-semibold mb-3">{t('label_email')}</h3>
              <a href={`mailto:${t('email')}`} className="text-sm text-certo-muted hover:text-certo-accent transition-colors duration-300 font-light">
                {t('email')}
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-display text-2xl text-certo-primary font-light mb-8">{t('form_title')}</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
