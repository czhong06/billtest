'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Card, CardHeader, CardTitle, CardContent,
  Badge,
} from '@/components/ui';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend,
} from 'recharts';
import { Proposition, PropositionPrediction, ApiResponse } from '@/types';
import { Loader2, BarChart3, DollarSign, Link2, Trophy, Map } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  taxation: 'Taxation',
  education: 'Education',
  healthcare: 'Healthcare',
  environment: 'Environment',
  criminal_justice: 'Criminal Justice',
  labor: 'Labor',
  housing: 'Housing',
  transportation: 'Transportation',
  government: 'Government',
  civil_rights: 'Civil Rights',
  other: 'Other',
};

const HISTORICAL_PASS_RATES = [
  { category: 'Bonds', passRate: 67 },
  { category: 'Education', passRate: 55 },
  { category: 'Civil Rights', passRate: 58 },
  { category: 'Labor', passRate: 51 },
  { category: 'Criminal J.', passRate: 53 },
  { category: 'Government', passRate: 50 },
  { category: 'Taxes', passRate: 49 },
  { category: 'Healthcare', passRate: 44 },
  { category: 'Transport.', passRate: 45 },
  { category: 'Housing', passRate: 38 },
  { category: 'Insurance', passRate: 22 },
];

const FINANCE_DATA = [
  { name: 'Prop 34 (2024)', support: 211_000_000, opposition: 30_000_000 },
  { name: 'Prop 22 (2020)', support: 224_000_000, opposition: 22_000_000 },
  { name: 'Prop 33 (2024)', support: 25_000_000, opposition: 72_000_000 },
  { name: 'Prop 36 (2024)', support: 18_200_000, opposition: 32_700_000 },
  { name: 'Prop 10 (2018)', support: 37_000_000, opposition: 76_000_000 },
  { name: 'Prop 12 (2018)', support: 13_000_000, opposition: 18_000_000 },
];

async function fetchYearPropositions(year: string): Promise<Proposition[]> {
  try {
    const res = await fetch(`/api/propositions?year=${year}&perPage=200`);
    const data: ApiResponse<Proposition[]> = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default function PredictionsPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [predictions, setPredictions] = useState<Record<string, PropositionPrediction>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const years = ['2026', '2024', '2022', '2020', '2018', '2016'];
      const results = await Promise.all(years.map(fetchYearPropositions));
      const allProps = results
        .flat()
        .sort((a, b) => b.year - a.year || parseInt(a.number) - parseInt(b.number));
      setPropositions(allProps);

      const upcoming = allProps.filter(p => p.status === 'upcoming');
      const predResults = await Promise.all(
        upcoming.map(async p => {
          try {
            const res = await fetch(`/api/predictions/${p.id}`);
            const data: ApiResponse<PropositionPrediction> = await res.json();
            return data.success ? { id: p.id, pred: data.data } : null;
          } catch {
            return null;
          }
        })
      );
      const predMap: Record<string, PropositionPrediction> = {};
      predResults.forEach(r => { if (r) predMap[r.id] = r.pred; });
      setPredictions(predMap);
      setIsLoading(false);
    };
    load();
  }, []);

  const categoryStats = Object.entries(CATEGORY_LABELS).map(([key, label]) => {
    const catProps = propositions.filter(
      p => p.category === key && (p.status === 'passed' || p.status === 'failed')
    );
    const passed = catProps.filter(p => p.status === 'passed').length;
    const total = catProps.length;
    return { category: label, passRate: total >= 3 ? Math.round((passed / total) * 100) : null, total, passed };
  }).filter(c => c.total > 0);

  const propsByCategory = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
    props: propositions.filter(p => p.category === key).slice(0, 6),
    count: propositions.filter(p => p.category === key).length,
  })).filter(c => c.count > 0);

  const leaderboardProps = propositions
    .filter(p => p.result && p.result.totalVotes > 0)
    .sort((a, b) => (b.result?.totalVotes ?? 0) - (a.result?.totalVotes ?? 0))
    .slice(0, 20);

  const upcomingProps = propositions.filter(p => p.status === 'upcoming');

  return (
    <div className="animate-fade-in" style={{ background: 'rgb(250 250 248)' }}>

      <section className="bg-white border-b-2 border-slate-700 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <p className="kicker mb-3">Analytics</p>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Data Visualizations
            </h1>
            <p className="text-slate-600 font-serif leading-relaxed">
              Explore California ballot measure predictions, historical pass rates by category,
              campaign finance data, and proposition statistics.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-slate-600 font-serif">Loading data…</span>
            </div>
          ) : (
            <Tabs defaultValue="map" className="space-y-6">
              <TabsList className="w-full justify-start bg-white border border-slate-200 p-1 rounded-none flex-wrap h-auto">
                {[
                  { value: 'map', icon: Map, label: 'Voting Map' },
                  { value: 'similar-props', icon: Link2, label: 'Similar Props' },
                  { value: 'pass-fail', icon: BarChart3, label: 'Pass/Fail by Category' },
                  { value: 'campaign-finance', icon: DollarSign, label: 'Campaign Finance' },
                  { value: 'leaderboard', icon: Trophy, label: 'Prop Stats Leaderboard' },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger key={value} value={value}
                    className="gap-2 rounded-none data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    <Icon className="h-4 w-4" />{label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── MAP ── */}
              <TabsContent value="map">
                <div style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
                  <iframe
                    src="/map.html"
                    className="w-full h-full border-0"
                    title="California Voting Map"
                  />
                </div>
              </TabsContent>

              {/* ── SIMILAR PROPS ── */}
              <TabsContent value="similar-props">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Propositions by Category
                    </h2>
                    <p className="text-sm text-slate-500 font-serif">
                      Browse California ballot measures grouped by policy area. Measures in the same
                      category share historical pass-rate patterns and thematic similarity.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propsByCategory.map(({ key, label, props, count }) => (
                      <Card key={key} className="border border-slate-200">
                        <CardHeader className="border-b border-slate-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-slate-900 font-serif">
                              {label}
                            </CardTitle>
                            <Badge className="bg-slate-700 text-white border-0 text-xs">
                              {count} props
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <ul className="space-y-2">
                            {props.map(p => (
                              <li key={p.id}>
                                <Link href={`/propositions/${p.id}`}
                                  className="flex items-center justify-between text-sm group">
                                  <span className="font-serif text-slate-700 group-hover:text-indigo-600 transition-colors truncate mr-2">
                                    Prop {p.number} ({p.year}) —{' '}
                                    {p.title.length > 38 ? p.title.substring(0, 38) + '…' : p.title}
                                  </span>
                                  <span className={`text-xs font-semibold shrink-0 ${
                                    p.status === 'passed' ? 'text-emerald-700' :
                                    p.status === 'failed' ? 'text-rose-600' :
                                    p.status === 'upcoming' ? 'text-indigo-600' : 'text-slate-400'
                                  }`}>
                                    {p.status}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          {count > 6 && (
                            <Link href={`/propositions`}
                              className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-serif uppercase tracking-wider inline-block transition-colors">
                              View all {count} →
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── PASS / FAIL BY CATEGORY ── */}
              <TabsContent value="pass-fail">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Historical Pass/Fail Rates by Category
                    </h2>
                    <p className="text-sm text-slate-500 font-serif">
                      Percentage of California ballot measures that passed, broken out by policy category.
                    </p>
                  </div>

                  {categoryStats.length > 0 && (
                    <Card className="border border-slate-200">
                      <CardHeader className="border-b border-slate-200">
                        <CardTitle className="text-lg font-bold text-slate-900"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          Pass Rate from Loaded Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart
                            data={categoryStats.filter(c => c.total >= 3)}
                            margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="category" angle={-30} textAnchor="end"
                              tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`}
                              tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                            <Tooltip
                              formatter={(value, _name, props) => [
                                `${value}% (${props.payload.passed}/${props.payload.total} passed)`,
                                'Pass Rate',
                              ]}
                            />
                            <Bar dataKey="passRate" radius={[2, 2, 0, 0]}>
                              {categoryStats.filter(c => c.total >= 3).map((entry, i) => (
                                <Cell key={i} fill={(entry.passRate ?? 0) >= 50 ? '#4f46e5' : '#94a3b8'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-slate-400 font-serif mt-2">
                          Indigo = majority historically pass · Grey = majority historically fail
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Reference Rates 1980–2025
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={HISTORICAL_PASS_RATES}
                          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="category" tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`}
                            tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                          <Tooltip formatter={(v) => [`${v}%`, 'Historical pass rate']} />
                          <Bar dataKey="passRate" radius={[2, 2, 0, 0]}>
                            {HISTORICAL_PASS_RATES.map((entry, i) => (
                              <Cell key={i} fill={entry.passRate >= 50 ? '#4f46e5' : '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-slate-400 font-serif mt-2">
                        Based on California ballot proposition data 1980–2025.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categoryStats.map(c => (
                      <div key={c.category} className="bg-white border border-slate-200 p-5">
                        <p className="text-xs text-slate-400 font-serif uppercase tracking-widest mb-1">
                          {c.category}
                        </p>
                        <p className="text-3xl font-black text-slate-900 mb-0.5"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {c.passRate !== null ? `${c.passRate}%` : '—'}
                        </p>
                        <p className="text-xs text-slate-500 font-serif">
                          {c.passed} passed / {c.total} total
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── CAMPAIGN FINANCE ── */}
              <TabsContent value="campaign-finance">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Campaign Finance Overview
                    </h2>
                    <p className="text-sm text-slate-500 font-serif">
                      Support vs. opposition spending for notable California ballot measures. Data from Cal-Access.
                    </p>
                  </div>

                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Support vs. Opposition Spending
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={FINANCE_DATA}
                          margin={{ top: 5, right: 20, left: 20, bottom: 50 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" angle={-30} textAnchor="end"
                            tick={{ fontFamily: 'Georgia', fontSize: 11 }} />
                          <YAxis
                            tickFormatter={v => `$${(v / 1_000_000).toFixed(0)}M`}
                            tick={{ fontFamily: 'Georgia', fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(v) => [`$${(Number(v) / 1_000_000).toFixed(1)}M`]}
                          />
                          <Legend />
                          <Bar dataKey="support" name="Support" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="opposition" name="Opposition" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-indigo-100 bg-indigo-50">
                      <CardContent className="pt-5">
                        <p className="kicker mb-2">Key Insight</p>
                        <p className="text-sm text-indigo-800 font-serif leading-relaxed">
                          Propositions with a 5:1+ support-to-opposition spending ratio have historically
                          passed 74% of the time — but counter-examples like Prop 33 (2024) show that
                          money doesn't always decide the outcome.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border border-slate-200 bg-white">
                      <CardContent className="pt-5">
                        <p className="kicker mb-2">Data Source</p>
                        <p className="text-sm text-slate-600 font-serif leading-relaxed">
                          Campaign finance data is sourced from Cal-Access, California's campaign finance
                          and lobbying disclosure database. Full finance details are on each proposition's
                          detail page.
                        </p>
                        <a href="https://cal-access.sos.ca.gov/" target="_blank" rel="noopener noreferrer"
                          className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-serif uppercase tracking-wider inline-block transition-colors">
                          View Cal-Access →
                        </a>
                      </CardContent>
                    </Card>
                  </div>

                  {upcomingProps.length > 0 && (
                    <Card className="border border-slate-200">
                      <CardHeader className="border-b border-slate-200">
                        <CardTitle className="text-lg font-bold text-slate-900"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          2026 Upcoming Propositions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-slate-500 font-serif mb-4">
                          Click a proposition below for full campaign finance details.
                        </p>
                        <div className="space-y-2">
                          {upcomingProps.map(p => (
                            <Link key={p.id} href={`/propositions/${p.id}`}>
                              <div className="flex items-center justify-between p-3 border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all">
                                <div>
                                  <p className="font-semibold font-serif text-slate-900 text-sm">
                                    Prop {p.number} —{' '}
                                    {p.title.length > 55 ? p.title.substring(0, 55) + '…' : p.title}
                                  </p>
                                  <p className="text-xs text-slate-400 font-serif mt-0.5">
                                    {CATEGORY_LABELS[p.category] || p.category}
                                    {predictions[p.id] && (
                                      <> · {Math.round(predictions[p.id].passageProbability * 100)}% predicted to pass</>
                                    )}
                                  </p>
                                </div>
                                <span className="text-xs bg-slate-700 text-white px-2 py-0.5 font-serif uppercase tracking-widest shrink-0 ml-3">
                                  View →
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* ── LEADERBOARD ── */}
              <TabsContent value="leaderboard">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Prop Stats Leaderboard
                    </h2>
                    <p className="text-sm text-slate-500 font-serif">
                      California ballot measures ranked by total voter participation — the most-voted-on
                      propositions in our database.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Propositions', value: propositions.length, color: '' },
                      { label: 'Passed', value: propositions.filter(p => p.status === 'passed').length, color: 'text-emerald-700' },
                      { label: 'Failed', value: propositions.filter(p => p.status === 'failed').length, color: 'text-rose-600' },
                      { label: 'Upcoming 2026', value: upcomingProps.length, color: 'text-indigo-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-white border border-slate-200 p-5 text-center">
                        <p className={`text-3xl font-black mb-1 ${color || 'text-slate-900'}`}
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {value.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 font-serif uppercase tracking-wide">{label}</p>
                      </div>
                    ))}
                  </div>

                  <Card className="border border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Top Propositions by Voter Participation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {leaderboardProps.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {leaderboardProps.map((p, i) => (
                            <Link key={p.id} href={`/propositions/${p.id}`}>
                              <div className="flex items-center gap-4 py-3 px-2 -mx-2 hover:bg-slate-50 transition-colors">
                                <span className="text-2xl font-black text-slate-200 w-8 text-center shrink-0"
                                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                  {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold font-serif text-slate-900 text-sm truncate">
                                    Prop {p.number} ({p.year}) — {p.title}
                                  </p>
                                  <p className="text-xs text-slate-400 font-serif mt-0.5">
                                    {CATEGORY_LABELS[p.category] || p.category}
                                    {p.result && (
                                      <> · {p.result.totalVotes.toLocaleString()} votes</>
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  {p.result && p.result.yesPercentage > 0 && (
                                    <p className="text-sm font-bold font-serif text-slate-700">
                                      {p.result.yesPercentage.toFixed(1)}% Yes
                                    </p>
                                  )}
                                  <span className={`text-xs font-semibold font-serif px-2 py-0.5 ${
                                    p.status === 'passed' ? 'bg-emerald-700 text-white' :
                                    p.status === 'failed' ? 'bg-rose-600 text-white' :
                                    'bg-slate-700 text-white'
                                  }`}>
                                    {p.status}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 text-center">
                          <Trophy className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-500 font-serif">
                            No vote-count data available in the loaded years.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>
          )}
        </div>
      </section>

    </div>
  );
}
