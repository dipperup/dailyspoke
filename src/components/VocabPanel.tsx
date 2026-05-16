import { useApp } from '../context/AppContext';
import { tokenizeIPA, PHONEME_COLORS } from '../utils/phonemeColorer';

function generateCSV(vocab: { word: string; ipa: string | null; translation: string | null }[]): string {
  const header = 'Front,IPA,Chinese';
  const rows = vocab.map(v => {
    const ipa = v.ipa ? `/${v.ipa}/` : '';
    const cn = v.translation ?? '';
    return `"${v.word}","${ipa.replace(/"/g, '""')}","${cn.replace(/"/g, '""')}"`;
  });
  return [header, ...rows].join('\n');
}

export default function VocabPanel() {
  const { state, dispatch } = useApp();

  if (!state.vocabOpen) return null;

  const handleExport = () => {
    const csv = generateCSV(state.vocab);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dailyspoke_vocab.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in"
         onClick={() => dispatch({ type: 'TOGGLE_VOCAB' })}>
      <div className="bg-[#262629] rounded-xl shadow-xl w-full max-w-lg mx-4 border border-[#38383C]
                      max-h-[80vh] flex flex-col"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#38383C]">
          <div>
            <h2 className="text-lg font-semibold text-[#F5F5F7]">Vocabulary Notebook</h2>
            <p className="text-xs text-[#8A8A8E] mt-0.5">{state.vocab.length} word{state.vocab.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {state.vocab.length > 0 && (
              <button
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#30D158]
                           rounded-lg hover:bg-[#28B94E] transition-all duration-200 ease-in-out
                           hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleExport}
              >
                Export CSV
              </button>
            )}
            <button
              className="text-[#8A8A8E] hover:text-[#D1D1D6] transition-colors duration-200 ease-in-out
                         p-1 rounded-lg hover:bg-[#2E2E32]"
              onClick={() => dispatch({ type: 'TOGGLE_VOCAB' })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {state.vocab.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#8A8A8E]">
              <svg className="w-10 h-10 mx-auto mb-3 text-[#38383C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
              Click a word and choose <strong className="text-[#D1D1D6]">Add to vocab</strong> to save it here.
              <br />
              <span className="text-[#636366]">Exported CSV is compatible with Anki.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#38383C]">
              {state.vocab.map(v => (
                <div key={v.word} className="px-5 py-3 flex items-start justify-between group
                                              hover:bg-[#2E2E32] transition-colors duration-200 ease-in-out">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-[#F5F5F7] font-mono">{v.word}</span>
                      {v.translation && <span className="text-[#8A8A8E] shrink-0 text-right">{v.translation}</span>}
                    </div>
                    {v.ipa && (
                      <div className="text-xs mt-0.5 font-mono">
                        /{tokenizeIPA(v.ipa).map((t, i) => (
                          <span key={i} style={{ color: PHONEME_COLORS[t.type] }}>{t.char}</span>
                        ))}/
                      </div>
                    )}
                  </div>
                  <button
                    className="shrink-0 ml-3 p-1 rounded text-[#8A8A8E] hover:text-[#FF453A]
                               opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out"
                    onClick={() => dispatch({ type: 'REMOVE_VOCAB', word: v.word })}
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
