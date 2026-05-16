import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import RepetitionRadar from './RepetitionRadar';
import TopicVocabNet from './TopicVocabNet';

type Tab = 'repetition' | 'topic';

export default function AnalysisPanel() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<Tab>('repetition');

  if (!state.analysisOpen) return null;

  const handleClose = () => dispatch({ type: 'TOGGLE_ANALYSIS' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6
                 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
      onKeyDown={e => { if (e.key === 'Escape') handleClose(); }}
    >
      <div
        className="bg-[#1C1C1E] rounded-2xl shadow-2xl shadow-black/40
                      border border-[#38383C]/60
                      w-full max-w-2xl max-h-[85vh] flex flex-col
                      animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-8 pt-8 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#F5F5F7] tracking-tight">
                Analysis
              </h2>
              <p className="text-xs text-[#8A8A8E] mt-1">
                Word usage insights and IELTS topic vocabulary
              </p>
            </div>
            <button
              className="text-[#8A8A8E] hover:text-[#D1D1D6] transition-all duration-200
                         p-2 rounded-xl hover:bg-[#2E2E32]"
              onClick={handleClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 p-1 bg-[#262629] rounded-xl">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${tab === 'repetition'
                  ? 'bg-[#38383C] text-[#F5F5F7] shadow-sm shadow-black/20'
                  : 'text-[#8A8A8E] hover:text-[#D1D1D6]'
                }`}
              onClick={() => setTab('repetition')}
            >
              Repetition Radar
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${tab === 'topic'
                  ? 'bg-[#38383C] text-[#F5F5F7] shadow-sm shadow-black/20'
                  : 'text-[#8A8A8E] hover:text-[#D1D1D6]'
                }`}
              onClick={() => setTab('topic')}
            >
              Topic Vocabulary
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {tab === 'repetition' ? <RepetitionRadar /> : <TopicVocabNet />}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-8 py-4 border-t border-[#38383C]/60 flex items-center justify-between">
          <span className="text-[11px] text-[#636366]">
            {state.history.length} history {state.history.length === 1 ? 'entry' : 'entries'}
            {state.rawText && ` · ${state.rawText.split(/\s+/).length} words in editor`}
          </span>
          <span className="text-[11px] text-[#636366]">Esc to close</span>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
}
