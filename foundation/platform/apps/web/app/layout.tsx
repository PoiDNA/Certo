import type { Metadata } from "next";
import "./globals.css";
import AuthNav from "../components/AuthNav";

export const metadata: Metadata = {
  title: "Certo Governance Institute — Dokumentacja",
  description: "Portal dokumentacji Fundacji Certo Governance Institute",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-certo-cream text-certo-navy antialiased min-h-screen flex flex-col">
        <header className="bg-certo-navy text-certo-cream border-b-[3px] border-certo-gold">
          <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-4">
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
            <AuthNav />
          </div>
        </header>
        
        <main className="flex-grow mx-auto max-w-6xl px-6 py-12 w-full">
          {children}
        </main>
        
        <footer className="bg-certo-navy border-t-[3px] border-certo-gold mt-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center justify-center text-center">
            <div className="text-certo-gold-light font-serif mb-4 text-2xl tracking-wide">Certo Governance Institute</div>
            <div className="text-xs text-certo-cream/60 mb-2">
              Fundacja Certo Governance Institute © {new Date().getFullYear()}
            </div>
            <div className="flex gap-4 text-xs">
              <a href="/pp" className="text-certo-gold hover:text-certo-gold-light transition-colors">Polityka Prywatności</a>
              <span className="text-certo-cream/40">•</span>
              <a href="/terms" className="text-certo-gold hover:text-certo-gold-light transition-colors">Warunki Korzystania</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
