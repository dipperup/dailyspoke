import type { SilenceSegment } from '../types';

interface Props {
  segments: SilenceSegment[];
  totalMs: number;
  sentenceLength: number;
}

export default function PauseHeatmap({ segments, totalMs, sentenceLength }: Props) {
  if (segments.length === 0) return null;

  // Map recording timeline (0..totalMs) to sentence char positions (0..sentenceLength)
  const msToChar = totalMs > 0 ? sentenceLength / totalMs : 0;

  return (
    <div className="mt-2 space-y-1">
      <div className="text-[10px] font-semibold text-[#8A8A8E] uppercase tracking-wide">
        Pause Heatmap
      </div>

      {/* Visual strip */}
      <div className="relative h-5 bg-[#1C1C1E] rounded overflow-hidden flex">
        {/* Render non-silence and silence blocks */}
        {segments.map((seg, i) => {
          const startPct = (seg.startMs / (totalMs || 1)) * 100;
          const durationPct = (seg.durationMs / (totalMs || 1)) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 h-full rounded-sm transition-opacity duration-200 ease-in-out"
              style={{
                left: `${startPct}%`,
                width: `${Math.max(durationPct, 0.5)}%`,
              }}
            >
              {/* Color by severity */}
              <div
                className={`h-full rounded-sm ${
                  seg.durationMs >= 2000
                    ? 'bg-[#FF453A]'
                    : seg.durationMs >= 1000
                    ? 'bg-[#FF453A]/70'
                    : seg.durationMs >= 500
                    ? 'bg-[#D1D1D6]/50'
                    : 'bg-[#38383C]'
                }`}
                title={`${(seg.durationMs / 1000).toFixed(1)}s pause`}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-[#8A8A8E]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#FF453A]" />
          {'>'}2s
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#FF453A]/70" />
          1–2s
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#D1D1D6]/50" />
          0.5–1s
        </span>
      </div>

      {/* Silence count summary */}
      <div className="text-[10px] text-[#8A8A8E]">
        {segments.length} pause{segments.length > 1 ? 's' : ''} detected
        {' · '}
        {(segments.reduce((s, seg) => s + seg.durationMs, 0) / 1000).toFixed(1)}s total silence
      </div>
    </div>
  );
}
