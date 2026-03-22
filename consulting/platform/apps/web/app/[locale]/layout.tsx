import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import '../globals.css';
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@certo/i18n/config";
import { routing } from "../../i18n-config";
import SiteNav from "../../components/SiteNav";
import AuthNav from "../../components/AuthNav";

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const languages: Record<string, string> = {
    'x-default': `https://certo.consulting/pl`
  };

  locales.forEach((l) => {
    languages[l] = `https://certo.consulting/${l}`;
  });

  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/consulting/certo-consulting-favicon.png',
      apple: 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/consulting/certo-consulting-favicon.png',
    },
    alternates: {
      canonical: `https://certo.consulting/${locale}`,
      languages
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const tf = await getTranslations({ locale, namespace: 'Footer' });

  return (
    <html lang={locale} className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <header className="absolute top-0 left-0 w-full z-50">
            <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-6 flex items-center justify-between">
              <a href={`/${locale}`} className="flex items-center">
                <img
                  src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/consulting/certo-consulting-logo-white-800-120.png.png"
                  alt="Certo Consulting"
                  className="h-10 w-auto"
                />
              </a>
              <div className="flex items-center gap-6">
                <div className="md:order-2"><AuthNav /></div>
                <SiteNav />
              </div>
            </div>
          </header>

          <main className="flex-grow w-full">
            {children}
          </main>

          <footer className="bg-certo-primary text-certo-surface pt-20 pb-10">
            <div className="max-w-[1280px] mx-auto px-6 md:px-20">
              <div className="grid md:grid-cols-3 gap-12 mb-16">
                <div>
                  <img
                    src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/consulting/certo-consulting-logo-gold-800-120.png.png"
                    alt="Certo Consulting"
                    className="h-10 w-auto mb-6"
                  />
                  <p className="text-sm text-certo-muted max-w-sm font-light">
                    {tf('description')}
                  </p>
                </div>
                <div>
                  <h4 className="font-display text-lg text-certo-accent tracking-wide mb-4">{tf('ecosystem')}</h4>
                  <div className="flex flex-col gap-3">
                    <a href="https://certogov.org" className="text-sm text-certo-surface/80 hover:text-certo-accent transition-colors duration-300">Fundacja CertoGov</a>
                    <a href="https://certo.id" className="text-sm text-certo-surface/80 hover:text-certo-accent transition-colors duration-300">Certo ID</a>
                  </div>
                </div>
                <div>
                  <h4 className="font-display text-lg text-certo-accent tracking-wide mb-4">{tf('contact')}</h4>
                  <p className="text-sm text-certo-muted font-light leading-relaxed">Certo ID PSA</p>
                  <p className="text-sm text-certo-muted font-light">02-566 Warszawa, ul. Puławska 2B</p>
                  <a href="mailto:certo@certo.consulting" className="text-sm text-certo-muted hover:text-certo-accent transition-colors duration-300 font-light">certo@certo.consulting</a>
                </div>
              </div>

              <div className="border-t border-certo-accent/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[11px] text-certo-muted uppercase tracking-[0.15em]">
                  {tf('accreditation')}
                </p>
                <div className="flex gap-6">
                  <a href={`/${locale}/polityka`} className="text-[11px] uppercase tracking-wider text-certo-muted hover:text-certo-accent transition-colors duration-300">{tf('privacy')}</a>
                  <a href={`/${locale}/regulamin`} className="text-[11px] uppercase tracking-wider text-certo-muted hover:text-certo-accent transition-colors duration-300">{tf('terms')}</a>
                  <a href={`/${locale}/contact`} className="text-[11px] uppercase tracking-wider text-certo-muted hover:text-certo-accent transition-colors duration-300">{tf('contact')}</a>
                </div>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
