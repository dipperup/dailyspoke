import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

interface Props {
  onFill: (text: string) => void;
}

export default function HistoryPanel({ onFill }: Props) {
  const { state } = useApp();
  const [width, setWidth] = useState(224);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      setWidth(Math.max(180, Math.min(400, e.clientX)));
    };
    const onMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleClick = useCallback((text: string, index: number) => {
    setSelectedIndex(index);
    onFill(text);
  }, [onFill]);

  return (
    <aside
      className="shrink-0 border-r border-[#38383C] bg-[#1C1C1E] flex flex-col relative"
      style={{ width, transition: isResizing ? 'none' : 'width 0.2s ease-in-out' }}
    >
      <div className="px-4 py-3 text-xs font-semibold text-[#8A8A8E] uppercase tracking-wide
                      border-b border-[#38383C]">
        History
        {state.history.length > 0 && (
          <span className="ml-1 text-[#8A8A8E]">{state.history.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.history.length === 0 ? (
          <p className="px-4 py-4 text-xs text-[#8A8A8E]">
            Processed text will appear here
          </p>
        ) : (
          state.history.map((entry, i) => (
            <button
              key={i}
              className={`w-full text-left px-4 h-12 flex flex-col justify-center
                transition-colors duration-200 ease-in-out
                ${selectedIndex === i
                  ? 'bg-[rgba(10,132,255,0.15)]'
                  : 'hover:bg-[#2E2E32]'
                }`}
              onClick={() => handleClick(entry.text, i)}
              title={entry.text}
            >
              <span className="text-[10px] leading-tight text-[#8A8A8E]">
                {new Date(entry.time).toLocaleString('zh-CN', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <span className="text-sm text-[#D1D1D6] truncate mt-0.5">
                {entry.text}
              </span>
            </button>
          ))
        )}
      </div>

      <div
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize
          transition-colors duration-200 ease-in-out z-20
          ${isResizing ? 'bg-[#0A84FF]' : 'bg-transparent hover:bg-[#38383C]'}`}
        style={{ marginRight: -2 }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      />
    </aside>
  );
}
