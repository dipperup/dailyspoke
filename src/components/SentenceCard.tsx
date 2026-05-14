import type { Emotion, Sentence, PlaybackState } from '../types';
import { useApp } from '../context/AppContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { translateText } from '../utils/translate';
import SentenceText from './SentenceText';
import AudioControls from './AudioControls';
import ProgressBar from './ProgressBar';

const EMOTION_LABELS: Record<Emotion, string> = {
  auto: 'Auto',
  neutral: 'Neutral',
  excited: 'Excited',
  sad: 'Sad',
  angry: 'Angry',
  whisper: 'Whisper',
  question: 'Question',
};

interface Props {
  sentence: Sentence;
}

export default function SentenceCard({ sentence }: Props) {
  const { state, dispatch } = useApp();
  const playback: PlaybackState = state.playback[sentence.id] ?? {
    isPlaying: false,
    isLooping: false,
    currentCharIndex: null,
    offset: 0,
  };

  const { play, playFrom, stop, setLoop } = useSpeechSynthesis(dispatch, state.voiceName);

  const handlePlay = () => play(sentence.id, sentence.original, sentence.emotion);
  const handleStop = () => stop(sentence.id);

  const handleToggleLoop = () => {
    if (playback.isLooping) {
      stop(sentence.id);
      setLoop(sentence.id, false);
    } else if (playback.isPlaying) {
      setLoop(sentence.id, true);
    } else {
      setLoop(sentence.id, true);
      play(sentence.id, sentence.original, sentence.emotion);
    }
  };

  const handleWordClick = (charStart: number) => {
    if (playback.isPlaying) {
      stop(sentence.id);
      setTimeout(() => {
        playFrom(sentence.id, sentence.original, charStart, sentence.emotion);
      }, 50);
    } else {
      playFrom(sentence.id, sentence.original, charStart, sentence.emotion);
    }
  };

  const handleSetEmotion = (emotion: Emotion) => {
    dispatch({ type: 'SET_EMOTION', sentenceId: sentence.id, emotion });
  };

  const handleTranslate = async () => {
    if (sentence.translation || sentence.translating) return;
    dispatch({ type: 'SET_TRANSLATING', sentenceId: sentence.id });
    try {
      const result = await translateText(sentence.original, state.deepseek);
      dispatch({ type: 'SET_TRANSLATION', sentenceId: sentence.id, translation: result });
    } catch {
      dispatch({ type: 'SET_TRANSLATION', sentenceId: sentence.id, translation: 'Translation failed' });
    }
  };

  return (
    <div className="border border-[#38383C] rounded-lg p-6 bg-[#262629]
                    shadow-sm shadow-black/20 animate-fade-in">
      <SentenceText
        words={sentence.words}
        playback={playback}
        onWordClick={handleWordClick}
      />
      <ProgressBar
        current={playback.currentCharIndex}
        total={sentence.original.length}
      />
      {/* Control area */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <AudioControls
          isPlaying={playback.isPlaying}
          isLooping={playback.isLooping}
          onPlay={handlePlay}
          onStop={handleStop}
          onToggleLoop={handleToggleLoop}
        />
        <select
          className="text-sm border border-[#38383C] rounded-lg px-2.5 py-1.5
                     text-[#8A8A8E] bg-[#1C1C1E] focus:outline-none
                     focus:ring-2 focus:ring-[#0A84FF]/20 focus:border-[#0A84FF]
                     transition-all duration-200 ease-in-out"
          value={sentence.emotion}
          onChange={e => handleSetEmotion(e.target.value as Emotion)}
        >
          {Object.entries(EMOTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button
          className="text-sm text-[#8A8A8E] hover:text-[#0A84FF] transition-all duration-200 ease-in-out
                     border border-[#38383C] rounded-lg px-2.5 py-1.5 bg-[#1C1C1E]
                     hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-40 disabled:hover:scale-100"
          onClick={handleTranslate}
          disabled={sentence.translating}
        >
          {sentence.translating ? '...' : 'A → 文'}
        </button>
      </div>
      {sentence.translation && (
        <div className="mt-4 text-sm text-[#D1D1D6] border-t border-[#38383C] pt-4 leading-relaxed">
          {sentence.translation}
        </div>
      )}
    </div>
  );
}
