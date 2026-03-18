import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import '../globals.css';
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@certo/i18n/config";

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const languages: Record<string, string> = {
    'x-default': `https://certo.consulting/pl`
  };
  
  locales.forEach((l) => {
    languages[l] = `https://certo.consulting/${l}`;
  });

  return {
    title: 'Certo Consulting — Find Your Advisor',
    description: t('description'),
    alternates: {
      canonical: `https://certo.consulting/${locale}`,
      languages
    },
    robots: {
      index: false,
      follow: false,
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

  return (
    <html lang={locale} className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* Transparent Header */}
          <header className="absolute top-0 left-0 w-full z-50">
            <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-6 flex items-center justify-between">
              <a href={`/${locale}`} className="flex items-center">
                <img 
                  src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/consulting/certo-consulting-logo-white-800-120.png.png" 
                  alt="Certo Consulting" 
                  className="h-10 w-auto"
                />
              </a>
              <nav className="hidden md:flex items-center gap-8">
                <a href="#doradcy" className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent transition-colors duration-300">Doradcy</a>
                <a href="#ekspertyza" className="text-white uppercase text-xs tracking-[0.1em] hover:text-certo-accent transition-colors duration-300">Ekspertyza</a>
                <a href={`/${locale}/login`} className="text-white hover:text-certo-accent transition-colors duration-300 uppercase text-xs tracking-[0.1em] font-semibold">
                  Logowanie
                </a>
              </nav>
            </div>
          </header>

          <main className="flex-grow w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-certo-primary text-certo-surface pt-20 pb-10">
            <div className="max-w-[1280px] mx-auto px-6 md:px-20">
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div>
                  <img 
                    src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/consulting/certo-consulting-logo-gold-800-120.png.png" 
                    alt="Certo Consulting" 
                    className="h-10 w-auto mb-6"
                  />
                  <p className="text-sm text-certo-muted max-w-sm font-light">
                    Eksperckie doradztwo w zakresie ładu korporacyjnego, zgodności i bezpieczeństwa dla liderów rynkowych.
                  </p>
                </div>
                <div className="flex gap-16 md:justify-end">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-display text-lg text-certo-accent tracking-wide">Ekosystem Certo</h4>
                    <a href="https://certogov.org" className="text-sm text-certo-surface/80 hover:text-certo-accent transition-colors duration-300">Fundacja CertoGov</a>
                    <a href="https://certo.id" className="text-sm text-certo-surface/80 hover:text-certo-accent transition-colors duration-300">Certo ID</a>
                  </div>
                </div>
              </div>
              
              {/* Separator and Footer Bottom */}
              <div className="border-t border-certo-accent/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[11px] text-certo-muted uppercase tracking-[0.15em]">
                  Wszyscy doradcy są akredytowani przez Fundację Certo Governance Institute
                </p>
                <div className="flex gap-6">
                  <a href={`/${locale}/polityka`} className="text-[11px] uppercase tracking-wider text-certo-muted hover:text-certo-accent transition-colors duration-300">Polityka prywatności</a>
                  <a href={`/${locale}/regulamin`} className="text-[11px] uppercase tracking-wider text-certo-muted hover:text-certo-accent transition-colors duration-300">Regulamin</a>
                </div>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}