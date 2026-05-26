'use client';

import Link from 'next/link';
import {
  Card, CardHeader, CardTitle, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  ArrowLeft, Calendar, FileText, ExternalLink,
  TrendingUp, DollarSign, Loader2, Link2,
} from 'lucide-react';
import {
  PropositionWithDetails, PropositionPrediction, ApiResponse,
} from '@/types';
import { useState, useEffect } from 'react';

interface PageProps {
  params: { id: string };
}

interface SimilarProp {
  year: number;
  propNumber: string;
  description: string;
  similarityScore: number;
  yesPercentage?: number;
  passed?: boolean;
}

function getSummaryText(proposition: PropositionWithDetails): string {
  const candidates = [proposition.fullText, proposition.summary].filter(Boolean) as string[];
  for (const text of candidates) {
    let trimmed = text.trim();
    if (trimmed.length < 30) continue;
    if (/^\$?[\d,]+\.?\d*$/.test(trimmed)) continue;
    if (/^\$[\d,]+/.test(trimmed) && trimmed.length < 60) continue;
    // Strip the "was/is on the ballot" boilerplate sentence rather than discarding the whole text
    const boilerplateIdx = trimmed.search(/\b(?:was|is) on the ballot\b/i);
    if (boilerplateIdx !== -1) trimmed = trimmed.slice(0, boilerplateIdx).trim();
    if (trimmed.length < 30) continue;
    return trimmed;
  }
  const categoryLabel = proposition.category.replace(/_/g, ' ');
  const statusWord = proposition.status === 'passed' ? 'passed'
    : proposition.status === 'failed' ? 'failed'
    : proposition.status === 'upcoming' ? 'is on the upcoming ballot'
    : 'is currently active';
  let fallback = `California Proposition ${proposition.number} (${proposition.year}) is a ${categoryLabel} measure that ${statusWord}.`;
  if (proposition.result && proposition.result.yesPercentage > 0) {
    fallback += ` It received ${proposition.result.yesPercentage.toFixed(1)}% Yes and ${proposition.result.noPercentage.toFixed(1)}% No`;
    if (proposition.result.totalVotes > 0) {
      fallback += ` out of ${proposition.result.totalVotes.toLocaleString()} total votes cast`;
    }
    fallback += '.';
  }
  fallback += ' For full official text and analysis, see the external resources below.';
  return fallback;
}

export default function PropositionDetailPage({ params }: PageProps) {
  const { id } = params;
  const [proposition, setProposition] = useState<PropositionWithDetails | null>(null);
  const [similarProps, setSimilarProps] = useState<SimilarProp[]>([]);
  const [similarMethod, setSimilarMethod] = useState<'ml' | 'category' | null>(null);
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
          const simRes = await fetch(`/api/propositions/${id}/similar`);
          const simData: ApiResponse<SimilarProp[]> & { method?: 'ml' | 'category' } = await simRes.json();
          if (simData.success) {
            setSimilarProps(simData.data);
            setSimilarMethod(simData.method ?? null);
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
        </div>
      </section>

      {/* Quick stats */}
      <section className="py-5 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className={`grid gap-4 ${proposition.finance ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {[
              { icon: Calendar,   label: 'Election Date', value: formatDate(proposition.electionDate), color: '' },
              { icon: TrendingUp, label: 'Yes Vote',
                value: proposition.result?.yesPercentage
                  ? `${proposition.result.yesPercentage.toFixed(1)}%`
                  : 'N/A',
                color: proposition.result?.yesPercentage
                  ? (proposition.result.yesPercentage >= 50 ? 'text-emerald-700' : 'text-rose-600')
                  : '' },
              ...(proposition.finance ? [{
                icon: DollarSign, label: 'Total Funding',
                value: formatCurrency(proposition.finance.totalSupport + proposition.finance.totalOpposition),
                color: '',
              }] : []),
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
                { value: 'details', icon: FileText, label: 'Full Details' },
                { value: 'similar', icon: Link2,    label: 'Similar Propositions' },
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
                        {getSummaryText(proposition)}
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

            {/* SIMILAR PROPOSITIONS */}
            <TabsContent value="similar">
              <div className="space-y-6">
                <div>
                  <p className="kicker mb-1">Related Measures</p>
                  <h2 className="text-2xl font-black text-slate-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Similar {proposition.category.replace(/_/g, ' ')} Propositions
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-500 font-serif">
                      Other California ballot measures in the same policy category.
                    </p>
                    {similarMethod === 'ml' && (
                      <span className="text-xs text-indigo-500 font-serif italic">
                        matched via machine learning
                      </span>
                    )}
                    {similarMethod === 'category' && (
                      <span className="text-xs text-slate-400 font-serif italic">
                        matched via categorical search
                      </span>
                    )}
                  </div>
                </div>

                {similarProps.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarProps.map(p => (
                      <Link key={`${p.year}-${p.propNumber}`} href={`/propositions/${p.year}-${p.propNumber}`}>
                        <Card className="border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer h-full">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base font-bold font-serif text-slate-900">
                                Prop {p.propNumber} ({p.year})
                              </CardTitle>
                              {similarMethod === 'ml' && (
                                <span className="text-sm font-semibold text-indigo-600">
                                  {Math.round(p.similarityScore * 100)}% match
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-slate-600 font-serif leading-relaxed">{p.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
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
                    <FileText className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
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
