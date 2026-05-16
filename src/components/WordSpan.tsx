import { useState, useRef } from 'react';
import type { WordToken } from '../types';
import { tokenizeIPA, PHONEME_COLORS } from '../utils/phonemeColorer';
import WordMenu from './WordMenu';

interface Props {
  word: WordToken;
  isActive: boolean;
  onReadFrom: () => void;
  onAddVocab: () => void;
}

export default function WordSpan({ word, isActive, onReadFrom, onAddVocab }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleClick = () => {
    setMenuOpen(v => !v);
  };

  return (
    <span
      ref={spanRef}
      className={`relative inline-flex flex-col items-center cursor-pointer px-1.5 py-0.5 rounded
        transition-all duration-200 ease-in-out
        ${isActive
          ? 'bg-[rgba(10,132,255,0.15)] text-[#0A84FF] ring-1 ring-[#0A84FF]/30'
          : 'hover:bg-[#2E2E32] text-[#D1D1D6]'
        }`}
      onClick={handleClick}
      title={menuOpen ? '' : (word.ipa ? `/${word.ipa}/` : '')}
    >
      <span className="text-base font-mono">{word.text}</span>
      {word.ipa ? (
        <span className="text-sm leading-tight mt-0.5 font-mono">
          /{tokenizeIPA(word.ipa).map((t, i) => (
            <span key={i} style={{ color: PHONEME_COLORS[t.type] }}>{t.char}</span>
          ))}/
        </span>
      ) : (
        <span className="text-sm text-[#8A8A8E] leading-tight mt-0.5 font-mono">·</span>
      )}

      {menuOpen && (
        <WordMenu
          onReadFrom={onReadFrom}
          onAddVocab={onAddVocab}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </span>
  );
}
