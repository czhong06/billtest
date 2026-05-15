'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, FileText, Home, ExternalLink, Info } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Propositions', href: '/propositions', icon: FileText },
  { name: 'Predictions', href: '/predictions', icon: BarChart3 },
  { name: 'About', href: '/about', icon: Info },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 py-1 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-serif">
            California Edition · 2026 Election Cycle
          </span>
          <div className="flex items-center gap-4">
            <a href="https://www.sos.ca.gov/elections/ballot-measures" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider">
              CA SOS <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a href="https://cal-access.sos.ca.gov/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider">
              Cal-Access <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-b-2 border-slate-700 py-3 px-4">
        <div className="container mx-auto flex items-center justify-center">
          <Link href="/" className="flex flex-col items-center group">
            <span className="text-xs tracking-[0.25em] uppercase text-slate-400 font-serif mb-0.5">The California</span>
            <span className="text-3xl font-black text-slate-800 leading-none tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Proposition Predictor
            </span>
            <span className="text-xs tracking-[0.2em] uppercase text-slate-400 font-serif mt-0.5">
              Data-Driven · Nonpartisan · 2026
            </span>
          </Link>
        </div>
      </div>
      <div className="bg-slate-700">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-0">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors border-r border-slate-600 last:border-r-0',
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600 hover:text-white'
                  )}
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
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
