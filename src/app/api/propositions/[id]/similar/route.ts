import { NextRequest, NextResponse } from 'next/server';
import { caSosClient } from '@/lib/external-apis';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

interface ModelSimilarProp {
  year: number;
  prop_number: string;
  description: string;
  similarity_score: number;
}

export interface SimilarPropResult {
  year: number;
  propNumber: string;
  description: string;
  similarityScore: number;
  yesPercentage?: number;
  passed?: boolean;
}

async function enrichWithVoteData(props: SimilarPropResult[]): Promise<SimilarPropResult[]> {
  return Promise.all(
    props.map(async (p) => {
      try {
        const yearProps = await caSosClient.getPropositionsByYear(p.year);
        const match = yearProps.find(yp => yp.number === p.propNumber);
        if (match?.result && match.result.yesVotes > 0) {
          return { ...p, yesPercentage: match.result.yesPercentage, passed: match.result.passed };
        }
      } catch { /* leave unenriched */ }
      return p;
    })
  );
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const dashIndex = id.indexOf('-');
    const yearStr = id.slice(0, dashIndex);
    const propNum = id.slice(dashIndex + 1);
    const year = parseInt(yearStr);

    if (isNaN(year) || !propNum) {
      return NextResponse.json(
        { data: [], success: false, error: { code: 'INVALID_ID', message: 'Invalid proposition ID' } },
        { status: 400 }
      );
    }

    // Try model API first
    try {
      const modelUrl = `https://adr310-d3-model-web-service.hf.space/find-similar-props/?year=${year}&prop_num=${encodeURIComponent(propNum)}`;
      const res = await fetch(modelUrl, { signal: AbortSignal.timeout(10000) });

      if (res.ok) {
        const json = await res.json();
        const props = json.similar_props as ModelSimilarProp[];
        if (Array.isArray(props) && props.length > 0) {
          const base: SimilarPropResult[] = props.slice(0, 3).map(p => ({
            year: p.year,
            propNumber: p.prop_number,
            description: p.description,
            similarityScore: p.similarity_score,
          }));
          const data = await enrichWithVoteData(base);
          return NextResponse.json({ data, success: true, method: 'ml' });
        }
      }
    } catch {
      // Fall through to category-based fallback
    }

    // Category-based fallback
    const targetProps = await caSosClient.getPropositionsByYear(year);
    const target = targetProps.find(p => p.number === propNum);
    if (!target) {
      return NextResponse.json({ data: [], success: true, method: 'category' });
    }

    const currentYear = new Date().getFullYear();
    const yearsToSearch: number[] = [];
    for (let y = currentYear; y >= currentYear - 14; y -= 2) {
      if (y !== year) yearsToSearch.push(y);
      if (yearsToSearch.length >= 5) break;
    }

    const yearResults = await Promise.all(
      yearsToSearch.map(y => caSosClient.getPropositionsByYear(y).catch(() => []))
    );

    const candidates: SimilarPropResult[] = yearResults
      .flat()
      .filter(p => p.category === target.category && p.id !== target.id)
      .slice(0, 3)
      .map(p => ({
        year: p.year,
        propNumber: p.number,
        description: p.title,
        similarityScore: 0,
        yesPercentage: p.result && p.result.yesVotes > 0 ? p.result.yesPercentage : undefined,
        passed: p.result && p.result.yesVotes > 0 ? p.result.passed : undefined,
      }));

    return NextResponse.json({ data: candidates, success: true, method: 'category' });
  } catch (error) {
    console.error('Similar propositions API error:', error);
    return NextResponse.json(
      { data: [], success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to find similar propositions' } },
      { status: 500 }
    );
  }
}
