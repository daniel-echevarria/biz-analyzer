'use client';

import { useState } from 'react';

type Structured = {
  business_name: string;
  description: string;
  category: string;
  tags: string[];
};

type AnalyzeResult = {
  structured: Structured;
  rawText: string;
  rawScore: number;
  structuredScore: number;
};

const EXAMPLES = ['https://stripe.com', 'https://airbnb.com', 'https://pdm-solutions.com'];

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 75 ? 'text-emerald-500' : score >= 55 ? 'text-amber-500' : 'text-rose-500';
  const bar =
    score >= 75 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div className="flex-1">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-2xl font-bold tabular-nums ${color}`}>{score}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 text-gray-400">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          ></span>
        ))}
      </div>
      <p className="text-sm">Fetching and analyzing…</p>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze(target?: string) {
    const u = target ?? url;
    if (!u) return;
    if (target) setUrl(target);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const improvement = result ? result.structuredScore - result.rawScore : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200/80 px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => { setResult(null); setUrl(''); setError(''); }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm">DataReady</span>
          </button>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">MVP Demo</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <div className="pt-14 pb-10 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
            AI Data Pipeline
          </div>
          <h1 className="text-6xl text-gray-900 mb-4 leading-[1.1]" style={{ fontFamily: 'var(--font-serif)' }}>
            From messy web data<br />to <span className="italic text-indigo-600">AI-ready</span> structure
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Paste any business URL. We extract, clean, and structure the data — ready for your AI pipeline.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm max-w-2xl mx-auto mb-4">
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              placeholder="https://yourbusiness.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyze()}
            />
            <button
              onClick={() => analyze()}
              disabled={loading || !url}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition cursor-pointer shrink-0"
            >
              Analyze →
            </button>
          </div>
        </div>

        {/* Examples */}
        {!result && !loading && (
          <div className="flex justify-center gap-2 mb-10">
            <span className="text-xs text-gray-400 py-1">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => analyze(ex)}
                className="text-xs text-indigo-500 hover:text-indigo-700 bg-white border border-gray-200 hover:border-indigo-200 px-3 py-1 rounded-full transition cursor-pointer"
              >
                {ex.replace('https://', '')}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center mb-6">{error}</p>
        )}

        {loading && <LoadingState />}

        {/* Results */}
        {result && (
          <div className="pb-16 space-y-4">
            {/* Score row */}
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm">
              <div className="flex items-center gap-6">
                <ScoreGauge score={result.rawScore} label="Raw content" />
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                    +{improvement}%
                  </div>
                  <span className="text-gray-300 text-lg">→</span>
                </div>
                <ScoreGauge score={result.structuredScore} label="After structuring" />
              </div>
            </div>

            {/* Before / After panels */}
            <div className="grid grid-cols-2 gap-4">
              {/* Before */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 inline-block"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Before — Raw scraped text
                  </span>
                </div>
                <div className="p-5 overflow-y-auto max-h-96">
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed font-mono">
                    {result.rawText}
                  </pre>
                </div>
              </div>

              {/* After */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 inline-block"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    After — AI-structured data
                  </span>
                </div>
                <div className="p-5">
                  <span className="inline-block text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full mb-4">
                    {result.structured.category}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {result.structured.business_name}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {result.structured.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {result.structured.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <details>
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                      View JSON output
                    </summary>
                    <pre className="mt-3 text-xs bg-gray-50 border border-gray-100 rounded-xl p-4 overflow-x-auto text-gray-500">
                      {JSON.stringify(result.structured, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
