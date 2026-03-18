import type { Metadata } from "next";
import "../globals.css";
import AuthNav from "../../components/AuthNav";
import SiteNav from "../../components/SiteNav";
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@certo/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
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
            <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center justify-center text-center">
              <div className="text-certo-gold-light font-serif mb-4 text-2xl tracking-wide">Certo Governance Institute</div>
              <div className="text-xs text-certo-cream/60 mb-2">
                {tf('copyright', { year: new Date().getFullYear() })}
              </div>
              <div className="flex gap-4 text-xs">
                <a href={`/${locale}/privacy`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('privacy')}</a>
                <span className="text-certo-cream/40">&bull;</span>
                <a href={`/${locale}/terms`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('terms')}</a>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}