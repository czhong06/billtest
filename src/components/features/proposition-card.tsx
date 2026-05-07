'use client';

import Link from 'next/link';
import { Proposition, PropositionPrediction } from '@/types';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatDate, formatPercentage } from '@/lib/utils';
import { Calendar, Users, ExternalLink } from 'lucide-react';

interface PropositionCardProps {
  proposition: Proposition;
  prediction?: PropositionPrediction;
  showPrediction?: boolean;
}

export function PropositionCard({
  proposition,
  prediction,
  showPrediction = true,
}: PropositionCardProps) {
  const statusLabel = {
    upcoming: 'Upcoming',
    active: 'Live',
    passed: 'Passed',
    failed: 'Failed',
  };

  const statusStyle = {
    upcoming: 'bg-slate-700 text-white',
    active: 'bg-indigo-600 text-white',
    passed: 'bg-emerald-700 text-white',
    failed: 'bg-gray-500 text-white',
  } as const;

  const topAccent = {
    upcoming: 'bg-slate-700',
    active: 'bg-indigo-600',
    passed: 'bg-emerald-700',
    failed: 'bg-gray-400',
  } as const;

  return (
    <Link href={`/propositions/${proposition.id}`}>
      <div className="h-full bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
        {/* Top color rule */}
        <div className={`h-1 ${topAccent[proposition.status]}`} />

        <div className="p-6">
          {/* Kicker row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 ${statusStyle[proposition.status]}`}
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {statusLabel[proposition.status]}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-serif">
              {proposition.category.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Headline */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Proposition {proposition.number}
              </h3>
              <p className="text-gray-700 mt-1 text-sm font-serif line-clamp-2 leading-relaxed">
                {proposition.title}
              </p>
              {proposition.summary && proposition.summary !== proposition.title && proposition.status !== 'upcoming' && (
                <p className="text-gray-500 mt-1 text-xs font-serif line-clamp-2 italic">
                  {proposition.summary}
                </p>
              )}
            </div>
            <span
              className="text-5xl font-black text-gray-100 shrink-0 leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {proposition.number}
            </span>
          </div>

          {/* Dateline */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 border-t border-gray-100 pt-3 font-serif uppercase tracking-wide">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(proposition.electionDate, { month: 'short', year: 'numeric' })}</span>
            </div>
            {proposition.sponsors && proposition.sponsors.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{proposition.sponsors.length} sponsors</span>
              </div>
            )}
            <a
              href={`https://ballotpedia.org/California_${proposition.year}_ballot_propositions`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-gray-400 hover:text-indigo-600 ml-auto transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Ballotpedia</span>
            </a>
          </div>

          {/* Prediction meter */}
          {showPrediction && prediction && (
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-serif">
                  Passage Probability
                </span>
                <span
                  className={`text-2xl font-black ${prediction.passageProbability >= 0.5 ? 'text-emerald-700' : 'text-indigo-600'}`}
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {formatPercentage(prediction.passageProbability)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 overflow-hidden">
                <div
                  className={`h-full transition-all ${prediction.passageProbability >= 0.5 ? 'bg-emerald-600' : 'bg-red-600'}`}
                  style={{ width: `${prediction.passageProbability * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-400 font-serif uppercase tracking-wide">
                <span>Fail</span>
                <span className="text-gray-300 capitalize">{prediction.dataQuality} data</span>
                <span>Pass</span>
              </div>
            </div>
          )}

          {/* Actual result */}
          {proposition.result && (
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-serif">
                  Final Result
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 ${proposition.result.passed ? 'bg-emerald-700 text-white' : 'bg-gray-500 text-white'}`}
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {proposition.result.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              {proposition.result.yesPercentage > 0 && (
                <>
                  <div className="h-2 bg-red-100 overflow-hidden mt-2">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${proposition.result.yesPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs font-serif font-semibold">
                    <span className="text-emerald-700">Yes {proposition.result.yesPercentage.toFixed(1)}%</span>
                    <span className="text-indigo-600">No {proposition.result.noPercentage.toFixed(1)}%</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
