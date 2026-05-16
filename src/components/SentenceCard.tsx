import { useState, useRef, useCallback, useEffect } from 'react';
import type { Emotion, Sentence, PlaybackState, WordToken } from '../types';
import { useApp } from '../context/AppContext';
import { useTTS } from '../hooks/useTTS';
import { useRecorder } from '../hooks/useRecorder';
import { translateText } from '../utils/translate';
import { cancelAllTTS } from '../utils/kokoroManager';
import SentenceText from './SentenceText';
import AudioControls from './AudioControls';
import ProgressBar from './ProgressBar';
import PauseHeatmap from './PauseHeatmap';

const EMOTION_LABELS: Record<Emotion, string> = {
  auto: 'Auto',
  neutral: 'Neutral',
  excited: 'Excited',
  sad: 'Sad',
  angry: 'Angry',
  whisper: 'Whisper',
  question: 'Question',
};

type Mode = 'idle' | 'playing' | 'recording' | 'ghostPlaying' | 'ghostRecording' | 'ghostReady';

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

  const { play, playFrom, stop, setLoop, isGenerating } = useTTS(dispatch, state.voiceName);
  const recorder = useRecorder();

  const [mode, setMode] = useState<Mode>('idle');
  const ghostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Cleanup helpers ----

  const clearGhostTimer = useCallback(() => {
    if (ghostTimerRef.current) {
      clearTimeout(ghostTimerRef.current);
      ghostTimerRef.current = null;
    }
  }, []);

  const resetAll = useCallback(() => {
    clearGhostTimer();
    stop(sentence.id);
    if (recorder.isRecording) recorder.stopRecording();
    if (recorder.isPlaying) recorder.stopPlayback();
    setMode('idle');
  }, [clearGhostTimer, stop, recorder, sentence.id]);

  // Cleanup on unmount — uses ref to avoid re-running on every render
  const resetAllRef = useRef(resetAll);
  resetAllRef.current = resetAll;
  useEffect(() => {
    return () => { resetAllRef.current(); };
  }, []);

  // ---- Play / Stop ----

  const handlePlay = () => {
    if (isGenerating) return;
    clearGhostTimer();
    setMode('playing');
    play(sentence.id, sentence.original, sentence.emotion);
  };

  const handleStop = () => {
    resetAll();
  };

  // Sync: when TTS ends, transition mode idle. Only fire on true→false transition.
  const wasPlayingRef = useRef(playback.isPlaying);
  useEffect(() => {
    const wasPlaying = wasPlayingRef.current;
    wasPlayingRef.current = playback.isPlaying;
    if (mode === 'playing' && wasPlaying && !playback.isPlaying) {
      setMode('idle');
    }
  }, [mode, playback.isPlaying]);

  // ---- Loop ----

  const handleToggleLoop = () => {
    if (playback.isLooping) {
      stop(sentence.id);
      setLoop(sentence.id, false);
    } else if (playback.isPlaying) {
      setLoop(sentence.id, true);
    } else {
      setLoop(sentence.id, true);
      play(sentence.id, sentence.original, sentence.emotion);
      setMode('playing');
    }
  };

  // ---- Read from word (menu action) ----

  const handleReadFrom = (charStart: number) => {
    clearGhostTimer();
    if (recorder.isRecording) recorder.stopRecording();
    setMode('playing');
    if (playback.isPlaying) {
      stop(sentence.id);
      setTimeout(() => {
        playFrom(sentence.id, sentence.original, charStart, sentence.emotion);
      }, 50);
    } else {
      playFrom(sentence.id, sentence.original, charStart, sentence.emotion);
    }
  };

  // ---- Add to vocab (menu action) ----

  const handleAddVocab = async (word: WordToken) => {
    // Add immediately so UI responds
    dispatch({ type: 'ADD_VOCAB', word: word.cleaned, ipa: word.ipa, translation: null });
    // Fetch word-level translation in background
    try {
      const wordTranslation = await translateText(word.cleaned, state.deepseek);
      dispatch({ type: 'ADD_VOCAB', word: word.cleaned, ipa: word.ipa, translation: wordTranslation });
    } catch {
      // Word stays in vocab without translation — fine
    }
  };

  // ---- Emotion ----

  const handleSetEmotion = (emotion: Emotion) => {
    dispatch({ type: 'SET_EMOTION', sentenceId: sentence.id, emotion });
  };

  // ---- Translate ----

  const handleTranslate = async () => {
    dispatch({ type: 'SET_TRANSLATING', sentenceId: sentence.id });
    const result = await translateText(sentence.original, state.deepseek);
    dispatch({ type: 'SET_TRANSLATION', sentenceId: sentence.id, translation: result });
  };

  // ---- Ghost Speaker flow ----

  const handleGhost = async () => {
    switch (mode) {
      case 'idle': {
        // Start ghost: play TTS, then auto-record
        clearGhostTimer();
        // Stop any lingering audio
        cancelAllTTS()
        setLoop(sentence.id, false); // disable loop during ghost flow
        dispatch({ type: 'START_PLAYBACK', sentenceId: sentence.id });
        setMode('ghostPlaying');
        play(sentence.id, sentence.original, sentence.emotion);

        const estimatedMs = Math.max(sentence.original.length * 65, 1500);
        ghostTimerRef.current = setTimeout(async () => {
          ghostTimerRef.current = null;
          cancelAllTTS()
          dispatch({ type: 'STOP_PLAYBACK', sentenceId: sentence.id });
          setMode('ghostRecording');
          await recorder.startRecording();
        }, estimatedMs);
        break;
      }

      case 'ghostPlaying': {
        // Cancel ghost flow
        clearGhostTimer();
        stop(sentence.id);
        setMode('idle');
        break;
      }

      case 'ghostRecording': {
        // Finish recording, enter compare mode
        recorder.stopRecording();
        setMode('ghostReady');
        break;
      }

      case 'ghostReady': {
        // Play comparison: TTS → user recording
        dispatch({ type: 'START_PLAYBACK', sentenceId: sentence.id });
        play(sentence.id, sentence.original, sentence.emotion);
        const ttsMs = Math.max(sentence.original.length * 65, 1500);
        ghostTimerRef.current = setTimeout(async () => {
          ghostTimerRef.current = null;
          dispatch({ type: 'STOP_PLAYBACK', sentenceId: sentence.id });
          await recorder.playRecording();
        }, ttsMs + 300);
        break;
      }

      default:
        resetAll();
        break;
    }
  };

  // ---- Quick Rec ----

  const handleRec = async () => {
    if (recorder.isRecording) {
      recorder.stopRecording();
      setMode('idle');
    } else {
      // Stop TTS if playing
      clearGhostTimer();
      stop(sentence.id);
      setMode('recording');
      await recorder.startRecording();
    }
  };

  const handlePlayBack = async () => {
    if (recorder.isPlaying) {
      recorder.stopPlayback();
      setMode('idle');
    } else {
      setMode('idle'); // not really needed, but keeps state clean
      await recorder.playRecording();
    }
  };

  const handleClear = () => {
    recorder.clear();
    setMode('idle');
  };

  // ---- Helpers for button visibility ----

  const isGhostActive = mode === 'ghostPlaying' || mode === 'ghostRecording' || mode === 'ghostReady';
  const isBusy = mode === 'playing' || mode === 'recording' || isGhostActive;

  return (
    <div className="border border-[#38383C] rounded-lg p-6 bg-[#262629]
                    shadow-sm shadow-black/20 animate-fade-in">
      <SentenceText
        words={sentence.words}
        playback={playback}
        onReadFrom={handleReadFrom}
        onAddVocab={handleAddVocab}
      />
      <ProgressBar
        current={playback.currentCharIndex}
        total={sentence.original.length}
      />

      {recorder.hasRecording && recorder.silenceSegments.length > 0 && (
        <PauseHeatmap
          segments={recorder.silenceSegments}
          totalMs={recorder.recordingDuration}
          sentenceLength={sentence.original.length}
        />
      )}

      {/* Control area */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {/* Play / Stop */}
        <AudioControls
          isPlaying={playback.isPlaying}
          isLooping={playback.isLooping}
          isGenerating={isGenerating}
          onPlay={handlePlay}
          onStop={handleStop}
          onToggleLoop={handleToggleLoop}
        />

        {/* Ghost Speaker */}
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ease-in-out
            hover:scale-[1.02] active:scale-[0.98]
            ${mode === 'ghostReady'
              ? 'bg-[rgba(10,132,255,0.15)] text-[#0A84FF] border-[#0A84FF]/30'
              : mode === 'ghostRecording'
              ? 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30'
              : mode === 'ghostPlaying'
              ? 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30'
              : 'bg-[#38383C] text-[#D1D1D6] border-[#38383C] hover:bg-[#48484C]'
            }`}
          onClick={handleGhost}
          title={
            mode === 'idle' ? 'Play TTS then record yourself for comparison'
            : mode === 'ghostPlaying' ? 'Cancel ghost flow'
            : mode === 'ghostRecording' ? 'Stop recording and compare'
            : mode === 'ghostReady' ? 'Compare TTS vs your recording'
            : ''
          }
        >
          {mode === 'idle' && 'Ghost'}
          {mode === 'ghostPlaying' && 'Cancel'}
          {mode === 'ghostRecording' && 'Finish'}
          {mode === 'ghostReady' && 'Compare'}
        </button>

        {/* Rec / Play back / Clear — only when ghost is NOT active */}
        {!isGhostActive && (
          recorder.hasRecording ? (
            <>
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ease-in-out
                  hover:scale-[1.02] active:scale-[0.98]
                  ${recorder.isPlaying
                    ? 'bg-[#FF453A] text-white border-[#FF453A]'
                    : 'bg-[#38383C] text-[#D1D1D6] border-[#38383C] hover:bg-[#48484C]'
                  }`}
                onClick={handlePlayBack}
              >
                {recorder.isPlaying ? 'Stop' : 'Play back'}
              </button>
              <button
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[#38383C]
                           bg-[#38383C] text-[#8A8A8E] hover:bg-[#48484C]
                           transition-all duration-200 ease-in-out
                           hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleClear}
              >
                Clear
              </button>
            </>
          ) : (
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ease-in-out
                hover:scale-[1.02] active:scale-[0.98]
                ${recorder.isRecording
                  ? 'bg-[#FF453A] text-white border-[#FF453A]'
                  : 'bg-[#38383C] text-[#D1D1D6] border-[#38383C] hover:bg-[#48484C]'
                }`}
              onClick={handleRec}
              disabled={mode === 'playing'}
            >
              {recorder.isRecording ? 'Stop' : 'Rec'}
            </button>
          )
        )}

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
