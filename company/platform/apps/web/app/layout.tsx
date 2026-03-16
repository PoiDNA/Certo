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
      <body>{children}</body>
    </html>
  );
}
