import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { parseSentences, collectWords } from '../utils/sentenceSplitter';
import { lookupBatch } from '../utils/ipaEngine';

interface Props {
  fillText?: string;
  onFilled?: () => void;
}

export default function TextInput({ fillText, onFilled }: Props) {
  const { state, dispatch } = useApp();
  const [value, setValue] = useState(state.rawText);

  useEffect(() => {
    if (fillText) {
      setValue(fillText);
      onFilled?.();
    }
  }, [fillText, onFilled]);

  const handleProcess = async () => {
    const text = value.trim();
    if (!text) return;

    dispatch({ type: 'ADD_HISTORY', text });
    dispatch({ type: 'SET_TEXT', text });

    const sentences = parseSentences(text);
    const words = collectWords(sentences);
    if (words.length > 0) {
      const ipaMap = await lookupBatch(words);
      for (const sentence of sentences) {
        const relevant: Record<string, string> = {};
        for (const word of sentence.words) {
          if (ipaMap[word.cleaned]) {
            relevant[word.cleaned] = ipaMap[word.cleaned];
          }
        }
        if (Object.keys(relevant).length > 0) {
          dispatch({ type: 'SET_IPA', sentenceId: sentence.id, ipaMap: relevant });
        }
      }
    }
  };

  return (
    <div className="w-full">
      <textarea
        className="w-full h-44 p-4 border border-[#38383C] rounded-lg
                   text-base leading-[1.7]
                   bg-[#262629] text-[#D1D1D6]
                   focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/20
                   focus:border-[#0A84FF] placeholder:text-[#636366]
                   transition-all duration-200 ease-in-out"
        placeholder="Paste English text here..."
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button
        className="mt-4 px-5 py-2 text-sm font-medium text-white
                   bg-[#30D158] rounded-lg hover:bg-[#28B94E]
                   active:bg-[#30D158]
                   transition-all duration-200 ease-in-out
                   hover:scale-[1.02] active:scale-[0.98]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   disabled:hover:scale-100 disabled:active:scale-100"
        disabled={!value.trim()}
        onClick={handleProcess}
      >
        Process text
      </button>
    </div>
  );
}
