import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import AuthNav from "../../components/AuthNav";
import SiteNav from "../../components/SiteNav";
import LocaleSwitcher from "../../components/LocaleSwitcher";
import Footer from "../../components/Footer";
import ThemeProvider from "../../components/ThemeProvider";
import ThemeToggle from "../../components/ThemeToggle";
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
      icon: [
        { url: '/favicon.ico', sizes: '32x32' },
        { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/apple-icon.png',
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
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply dark class + override Tailwind CSS vars before paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var t=localStorage.getItem('certo-theme');
              var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);
              if(dark){
                var d=document.documentElement;
                d.classList.add('dark');
                d.style.setProperty('--color-certo-bg','#0F1219');
                d.style.setProperty('--color-certo-fg','#E8E4DC');
                d.style.setProperty('--color-certo-fg-muted','rgba(232,228,220,0.6)');
                d.style.setProperty('--color-certo-card','#232D3F');
                d.style.setProperty('--color-certo-card-border','#2A3548');
                d.style.setProperty('--color-certo-surface','#1A2235');
              }
            }catch(e){}
          })();
        `}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Certo Governance Institute',
          url: 'https://certogov.org',
          logo: 'https://certogov.org/icon-192.png',
          description: 'Niezależna organizacja ratingowa oceniająca jakość zarządzania w sektorze publicznym, korporacyjnym, medycznym, obronnym i pozarządowym.',
          sameAs: ['https://certo.id', 'https://certo.consulting'],
        }) }} />
      </head>
      <body className="bg-certo-bg text-certo-fg antialiased min-h-screen flex flex-col transition-colors duration-300">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-certo-gold focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
          Przejdź do treści
        </a>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <header className="bg-certo-navy text-certo-cream border-b-[3px] border-certo-gold relative z-50 transition-colors duration-300">
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
                      {t('site_tagline_line1')}<br/>{t('site_tagline_line2')}
                    </span>
                  </a>
                </div>
                <div className="flex items-center gap-6">
                  <SiteNav />
                  <div className="hidden md:flex items-center gap-3">
                    <LocaleSwitcher />
                    <ThemeToggle />
                  </div>
                  <AuthNav />
                </div>
              </div>
            </header>

            <main id="main-content" className="flex-grow w-full">
              {children}
            </main>

            <Footer locale={locale} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
