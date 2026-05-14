import type { WordToken } from '../types';

interface Props {
  word: WordToken;
  isActive: boolean;
  onClick: () => void;
}

export default function WordSpan({ word, isActive, onClick }: Props) {
  return (
    <span
      className={`inline-flex flex-col items-center cursor-pointer px-1.5 py-0.5 rounded
        transition-all duration-200 ease-in-out
        ${isActive
          ? 'bg-[rgba(10,132,255,0.15)] text-[#0A84FF] ring-1 ring-[#0A84FF]/30'
          : 'hover:bg-[#2E2E32] text-[#D1D1D6]'
        }`}
      onClick={onClick}
      title={word.ipa ? `/${word.ipa}/` : ''}
    >
      <span className="text-base font-mono">{word.text}</span>
      <span className="text-sm text-[#8A8A8E] leading-tight mt-0.5 font-mono">
        {word.ipa ? `/${word.ipa}/` : '·'}
      </span>
    </span>
  );
}
