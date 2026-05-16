import { useApp } from '../context/AppContext';
import { KOKORO_VOICES, KOKORO_VOICE_PREFIX, API_VOICE_PREFIX } from '../utils/kokoroManager';

export default function VoiceSelector() {
  const { state, dispatch } = useApp();

  return (
    <div className="flex items-center gap-2">
      <select
        className="text-sm border border-[#38383C] rounded-lg px-2.5 py-1.5
                   bg-[#262629] text-[#D1D1D6] focus:outline-none
                   focus:ring-2 focus:ring-[#0A84FF]/20 focus:border-[#0A84FF]
                   transition-all duration-200 ease-in-out"
        value={state.voiceName}
        onChange={e => dispatch({ type: 'SET_VOICE', voiceName: e.target.value })}
      >
        <optgroup label="System">
          <option value="">System default</option>
        </optgroup>
        <optgroup label="Kokoro (Python — best quality)">
          {KOKORO_VOICES.map(v => (
            <option key={`api-${v.id}`} value={`${API_VOICE_PREFIX}${v.id}`}>
              {v.label} ({v.quality})
            </option>
          ))}
        </optgroup>
        <optgroup label="Kokoro (Browser — offline fallback)">
          {KOKORO_VOICES.map(v => (
            <option key={v.id} value={`${KOKORO_VOICE_PREFIX}${v.id}`}>
              {v.label} ({v.quality})
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
