import { useEffect, useRef } from 'react';

interface Props {
  onReadFrom: () => void;
  onAddVocab: () => void;
  onClose: () => void;
}

export default function WordMenu({ onReadFrom, onAddVocab, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to prevent the opening click from immediately closing
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50
                 bg-[#262629] border border-[#38383C] rounded-lg shadow-lg
                 py-1 min-w-[140px] animate-fade-in"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="w-full text-left px-3 py-1.5 text-xs text-[#D1D1D6]
                   hover:bg-[#2E2E32] transition-colors duration-200 ease-in-out
                   flex items-center gap-2"
        onClick={() => { onReadFrom(); onClose(); }}
      >
        <svg className="w-3 h-3 text-[#0A84FF] shrink-0" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z"/>
        </svg>
        Read from here
      </button>
      <button
        className="w-full text-left px-3 py-1.5 text-xs text-[#D1D1D6]
                   hover:bg-[#2E2E32] transition-colors duration-200 ease-in-out
                   flex items-center gap-2"
        onClick={() => { onAddVocab(); onClose(); }}
      >
        <svg className="w-3 h-3 text-[#30D158] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
        Add to vocab
      </button>
    </div>
  );
}
