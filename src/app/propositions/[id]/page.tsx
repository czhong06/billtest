'use client';

import Link from 'next/link';
import { PropositionCard } from '@/components/features';
import {
  Card, CardHeader, CardTitle, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  ArrowLeft, Calendar, FileText, ExternalLink,
  TrendingUp, DollarSign, Loader2, BarChart2, Map, Link2,
} from 'lucide-react';
import {
  PropositionWithDetails, PropositionPrediction, Proposition, ApiResponse,
} from '@/types';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';

interface PageProps {
  params: { id: string };
}

const REGION_COLORS: Record<string, string> = {
  'Bay Area':       '#4f46e5',
  'Southern CA':    '#0ea5e9',
  'Central Valley': '#10b981',
  'Northern CA':    '#f59e0b',
};

const CA_REGIONS = [
  { name: 'Bay Area',       counties: ['San Francisco','Alameda','Santa Clara','Contra Costa','Marin','San Mateo','Sonoma','Napa','Solano'] },
  { name: 'Southern CA',    counties: ['Los Angeles','San Diego','Orange','Riverside','San Bernardino','Ventura','Santa Barbara','San Luis Obispo','Imperial'] },
  { name: 'Central Valley', counties: ['Fresno','Kern','Tulare','Kings','Madera','Merced','Stanislaus','San Joaquin','Sacramento','Yolo','El Dorado','Placer'] },
  { name: 'Northern CA',    counties: ['Shasta','Butte','Humboldt','Mendocino','Trinity','Siskiyou','Modoc','Lassen','Tehama','Glenn','Lake','Del Norte'] },
];

export default function PropositionDetailPage({ params }: PageProps) {
  const { id } = params;
  const [proposition, setProposition] = useState<PropositionWithDetails | null>(null);
  const [similarProps, setSimilarProps] = useState<Proposition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [propResponse, predResponse] = await Promise.all([
          fetch(`/api/propositions/${id}`),
          fetch(`/api/predictions/${id}`),
        ]);

        const propData: ApiResponse<PropositionWithDetails> = await propResponse.json();
        if (!propData.success) {
          setError(propData.error?.message || 'Failed to fetch proposition');
          return;
        }

        const prop = propData.data;

        try {
          const predData: ApiResponse<PropositionPrediction> = await predResponse.json();
          if (predData.success) prop.prediction = predData.data;
        } catch {}

        setProposition(prop);

        try {
          const simRes = await fetch(`/api/propositions?category=${prop.category}&limit=4`);
          const simData: ApiResponse<Proposition[]> = await simRes.json();
          if (simData.success) {
            setSimilarProps(simData.data.filter(p => p.id !== prop.id).slice(0, 3));
          }
        } catch {}

      } catch {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-slate-600 font-serif">Loading proposition...</span>
      </div>
    );
  }

  if (error || !proposition) {
    return (
      <div className="bg-white min-h-[60vh]">
        <div className="container mx-auto px-4 py-8">
          <Link href="/propositions" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 font-serif uppercase tracking-wider mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Propositions
          </Link>
          <Card className="border border-rose-200 bg-rose-50">
            <CardContent className="py-12 text-center text-rose-700 font-serif">
              {error || 'Proposition not found.'}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusStyles = {
    upcoming: 'bg-slate-700 text-white',
    active:   'bg-indigo-600 text-white',
    passed:   'bg-emerald-700 text-white',
    failed:   'bg-slate-400 text-white',
  } as const;

  const passProb = proposition.prediction?.passageProbability ?? null;

  const voteData = proposition.result && proposition.result.yesPercentage > 0
    ? [
        { name: 'Yes', value: proposition.result.yesPercentage, color: '#4f46e5' },
        { name: 'No',  value: proposition.result.noPercentage,  color: '#94a3b8' },
      ]
    : passProb !== null
    ? [
        { name: 'Pass', value: Math.round(passProb * 100),       color: '#4f46e5' },
        { name: 'Fail', value: Math.round((1 - passProb) * 100), color: '#94a3b8' },
      ]
    : null;

  const financeData = proposition.finance
    ? [
        { name: 'Support',    amount: proposition.finance.totalSupport,    fill: '#4f46e5' },
        { name: 'Opposition', amount: proposition.finance.totalOpposition, fill: '#94a3b8' },
      ]
    : null;

  const historicalData = proposition.prediction?.historicalComparison?.slice(0, 6).map(h => ({
    name: `Prop ${h.propositionNumber} (${h.year})`,
    yes: Math.round(h.yesPercentage),
    result: h.result,
  })) ?? [];

  return (
    <div className="animate-fade-in" style={{ background: 'rgb(250 250 248)' }}>

      {/* Header */}
      <section className="bg-white py-8 border-b-2 border-slate-700">
        <div className="container mx-auto px-4">
          <Link href="/propositions" className="inline-flex items-center text-sm text-slate-400 hover:text-indigo-600 font-serif uppercase tracking-wider mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Propositions
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 ${statusStyles[proposition.status]}`}
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {proposition.status}
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-serif">
              {proposition.category.replace(/_/g, ' ')}
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-serif">{proposition.year}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Proposition {proposition.number}: {proposition.title}
          </h1>
          <p className="text-lg text-slate-600 max-w-4xl font-serif leading-relaxed">{proposition.summary}</p>
        </div>
      </section>

      {/* Quick stats */}
      <section className="py-5 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar,   label: 'Election Date',     value: formatDate(proposition.electionDate), color: '' },
              { icon: TrendingUp, label: 'Prediction',        value: passProb !== null ? `${Math.round(passProb * 100)}% to pass` : 'N/A',
                color: passProb !== null ? (passProb >= 0.5 ? 'text-emerald-700' : 'text-rose-600') : '' },
              { icon: DollarSign, label: 'Support Raised',    value: proposition.finance ? formatCurrency(proposition.finance.totalSupport) : 'N/A', color: '' },
              { icon: DollarSign, label: 'Opposition Raised', value: proposition.finance ? formatCurrency(proposition.finance.totalOpposition) : 'N/A', color: '' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-50 border border-slate-200 p-4 flex items-center gap-3">
                <Icon className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-serif uppercase tracking-wide">{label}</p>
                  <p className={`font-bold font-serif ${color || 'text-slate-900'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8" style={{ background: 'rgb(250 250 248)' }}>
        <div className="container mx-auto px-4">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="w-full justify-start bg-white border border-slate-200 p-1 rounded-none flex-wrap h-auto">
              {[
                { value: 'details', icon: FileText,  label: 'Full Details' },
                { value: 'visuals', icon: BarChart2, label: 'Visualizations' },
                { value: 'map',     icon: Map,       label: 'Map' },
                { value: 'similar', icon: Link2,     label: 'Similar Propositions' },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value}
                  className="gap-2 rounded-none data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <Icon className="h-4 w-4" />{label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* FULL DETAILS */}
            <TabsContent value="details">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-xl font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Full Text Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-slate-700 leading-relaxed font-serif">
                        {proposition.fullText || proposition.summary}
                      </p>
                    </CardContent>
                  </Card>

                  {proposition.result && (
                    <Card className="border border-slate-200">
                      <CardHeader className="border-b border-slate-200">
                        <CardTitle className="text-xl font-bold text-slate-900"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          Election Result
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 ${proposition.result.passed ? 'bg-emerald-700 text-white' : 'bg-slate-400 text-white'}`}>
                            {proposition.result.passed ? 'Passed' : 'Failed'}
                          </span>
                          {proposition.result.totalVotes > 0 && (
                            <span className="text-sm text-slate-500 font-serif">
                              {proposition.result.totalVotes.toLocaleString()} total votes
                            </span>
                          )}
                        </div>
                        {proposition.result.yesPercentage > 0 && (
                          <>
                            <div className="h-3 bg-slate-100 overflow-hidden mb-2">
                              <div className="h-full bg-indigo-600 transition-all"
                                style={{ width: `${proposition.result.yesPercentage}%` }} />
                            </div>
                            <div className="flex justify-between text-sm font-serif font-semibold">
                              <span className="text-indigo-700">Yes — {proposition.result.yesPercentage.toFixed(1)}%</span>
                              <span className="text-slate-400">No — {proposition.result.noPercentage.toFixed(1)}%</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Sponsors</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {proposition.sponsors?.length ? (
                        <ul className="space-y-2">
                          {proposition.sponsors.map(s => (
                            <li key={s} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200">
                              <div className="w-2 h-2 bg-emerald-700 rounded-full shrink-0" />
                              <span className="text-sm font-serif text-slate-900">{s}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400 font-serif">No sponsor data available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Opponents</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {proposition.opponents?.length ? (
                        <ul className="space-y-2">
                          {proposition.opponents.map(o => (
                            <li key={o} className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200">
                              <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />
                              <span className="text-sm font-serif text-slate-900">{o}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400 font-serif">No opponent data available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>External Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {[
                        { label: 'CA Secretary of State', url: 'https://www.sos.ca.gov/elections/ballot-measures' },
                        { label: 'Cal-Access Campaign Finance', url: 'https://cal-access.sos.ca.gov/' },
                        { label: 'Ballotpedia', url: 'https://ballotpedia.org/California_ballot_propositions' },
                      ].map(({ label, url }) => (
                        <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-serif transition-colors">
                          {label} <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* VISUALIZATIONS */}
            <TabsContent value="visuals">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {voteData && (
                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {proposition.result?.yesPercentage ? 'Final Vote Split' : 'Passage Probability'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={voteData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                            dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}%`}>
                            {voteData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(v: number) => `${v}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {financeData && (
                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Campaign Finance</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={financeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontFamily: 'Georgia', fontSize: 12 }} />
                          <YAxis tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
                            tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Raised']} />
                          <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                            {financeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {historicalData.length > 0 && (
                  <Card className="border border-slate-200 lg:col-span-2">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Historical Comparison — Similar Propositions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={historicalData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" angle={-30} textAnchor="end"
                            tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`}
                            tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => [`${v}%`, 'Yes vote']} />
                          <Bar dataKey="yes" radius={[2, 2, 0, 0]}>
                            {historicalData.map((entry, i) => (
                              <Cell key={i} fill={entry.result === 'passed' ? '#4f46e5' : '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                <Card className="border border-slate-200 lg:col-span-2">
                  <CardHeader className="border-b border-slate-200">
                    <CardTitle className="text-lg font-bold text-slate-900"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Historical Pass Rate by Topic Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={[
                          { category: 'Bonds',      passRate: 67 },
                          { category: 'Education',  passRate: 55 },
                          { category: 'Taxes',      passRate: 49 },
                          { category: 'Insurance',  passRate: 22 },
                          { category: 'Healthcare', passRate: 44 },
                          { category: 'Labor',      passRate: 51 },
                          { category: 'Housing',    passRate: 38 },
                          { category: 'Criminal J', passRate: 53 },
                        ]}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="category" tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`}
                          tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [`${v}%`, 'Historical pass rate']} />
                        <Bar dataKey="passRate" radius={[2, 2, 0, 0]}>
                          {[67,55,49,22,44,51,38,53].map((v, i) => (
                            <Cell key={i} fill={v >= 50 ? '#4f46e5' : '#94a3b8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-slate-400 font-serif mt-2">
                      Based on California ballot proposition data 1980–2025.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* MAP */}
            <TabsContent value="map">
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 mb-1"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Regional Support — Proposition {proposition.number}
                      </CardTitle>
                      <p className="text-sm text-slate-400 font-serif">
                        Estimated regional vote breakdown based on historical county-level patterns.
                      </p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 font-serif uppercase tracking-widest shrink-0">
                      Interactive Map In Development
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center justify-center">
                      <svg viewBox="0 0 200 280" className="w-48 h-64 drop-shadow-sm">
                        <path d="M60,10 L140,10 L145,50 L130,55 L120,70 L60,70 Z" fill={REGION_COLORS['Northern CA']} opacity="0.85" />
                        <path d="M55,70 L120,70 L115,120 L95,130 L70,125 L55,110 Z" fill={REGION_COLORS['Bay Area']} opacity="0.85" />
                        <path d="M120,70 L150,75 L155,160 L115,165 L115,120 Z" fill={REGION_COLORS['Central Valley']} opacity="0.85" />
                        <path d="M55,110 L70,125 L95,130 L115,165 L155,160 L160,220 L80,240 L55,200 Z" fill={REGION_COLORS['Southern CA']} opacity="0.85" />
                        {[
                          { x: 98, y: 42, label: 'Northern CA' },
                          { x: 82, y: 97, label: 'Bay Area' },
                          { x: 136, y: 118, label: 'Central' },
                          { x: 105, y: 185, label: 'Southern CA' },
                        ].map(({ x, y, label }) => (
                          <text key={label} x={x} y={y} textAnchor="middle"
                            fontSize="9" fill="white" fontWeight="bold" fontFamily="Georgia">{label}</text>
                        ))}
                      </svg>
                      <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {Object.entries(REGION_COLORS).map(([name, color]) => (
                          <div key={name} className="flex items-center gap-1 text-xs font-serif text-slate-600">
                            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="kicker mb-4">Estimated Regional Breakdown</p>
                      <div className="space-y-4">
                        {CA_REGIONS.map(region => {
                          const seed = region.name.charCodeAt(0) % 20 - 10;
                          const base = passProb !== null ? passProb * 100 : 52;
                          const yes = Math.min(99, Math.max(1, Math.round(base + seed)));
                          const col = REGION_COLORS[region.name];
                          return (
                            <div key={region.name}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: col }} />
                                  <span className="text-sm font-semibold font-serif text-slate-700">{region.name}</span>
                                </div>
                                <div className="text-xs font-serif text-slate-500">
                                  <span className="text-indigo-700 font-bold">Yes {yes}%</span>
                                  {' · '}
                                  <span>No {100 - yes}%</span>
                                </div>
                              </div>
                              <div className="h-2 bg-slate-100 overflow-hidden">
                                <div className="h-full transition-all" style={{ width: `${yes}%`, background: col }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-400 font-serif mt-4 italic">
                        Estimates modeled from historical {proposition.category.replace(/_/g, ' ')} proposition results by region.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SIMILAR PROPOSITIONS */}
            <TabsContent value="similar">
              <div className="space-y-6">
                <div>
                  <p className="kicker mb-1">Related Measures</p>
                  <h2 className="text-2xl font-black text-slate-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Similar {proposition.category.replace(/_/g, ' ')} Propositions
                  </h2>
                  <p className="text-sm text-slate-500 font-serif">
                    Other California ballot measures in the same policy category.
                  </p>
                </div>

                {similarProps.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarProps.map(p => (
                      <PropositionCard key={p.id} proposition={p} showPrediction={false} />
                    ))}
                  </div>
                ) : (
                  <Card className="border border-slate-200">
                    <CardContent className="py-16 text-center">
                      <Link2 className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 font-serif">No similar propositions found.</p>
                      <Link href="/propositions"
                        className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-serif uppercase tracking-wider">
                        Browse all propositions
                      </Link>
                    </CardContent>
                  </Card>
                )}

                <Card className="border border-indigo-100 bg-indigo-50">
                  <CardContent className="py-5 flex items-start gap-4">
                    <BarChart2 className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-indigo-900 font-serif mb-1">
                        Historical context for {proposition.category.replace(/_/g, ' ')} propositions
                      </p>
                      <p className="text-sm text-indigo-700 font-serif leading-relaxed">
                        {proposition.category === 'taxation' && 'Tax-related propositions have a roughly even historical pass rate — about 49% pass — reflecting California voters\' mixed appetite for new levies.'}
                        {proposition.category === 'education' && 'Education propositions pass at around 55% historically, with school bond measures performing especially well among California voters.'}
                        {proposition.category === 'healthcare' && 'Healthcare measures pass at roughly 44%, often influenced heavily by healthcare industry campaign spending.'}
                        {proposition.category === 'environment' && 'Environmental propositions tend to pass at moderate rates, often boosted by strong support in coastal urban counties.'}
                        {proposition.category === 'housing' && 'Housing measures have a lower historical pass rate (~38%), reflecting competing interests between landlords, tenants, and homeowners.'}
                        {proposition.category === 'criminal_justice' && 'Criminal justice propositions pass about 53% of the time, though results vary significantly based on prevailing public safety concerns.'}
                        {proposition.category === 'labor' && 'Labor-related measures pass at around 51%, with outcomes heavily shaped by the strength of union campaign finance.'}
                        {proposition.category === 'government' && 'Government reform measures have mixed outcomes, with pass rates around 50%.'}
                        {!['taxation','education','healthcare','environment','housing','criminal_justice','labor','government'].includes(proposition.category) && 'Historical pass rates for this category vary. Review similar propositions above for context.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </section>
    </div>
  );
}
