import type { Metadata } from 'next';
import { Playfair_Display, Source_Serif_4 } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import './globals.css';

const sourceSans = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'California Proposition Predictor',
  description: 'Data-driven predictions for California ballot measures',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-800 antialiased font-body">
        <div className="h-1 bg-slate-700" />
        <div className="h-0.5 bg-indigo-500" />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
