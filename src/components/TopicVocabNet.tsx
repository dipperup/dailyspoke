import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { detectTopic, getRelatedTopics } from '../utils/topicVocab';

export default function TopicVocabNet() {
  const { state } = useApp();

  const topic = useMemo(() => {
    if (!state.rawText.trim()) return null;
    return detectTopic(state.rawText);
  }, [state.rawText]);

  const related = useMemo(() => {
    if (!topic) return [];
    return getRelatedTopics(topic);
  }, [topic]);

  if (!state.rawText.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 mb-4 text-[#38383C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-sm text-[#8A8A8E]">No text in editor</p>
        <p className="text-xs text-[#636366] mt-1">Paste IELTS speaking content to detect topics.</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 mb-4 text-[#38383C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-sm text-[#8A8A8E]">No topic detected</p>
        <p className="text-xs text-[#636366] mt-1">Try writing a longer passage for better detection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main topic */}
      <div className="bg-[#262629] rounded-xl p-5 border border-[#38383C]/40">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#0A84FF]" />
          <span className="text-xs font-semibold text-[#8A8A8E] uppercase tracking-wide">
            Detected Topic
          </span>
        </div>
        <h3 className="text-lg font-semibold text-[#F5F5F7] mb-4">
          {topic.topic}
        </h3>

        {/* Phrases */}
        <div className="mb-4">
          <div className="text-[11px] font-medium text-[#D1D1D6] mb-2">Key Phrases</div>
          <div className="flex flex-wrap gap-1.5">
            {topic.phrases.map(p => (
              <button
                key={p}
                className="px-2.5 py-1 rounded-lg text-xs bg-[#1C1C1E] text-[#D1D1D6]
                           hover:bg-[#0A84FF]/15 hover:text-[#0A84FF]
                           border border-[#38383C]/40 hover:border-[#0A84FF]/30
                           transition-all duration-200 font-mono cursor-pointer"
                title="Click to copy"
                onClick={() => navigator.clipboard.writeText(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <div className="text-[11px] font-medium text-[#D1D1D6] mb-2">Keywords</div>
          <div className="flex flex-wrap gap-1.5">
            {topic.keywords.map(k => (
              <span key={k}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-[#1C1C1E] text-[#8A8A8E]
                           border border-[#38383C]/30 font-mono">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Related topics */}
      {related.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#30D158]" />
            <span className="text-xs font-semibold text-[#8A8A8E] uppercase tracking-wide">
              Related Topics
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map(r => (
              <div key={r.topic}
                className="bg-[#262629] rounded-xl p-4 border border-[#38383C]/30">
                <div className="text-sm font-medium text-[#F5F5F7] mb-2">{r.topic}</div>
                <div className="flex flex-wrap gap-1">
                  {r.phrases.slice(0, 4).map(p => (
                    <button
                      key={p}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-[#1C1C1E] text-[#8A8A8E]
                                 hover:bg-[#0A84FF]/10 hover:text-[#0A84FF]
                                 transition-all duration-200 font-mono cursor-pointer"
                      title="Click to copy"
                      onClick={() => navigator.clipboard.writeText(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
