import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SettingsModal() {
  const { state, dispatch } = useApp();
  const [key, setKey] = useState(state.deepseek.key);
  const [model, setModel] = useState(state.deepseek.model);

  if (!state.settingsOpen) return null;

  const handleSave = () => {
    dispatch({ type: 'SET_DEEPSEEK', key: key.trim(), model: model.trim() || 'deepseek-chat' });
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in"
         onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}>
      <div className="bg-[#262629] rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-[#38383C]"
           onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-[#F5F5F7] mb-5">Settings</h2>

        <label className="block text-sm font-medium text-[#D1D1D6] mb-1.5">
          DeepSeek API Key
        </label>
        <input
          type="password"
          className="w-full border border-[#38383C] rounded-lg px-3 py-2 text-sm mb-5
                     bg-[#1C1C1E] text-[#D1D1D6]
                     focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/20 focus:border-[#0A84FF]
                     placeholder:text-[#636366] transition-all duration-200 ease-in-out"
          placeholder="sk-..."
          value={key}
          onChange={e => setKey(e.target.value)}
        />

        <label className="block text-sm font-medium text-[#D1D1D6] mb-1.5">
          Model
        </label>
        <input
          type="text"
          className="w-full border border-[#38383C] rounded-lg px-3 py-2 text-sm mb-5
                     bg-[#1C1C1E] text-[#D1D1D6]
                     focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/20 focus:border-[#0A84FF]
                     placeholder:text-[#636366] transition-all duration-200 ease-in-out"
          placeholder="deepseek-chat"
          value={model}
          onChange={e => setModel(e.target.value)}
        />

        <p className="text-sm text-[#8A8A8E] mb-6 leading-relaxed">
          When set, translation uses DeepSeek instead of MyMemory.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 text-sm font-medium text-[#8A8A8E]
                       hover:text-[#D1D1D6] rounded-lg hover:bg-[#2E2E32]
                       transition-all duration-200 ease-in-out
                       hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-[#30D158]
                       rounded-lg hover:bg-[#28B94E] transition-all duration-200 ease-in-out
                       hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
