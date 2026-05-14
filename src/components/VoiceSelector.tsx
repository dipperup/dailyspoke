import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

function getEnglishVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
}

export default function VoiceSelector() {
  const { state, dispatch } = useApp();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(getEnglishVoices);

  useEffect(() => {
    const update = () => setVoices(getEnglishVoices());
    speechSynthesis.onvoiceschanged = update;
    update();
  }, []);

  return (
    <select
      className="text-sm border border-[#38383C] rounded-lg px-2.5 py-1.5
                 bg-[#262629] text-[#D1D1D6] focus:outline-none
                 focus:ring-2 focus:ring-[#0A84FF]/20 focus:border-[#0A84FF]
                 transition-all duration-200 ease-in-out"
      value={state.voiceName}
      onChange={e => dispatch({ type: 'SET_VOICE', voiceName: e.target.value })}
    >
      <option value="">Default voice</option>
      {voices.map(v => (
        <option key={v.name} value={v.name}>
          {v.name.replace(/Microsoft |Online |\(Natural\)|-/g, '').trim()}
        </option>
      ))}
    </select>
  );
}
