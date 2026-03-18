import { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Certo ID — Compliance Infrastructure',
  description: 'Weryfikacja tożsamości i compliance dla instytucji publicznych i korporacji.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-certo-gray-light text-certo-teal-darker antialiased min-h-screen flex flex-col font-sans">
        <header className="bg-white border-b border-certo-gray sticky top-0 z-50 shadow-sm">
          <div className="w-full py-4 flex items-center justify-between px-6">
            <div className="flex items-center">
              <Link href="/">
                <img 
                  src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/company/images/certo-id-logo-400-120.png"
                  width={160} 
                  height={48} 
                  alt="Certo ID" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide items-center">
              <a href="#rozwiazania" className="text-certo-gray-dark hover:text-certo-teal transition-colors duration-200">Rozwiązania</a>
              <a href="#technologia" className="text-certo-gray-dark hover:text-certo-teal transition-colors duration-200">Technologia</a>
              <a href="https://certogov.org" className="text-certo-teal hover:text-certo-teal-dark transition-colors duration-200">
                Fundacja Certo →
              </a>
              <a href="/login" className="px-5 py-2 border border-certo-teal bg-certo-teal text-white rounded-[2px] hover:bg-certo-teal-dark hover:border-certo-teal-dark transition-colors duration-200">Zaloguj się</a>
            </nav>
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
              <span>© {new Date().getFullYear()} Certo ID PSA</span>
              <a href="/privacy" className="hover:text-certo-teal transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-certo-teal transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
