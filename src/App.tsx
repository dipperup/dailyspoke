import { useState, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import HistoryPanel from './components/HistoryPanel';
import VoiceSelector from './components/VoiceSelector';
import TextInput from './components/TextInput';
import SentenceList from './components/SentenceList';

function AppInner() {
  const [fillText, setFillText] = useState<string | undefined>();

  const handleFill = useCallback((text: string) => {
    setFillText(text);
  }, []);

  const handleFilled = useCallback(() => {
    setFillText(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      <Header />
      <SettingsModal />
      <div className="flex flex-1">
        <HistoryPanel onFill={handleFill} />
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Voice selection area */}
          <div className="w-full max-w-3xl mx-auto px-4 pt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-[#8A8A8E]">Voice</span>
              <VoiceSelector />
            </div>
            {/* Input area */}
            <TextInput fillText={fillText} onFilled={handleFilled} />
          </div>
          {/* Results area */}
          <SentenceList />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
