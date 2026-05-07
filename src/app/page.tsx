import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  BarChart3, DollarSign, ArrowRight, ExternalLink, TrendingUp, Map, Flame,
} from 'lucide-react';

const features = [
  {
    title: 'Probability Predictions',
    kicker: 'Who Wins?',
    description: 'Our model crunches historical data, campaign cash, and voter demographics to give you a real shot at knowing what passes — before Election Day.',
    icon: BarChart3,
    href: '/predictions',
    accent: 'border-t-4 border-indigo-500',
  },
  {
    title: 'Campaign Finance Analysis',
    kicker: 'Follow the Money',
    description: `Track real-time contributions and spending from Cal-Access. See who's backing each proposition — and how much they're spending to win your vote.`,
    icon: DollarSign,
    href: '/propositions',
    accent: 'border-t-4 border-slate-700',
  },
];

const dataSources = [
  { name: 'Cal-Access', description: 'Campaign finance data', url: 'https://cal-access.sos.ca.gov/' },
  { name: 'CA Secretary of State', description: 'Official election data', url: 'https://www.sos.ca.gov/elections/ballot-measures' },
  { name: 'Ballotpedia', description: 'Historical election results', url: 'https://ballotpedia.org/' },
];

const stats = [
  { label: 'Data Sources', value: '4+', icon: BarChart3 },
  { label: 'Live Finance', value: 'Real-Time', icon: TrendingUp },
  { label: 'CA Counties', value: '58', icon: Map },
  { label: 'Years of History', value: '10+', icon: Flame },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in" style={{ background: 'rgb(250 250 248)' }}>

      <section className="bg-white border-b-2 border-slate-700 py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
              <span className="breaking">Beta Release</span>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-serif">
                2026 California Election Cycle
              </span>
            </div>
            <div className="grid md:grid-cols-5 gap-8 items-start">
              <div className="md:col-span-3 border-r border-gray-200 pr-8">
                <p className="kicker mb-3">Ballot Measure Intelligence</p>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-5"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  What Will{' '}
                  <span className="italic text-indigo-500">California</span>{' '}
                  Voters Decide?
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed mb-6 font-serif">
                  Data-driven predictions for every statewide ballot measure — powered by real
                  campaign finance records, a decade of historical results, and a prediction
                  engine that refuses to guess.
                </p>
                <Link href="/propositions">
                  <Button size="lg" className="bg-slate-700 text-white hover:bg-slate-800 px-7 py-5 text-base font-semibold rounded-none">
                    View All Propositions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="md:col-span-2 space-y-0">
                <p className="kicker mb-3">By the Numbers</p>
                {stats.map((stat, i) => (
                  <div key={stat.label}
                    className={`flex items-center justify-between py-3 ${i < stats.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-serif uppercase tracking-wide">
                      <stat.icon className="h-3.5 w-3.5 text-gray-400" />
                      {stat.label}
                    </div>
                    <span className="text-2xl font-black text-gray-900"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'rgb(250 250 248)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-10 flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Inside This Edition
            </h2>
            <div className="flex-1 border-t-2 border-slate-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 bg-white max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <div className={`h-full p-8 hover:bg-gray-50 transition-colors cursor-pointer ${feature.accent} ${i < features.length - 1 ? 'border-r border-gray-200' : ''}`}>
                  <p className="kicker mb-2">{feature.kicker}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-serif">{feature.description}</p>
                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-gray-900 uppercase tracking-widest font-serif">
                    Read More <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="kicker mb-2">Live Tracking</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                2026 Ballot Measures
                <span className="italic text-indigo-500"> — updated as data arrives</span>
              </h2>
              <p className="text-gray-600 mt-3 max-w-xl font-serif text-sm leading-relaxed">
                Predictions for upcoming California propositions based on live campaign finance
                records from Cal-Access and historical election results from Ballotpedia.
                No guesswork. No fabricated numbers.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/predictions">
                <Button size="lg" className="w-full bg-slate-700 text-white hover:bg-slate-800 px-8 py-5 text-sm font-semibold rounded-none uppercase tracking-wider">
                  Predictions Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/propositions">
                <Button size="lg" variant="outline" className="w-full border-2 border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white px-8 py-5 text-sm font-semibold rounded-none uppercase tracking-wider">
                  Browse All Propositions <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: 'rgb(250 250 248)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-8 flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900 shrink-0"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Our Sources</h2>
            <div className="flex-1 border-t-2 border-slate-700" />
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 bg-white">
            {dataSources.map((source, i) => (
              <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer"
                className={`p-6 hover:bg-gray-50 transition-colors ${i < dataSources.length - 1 ? 'border-r border-gray-200' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{source.name}</h3>
                    <p className="text-sm text-gray-500 font-serif">{source.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-800 border-t-4 border-indigo-500">
        <div className="container mx-auto px-4 text-center">
          <p className="kicker text-slate-400 mb-3">Ready to Dig In?</p>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Democracy Works Better When{' '}
            <span className="italic text-indigo-400">Voters Are Informed.</span>
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto font-serif text-sm leading-relaxed">
            Dive into detailed analysis and understand how ballot measures might reshape California's legislative landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/propositions">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-5 text-sm font-semibold rounded-none uppercase tracking-wider">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/predictions">
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-5 text-sm font-semibold rounded-none uppercase tracking-wider">
                View Predictions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
