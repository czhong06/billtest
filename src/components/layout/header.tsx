'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, FileText, Home, ExternalLink } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Propositions', href: '/propositions', icon: FileText },
  { name: 'Predictions', href: '/predictions', icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Top strip — edition/date line */}
      <div className="border-b border-gray-200 py-1 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-serif">
            California Edition · 2026 Election Cycle
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://www.sos.ca.gov/elections/ballot-measures"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wider"
            >
              CA SOS <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a
              href="https://cal-access.sos.ca.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wider"
            >
              Cal-Access <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b-2 border-gray-900 py-3 px-4">
        <div className="container mx-auto flex items-center justify-center">
          <Link href="/" className="flex flex-col items-center group">
            <span className="text-xs tracking-[0.25em] uppercase text-gray-500 font-serif mb-0.5">
              The California
            </span>
            <span
              className="text-3xl font-black text-gray-900 leading-none tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Proposition Predictor
            </span>
            <span className="text-xs tracking-[0.2em] uppercase text-gray-400 font-serif mt-0.5">
              Data-Driven · Nonpartisan · 2026
            </span>
          </Link>
        </div>
      </div>

      {/* Nav strip */}
      <div className="bg-gray-900">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-0">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors border-r border-gray-700 last:border-r-0',
                    isActive
                      ? 'bg-red-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  <item.icon className="h-3 w-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
