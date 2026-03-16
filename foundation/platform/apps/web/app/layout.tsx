import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Certo Governance — Dokumentacja",
  description: "Portal dokumentacji Fundacji Certo Governance Institute i Spółki Certo ID PSA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-teal-700 flex items-center justify-center text-white font-bold text-sm">C</div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Certo Governance</h1>
                <p className="text-xs text-gray-500">Dokumentacja instytucjonalna</p>
              </div>
            </div>
            <nav className="flex gap-6 text-sm">
              <a href="/" className="text-gray-600 hover:text-teal-700">Dokumenty</a>
              <a href="/pipeline" className="text-gray-600 hover:text-teal-700">Pipeline</a>
              <a href="https://github.com/certo-governance/certo-governance" 
                 target="_blank" className="text-gray-400 hover:text-gray-600">GitHub</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-gray-400">
          Fundacja Certo Governance Institute © {new Date().getFullYear()}
{' · '}
<a href="/pp" style={{ color: '#9CA3AF' }}>Polityka Prywatności</a>
{' · '}
<a href="/terms" style={{ color: '#9CA3AF' }}>Warunki Korzystania</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
