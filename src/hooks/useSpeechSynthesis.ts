import { useCallback, useRef } from 'react';
import type { AppAction, Emotion } from '../types';

// To swap in a cloud TTS engine (Google Cloud TTS, Azure, etc.):
// 1. Implement a new hook with the same signature as useSpeechSynthesis
// 2. Replace the import in SentenceCard.tsx
// 3. The cloud hook accepts voiceName for voice selection just like this one
//    but uses it as the cloud API's voice parameter instead of SpeechSynthesisVoice

interface EmotionParams {
  rate: number;
  pitch: number;
  volume: number;
}

const EMOTION_PRESETS: Record<Exclude<Emotion, 'auto'>, EmotionParams> = {
  neutral:  { rate: 0.85, pitch: 1.0, volume: 1.0 },
  excited:  { rate: 1.05, pitch: 1.25, volume: 1.0 },
  sad:      { rate: 0.72, pitch: 0.82, volume: 0.65 },
  angry:    { rate: 1.1, pitch: 1.35, volume: 1.0 },
  whisper:  { rate: 0.65, pitch: 0.88, volume: 0.35 },
  question: { rate: 0.9, pitch: 1.15, volume: 1.0 },
};

let cachedVoices: SpeechSynthesisVoice[] = [];

function getSS() {
  try { return window.speechSynthesis; } catch { return null; }
}

function loadVoices(): SpeechSynthesisVoice[] {
  try {
    const ss = getSS();
    if (ss) {
      const voices = ss.getVoices();
      if (voices.length) cachedVoices = voices;
    }
  } catch { /* speech not available */ }
  return cachedVoices;
}

// Pre-warm voices
try {
  const ss = getSS();
  if (ss) {
    ss.onvoiceschanged = () => { cachedVoices = ss.getVoices(); };
  }
} catch { /* ignore */ }

function pickVoice(name: string): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!name || !voices.length) return null;
  return voices.find(v => v.name === name) || null;
}

function resolveEmotion(emotion: Emotion, text: string): EmotionParams {
  if (emotion === 'auto') {
    const trimmed = text.trim();
    if (trimmed.endsWith('!')) return EMOTION_PRESETS.excited;
    if (trimmed.endsWith('?')) return EMOTION_PRESETS.question;
    if (trimmed.endsWith('...')) return EMOTION_PRESETS.sad;
    const upperCount = (trimmed.match(/[A-Z]{2,}/g) || []).length;
    if (upperCount >= 2) return EMOTION_PRESETS.angry;
    return EMOTION_PRESETS.neutral;
  }
  return EMOTION_PRESETS[emotion] || EMOTION_PRESETS.neutral;
}

export function useSpeechSynthesis(
  dispatch: React.Dispatch<AppAction>,
  voiceName: string,
) {
  const loopRef = useRef(false);
  const cancelRef = useRef(false); // true when cancel() is intentional — suppress loop
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const buildUtterance = useCallback(
    (sentenceId: number, text: string, offset: number, voiceName: string, emotion: Emotion) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      const params = resolveEmotion(emotion, text);
      utterance.rate = params.rate;
      utterance.pitch = params.pitch;
      utterance.volume = params.volume;

      const voice = pickVoice(voiceName);
      if (voice) utterance.voice = voice;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          dispatch({
            type: 'SET_CHAR_INDEX',
            sentenceId,
            charIndex: offset + event.charIndex,
          });
        }
      };

      utterance.onend = () => {
        clearTimer();
        if (loopRef.current && !cancelRef.current) {
          const next = buildUtterance(sentenceId, text, offset, voiceName, emotion);
          try { window.speechSynthesis.speak(next); } catch { /* ok */ }
          const estimatedMs = (text.length / 12) * 1000 + 2000;
          timerRef.current = setTimeout(() => {
            dispatch({ type: 'STOP_PLAYBACK', sentenceId });
          }, estimatedMs);
        } else {
          dispatch({ type: 'STOP_PLAYBACK', sentenceId });
        }
      };

      utterance.onerror = () => {
        clearTimer();
        dispatch({ type: 'STOP_PLAYBACK', sentenceId });
      };

      return utterance;
    },
    [dispatch, clearTimer],
  );

  const play = useCallback(
    (sentenceId: number, text: string, emotion: Emotion) => {
      cancelRef.current = true;
      try { window.speechSynthesis.cancel(); } catch { /* ok */ }
      cancelRef.current = false;
      clearTimer();
      dispatch({ type: 'START_PLAYBACK', sentenceId, offset: 0 } as AppAction);
      const utterance = buildUtterance(sentenceId, text, 0, voiceName, emotion);
      try { window.speechSynthesis.speak(utterance); } catch { /* ok */ }
      const estimatedMs = (text.length / 12) * 1000 + 2000;
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'STOP_PLAYBACK', sentenceId });
      }, estimatedMs);
    },
    [dispatch, buildUtterance, clearTimer, voiceName],
  );

  const playFrom = useCallback(
    (sentenceId: number, text: string, charStart: number, emotion: Emotion) => {
      cancelRef.current = true;
      try { window.speechSynthesis.cancel(); } catch { /* ok */ }
      cancelRef.current = false;
      clearTimer();
      dispatch({ type: 'START_PLAYBACK', sentenceId, offset: charStart } as AppAction);
      const subText = text.substring(charStart);
      const utterance = buildUtterance(sentenceId, subText, charStart, voiceName, emotion);
      try { window.speechSynthesis.speak(utterance); } catch { /* ok */ }
      const estimatedMs = (subText.length / 12) * 1000 + 2000;
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'STOP_PLAYBACK', sentenceId });
      }, estimatedMs);
    },
    [dispatch, buildUtterance, clearTimer, voiceName],
  );

  const stop = useCallback(
    (sentenceId: number) => {
      loopRef.current = false;
      cancelRef.current = true;
      try { window.speechSynthesis.cancel(); } catch { /* ok */ }
      cancelRef.current = false;
      clearTimer();
      dispatch({ type: 'STOP_PLAYBACK', sentenceId });
    },
    [dispatch, clearTimer],
  );

  const setLoop = useCallback(
    (sentenceId: number, value: boolean) => {
      loopRef.current = value;
      dispatch({ type: 'SET_LOOP', sentenceId, value });
    },
    [dispatch],
  );

  return { play, playFrom, stop, setLoop };
}
