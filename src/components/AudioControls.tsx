interface Props {
  isPlaying: boolean;
  isLooping: boolean;
  isGenerating?: boolean;
  onPlay: () => void;
  onStop: () => void;
  onToggleLoop: () => void;
}

export default function AudioControls({
  isPlaying,
  isLooping,
  isGenerating,
  onPlay,
  onStop,
  onToggleLoop,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      {isPlaying ? (
        isGenerating ? (
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg
                       bg-[#38383C] text-[#8A8A8E] border border-[#38383C]
                       animate-pulse cursor-not-allowed"
            disabled
          >
            Generating...
          </button>
        ) : (
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg
                       bg-[#FF453A] text-white
                       transition-all duration-200 ease-in-out
                       hover:scale-[1.02] active:scale-[0.98]"
            onClick={onStop}
          >
            Stop
          </button>
        )
      ) : (
        <button
          className="px-3 py-1.5 text-sm font-medium rounded-lg
                     bg-[#38383C] text-[#D1D1D6] border border-[#38383C]
                     hover:bg-[#48484C] transition-all duration-200 ease-in-out
                     hover:scale-[1.02] active:scale-[0.98]"
          onClick={onPlay}
        >
          Play
        </button>
      )}

      <button
        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ease-in-out
          hover:scale-[1.02] active:scale-[0.98]
          ${isLooping
            ? 'bg-[rgba(10,132,255,0.15)] text-[#0A84FF] border-[#0A84FF]/30'
            : 'bg-[#38383C] text-[#8A8A8E] border-[#38383C] hover:bg-[#48484C]'
          }`}
        onClick={onToggleLoop}
      >
        {isLooping ? 'Loop on' : 'Loop'}
      </button>
    </div>
  );
}
