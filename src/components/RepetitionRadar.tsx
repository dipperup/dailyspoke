import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeRepetition, lexicalVarietyScore } from '../utils/repetitionDetector';
import type { WordFrequency } from '../types';

export default function RepetitionRadar() {
  const { state } = useApp();

  const { words, score } = useMemo(() => {
    const texts = state.history.map(e => e.text);
    return {
      words: analyzeRepetition(texts),
      score: lexicalVarietyScore(texts),
    };
  }, [state.history]);

  const overused = words.filter(w => w.level === 'overused');
  const warnings = words.filter(w => w.level === 'warning');

  if (state.history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 mb-4 text-[#38383C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-[#8A8A8E]">No history data yet</p>
        <p className="text-xs text-[#636366] mt-1">Paste text and submit to start tracking word usage.</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 mb-4 text-[#38383C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="text-sm text-[#8A8A8E]">Not enough data yet</p>
        <p className="text-xs text-[#636366] mt-1">Keep practicing to see word frequency patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lexical Variety Score */}
      <div className="bg-[#262629] rounded-xl p-5 border border-[#38383C]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#D1D1D6]">Lexical Variety Score</span>
          <span className={`text-2xl font-bold font-mono tracking-tight ${
            score >= 60 ? 'text-[#30D158]' :
            score >= 40 ? 'text-[#D1D1D6]' :
            'text-[#FF453A]'
          }`}>
            {score > 0 ? `${score}%` : '—'}
          </span>
        </div>
        <div className="h-1.5 bg-[#1C1C1E] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              score >= 60 ? 'bg-[#30D158]' :
              score >= 40 ? 'bg-[#D1D1D6]' :
              'bg-[#FF453A]'
            }`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-[#636366]">
          <span>Repetitive</span>
          <span>Diverse</span>
        </div>
      </div>

      {/* Overused & Warnings */}
      {(overused.length > 0 || warnings.length > 0) && (
        <div className="space-y-4">
          {overused.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#FF453A]" />
                <span className="text-xs font-semibold text-[#D1D1D6] uppercase tracking-wide">
                  Overused
                </span>
                <span className="text-[11px] text-[#8A8A8E]">{overused.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {overused.map(w => (
                  <span key={w.word}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs
                               bg-[#FF453A]/10 text-[#FF453A] font-mono font-medium
                               border border-[#FF453A]/20">
                    {w.word}
                    <span className="text-[10px] opacity-60">×{w.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#8A8A8E]" />
                <span className="text-xs font-semibold text-[#D1D1D6] uppercase tracking-wide">
                  Watch
                </span>
                <span className="text-[11px] text-[#8A8A8E]">{warnings.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {warnings.map(w => (
                  <span key={w.word}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs
                               bg-[#2E2E32] text-[#D1D1D6] font-mono
                               border border-[#38383C]/40">
                    {w.word}
                    <span className="text-[10px] opacity-50">×{w.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Frequency bar chart */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#0A84FF]" />
          <span className="text-xs font-semibold text-[#D1D1D6] uppercase tracking-wide">
            Top repeated words
          </span>
        </div>
        <div className="space-y-1.5">
          {words.slice(0, 10).map((w, i) => {
            const max = words[0]?.count ?? 1;
            const barWidth = Math.max((w.count / max) * 100, 2);
            return (
              <div key={w.word} className="flex items-center gap-3 text-xs group">
                <span className="w-4 text-right font-mono text-[10px] text-[#636366]">
                  {i + 1}
                </span>
                <span className="w-20 truncate font-mono text-[#D1D1D6]">
                  {w.word}
                </span>
                <div className="flex-1 h-4 bg-[#1C1C1E] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      w.level === 'overused' ? 'bg-[#FF453A]' :
                      w.level === 'warning' ? 'bg-[#8A8A8E]' :
                      'bg-[#0A84FF]/40'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="w-5 text-right font-mono text-[11px] text-[#8A8A8E] tabular-nums">
                  {w.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
