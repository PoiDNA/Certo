import Link from 'next/link';
import '../globals.css';
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@certo/i18n/config";
import SiteNav from "../../components/SiteNav";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
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
    alternates: {
      canonical: `https://certo.id/${locale}`,
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
      <body className="bg-certo-gray-light text-certo-teal-darker antialiased min-h-screen flex flex-col font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <header className="bg-white border-b border-certo-gray sticky top-0 z-50 shadow-sm relative">
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
              <SiteNav />
            </div>
          </header>

          <main className="flex-grow w-full">
            {children}
          </main>

          <footer className="bg-certo-teal-darker text-white border-t border-certo-teal-dark mt-auto">
            <div className="w-full px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <a href="https://www.certogov.org" target="_blank" rel="noreferrer" className="flex items-center gap-3">
                  <img
                    src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/certo-logo-white-200-120.png"
                    width={120}
                    height={60}
                    alt="Certo White Logo"
                    className="h-auto w-auto max-h-10"
                  />
                  <img
                    src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/certo-cryptographic-rating-logo-200-120.png"
                    width={160}
                    height={48}
                    alt="Certo Cryptographic Rating Logo"
                    className="h-10 w-auto"
                  />
                </a>
              </div>

              <div className="flex gap-6 text-xs text-certo-gray-light/60 font-medium">
                <span>{tf('copyright', { year: new Date().getFullYear() })}</span>
                <Link href={`/${locale}/privacy`} className="hover:text-certo-teal transition-colors">{tf('privacy')}</Link>
                <Link href={`/${locale}/terms`} className="hover:text-certo-teal transition-colors">{tf('terms')}</Link>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
