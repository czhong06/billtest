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
  title: 'California Proposition Predictor | Legislative Analysis & Forecasting',
  description:
    'A data-driven tool for estimating the probability that California statewide propositions pass, based on historical data, campaign finances, demographics, and ballot wording.',
  keywords: [
    'California',
    'propositions',
    'ballot measures',
    'predictions',
    'elections',
    'voting',
    'campaign finance',
    'demographics',
    'legislative tracking',
    'political analysis',
  ],
  authors: [{ name: 'CA Prop Predictor Team' }],
  openGraph: {
    title: 'California Proposition Predictor',
    description: 'Data-driven predictions for California ballot propositions',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAFAF8] text-gray-900 antialiased font-body">
        <div className="h-1 bg-gray-900" />
        <div className="h-0.5 bg-red-700" />

        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
