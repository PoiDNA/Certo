import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import AuthNav from "../../components/AuthNav";
import SiteNav from "../../components/SiteNav";
import LocaleSwitcher from "../../components/LocaleSwitcher";
import Footer from "../../components/Footer";
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
    icons: {
      icon: 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1/certo-favicon.png',
      apple: 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/web1/certo-favicon.png',
    },
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

  return (
    <html lang={locale}>
      <body className="bg-certo-cream text-certo-navy antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-certo-gold focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
          Przejdź do treści
        </a>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <header className="bg-certo-navy text-certo-cream border-b-[3px] border-certo-gold relative z-50">
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
                    Public Credibility<br/>Index
                  </span>
                </a>
              </div>
              <div className="flex items-center gap-6">
                <SiteNav />
                <div className="hidden md:block">
                  <LocaleSwitcher />
                </div>
                <AuthNav />
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-grow w-full">
            {children}
          </main>

          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
