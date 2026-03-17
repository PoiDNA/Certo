import type { Metadata } from 'next';
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
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/company/images/certo-id-logo-400-120.png"
                width={160} 
                height={48} 
                alt="Certo ID" 
                className="h-10 w-auto"
              />
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide items-center">
              <a href="#rozwiazania" className="text-certo-gray-dark hover:text-certo-teal transition-colors duration-200">Rozwiązania</a>
              <a href="#technologia" className="text-certo-gray-dark hover:text-certo-teal transition-colors duration-200">Technologia</a>
              <a href="https://certo.org.pl" className="text-certo-teal hover:text-certo-teal-dark transition-colors duration-200">
                Fundacja Certo →
              </a>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow w-full">
          {children}
        </main>
        
        <footer className="bg-certo-teal-darker text-white border-t border-certo-teal-dark mt-auto">
          <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <img 
                src="https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/foundation/images/certo-logo-white-200-120.png"
                width={120} 
                height={60} 
                alt="Certo White Logo" 
                className="h-auto w-auto max-h-10"
              />
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
