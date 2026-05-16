import { useApp } from '../context/AppContext';

export default function Header() {
  const { state, dispatch } = useApp();

  return (
    <header className="bg-[#1C1C1E] border-b border-[#38383C]">
      <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-[#8A8A8E]" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z"/>
          </svg>
          <h1 className="text-xl font-semibold tracking-tight text-[#F5F5F7]">DailySpoke</h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Vocab notebook */}
          <button
            className={`p-1.5 rounded-lg transition-all duration-200 ease-in-out
              ${state.vocabOpen
                ? 'bg-[rgba(10,132,255,0.15)] text-[#0A84FF]'
                : 'text-[#8A8A8E] hover:text-[#D1D1D6] hover:bg-[#2E2E32]'
              }`}
            onClick={() => dispatch({ type: 'TOGGLE_VOCAB' })}
            title="Vocabulary notebook"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>

          {/* Analysis */}
          <button
            className={`p-1.5 rounded-lg transition-all duration-200 ease-in-out
              ${state.analysisOpen
                ? 'bg-[rgba(10,132,255,0.15)] text-[#0A84FF]'
                : 'text-[#8A8A8E] hover:text-[#D1D1D6] hover:bg-[#2E2E32]'
              }`}
            onClick={() => dispatch({ type: 'TOGGLE_ANALYSIS' })}
            title="Analysis panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          {/* Settings */}
          <button
            className="text-[#8A8A8E] hover:text-[#D1D1D6] transition-colors duration-200 ease-in-out
                       p-1.5 rounded-lg hover:bg-[#2E2E32]"
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
