import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../globals.css';
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@certo/i18n/config";
import { routing } from "../../i18n-config";
import SiteNav from "../../components/SiteNav";
import AuthNav from "../../components/AuthNav";
import ThemeProvider from "../../components/ThemeProvider";
import ThemeToggle from "../../components/ThemeToggle";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const languages: Record<string, string> = {
    'x-default': `https://certo.id/en`
  };

  locales.forEach((l) => {
    languages[l] = `https://certo.id/${l}`;
  });

  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/company/certo-id-favicon.png',
      apple: 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/company/certo-id-favicon.png',
    },
    alternates: {
      canonical: `https://certo.id/${locale}`,
      languages
    },
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply dark class + CSS vars before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var t=localStorage.getItem('certo-theme');
              var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);
              if(dark){
                var d=document.documentElement;
                d.classList.add('dark');
                d.style.setProperty('--certo-bg','#0A1E26');
                d.style.setProperty('--certo-fg','#E0F2F5');
                d.style.setProperty('--certo-fg-muted','rgba(224,242,245,0.6)');
                d.style.setProperty('--certo-card','#132830');
                d.style.setProperty('--certo-card-border','rgba(42,122,140,0.25)');
                d.style.setProperty('--certo-surface','rgba(42,122,140,0.10)');
                d.style.setProperty('--certo-header-bg','#0D2430');
              }
            }catch(e){}
          })();
        `}} />
      </head>
      <body className="bg-certo-bg text-certo-fg antialiased min-h-screen flex flex-col font-sans transition-colors duration-300">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-certo-teal focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Przejdź do treści
        </a>

        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <header className="bg-certo-header-bg border-b border-certo-card-border sticky top-0 z-50 shadow-sm relative transition-colors duration-300">
              <div className="w-full py-4 flex items-center justify-between px-6">
                <div className="flex items-center">
                  <Link href={`/${locale}`}>
                    <img
                      src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/company/images/certo-id-logo-400-120.png"
                      width={160}
                      height={48}
                      alt="Certo ID"
                      className="h-10 w-auto"
                    />
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                  <div className="md:order-2"><AuthNav /></div>
                  <SiteNav />
                </div>
              </div>
            </header>

            <main id="main-content" className="flex-grow w-full">
              {children}
            </main>

            <footer className="bg-certo-teal-darker text-white border-t border-certo-teal-dark mt-auto">
              <div className="w-full px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                  <div className="flex items-start gap-4">
                    <a href="https://www.certogov.org" target="_blank" rel="noreferrer" className="flex items-center gap-3">
                      <img
                        src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/certo-logo-white-200-120.png"
                        width={120}
                        height={60}
                        alt="Certo White Logo"
                        className="h-auto w-auto max-h-10"
                      />
                    </a>
                  </div>
                  <div className="text-xs text-certo-gray-light/50 leading-relaxed">
                    <p className="font-medium text-certo-gray-light/70 mb-1">Certo ID PSA</p>
                    <p>02-566 Warszawa, ul. Puławska 2B</p>
                    <a href="mailto:certo@certo.id" className="hover:text-certo-teal transition-colors">certo@certo.id</a>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2 text-xs text-certo-gray-light/60 font-medium">
                    <Link href={`/${locale}/privacy`} className="hover:text-certo-teal transition-colors">{tf('privacy')}</Link>
                    <Link href={`/${locale}/terms`} className="hover:text-certo-teal transition-colors">{tf('terms')}</Link>
                    <Link href={`/${locale}/contact`} className="hover:text-certo-teal transition-colors">{tf('contact')}</Link>
                  </div>
                </div>
                <div className="border-t border-certo-teal-dark pt-6 text-center">
                  <span className="text-xs text-certo-gray-light/40">{tf('copyright', { year: new Date().getFullYear() })}</span>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
