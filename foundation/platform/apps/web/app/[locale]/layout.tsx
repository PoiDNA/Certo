import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import AuthNav from "../../components/AuthNav";
import SiteNav from "../../components/SiteNav";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@certo/i18n/config";
import { routing } from "../../i18n-config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  // Generate hreflang links based on all supported locales
  const languages: Record<string, string> = {
    'x-default': `https://certogov.org/en`
  };
  
  locales.forEach((l) => {
    languages[l] = `https://certogov.org/${l}`;
  });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://certogov.org/${locale}`,
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
    <html lang={locale}>
      <body className="bg-certo-cream text-certo-navy antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <header className="bg-certo-navy text-certo-cream border-b-[3px] border-certo-gold relative">
            <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a href={`/${locale}`} className="flex items-center gap-4">
                  <img
                    src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/certo-logo-white-200-120.png"
                    width={200}
                    height={120}
                    alt="Certo Governance Institute"
                    className="h-10 w-auto"
                  />
                  <span className="hidden sm:inline-block border-l border-certo-cream/20 pl-4 text-certo-gold font-serif text-[0.7rem] uppercase tracking-[0.15em] leading-snug">
                    Cryptographic<br/>Rating
                  </span>
                </a>
              </div>
              <div className="flex items-center gap-8">
                <SiteNav />
                <AuthNav />
              </div>
            </div>
          </header>

          <main className="flex-grow mx-auto max-w-6xl px-6 w-full">
            {children}
          </main>

          <footer className="bg-certo-navy border-t-[3px] border-certo-gold mt-auto">
            <div className="mx-auto max-w-6xl px-6 py-10">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-certo-gold-light font-serif text-xl tracking-wide mb-2">Certo Governance Institute</div>
                  <p className="text-xs text-certo-cream/50 leading-relaxed">00-124 Warszawa, ul. Rondo ONZ 1</p>
                  <a href="mailto:rating@certogov.org" className="text-xs text-certo-cream/50 hover:text-certo-gold transition-colors">rating@certogov.org</a>
                </div>
                <div />
                <div className="flex flex-col items-start md:items-end gap-2 text-xs">
                  <a href={`/${locale}/privacy`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('privacy')}</a>
                  <a href={`/${locale}/terms`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('terms')}</a>
                  <a href={`/${locale}/contact`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('contact')}</a>
                </div>
              </div>
              <div className="border-t border-certo-gold/20 pt-6 text-center">
                <div className="text-xs text-certo-cream/40">
                  {tf('copyright', { year: new Date().getFullYear() })}
                </div>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}