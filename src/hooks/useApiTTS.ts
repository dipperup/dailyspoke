import { useCallback, useRef, useState } from 'react';
import type { AppAction, Emotion } from '../types';
import {
  getApiVoiceId,
  getAudioContext,
  getCachedAudio,
  setCachedAudio,
  registerActiveSource,
  unregisterActiveSource,
  cancelAllTTS,
} from '../utils/kokoroManager';

export function useApiTTS(
  dispatch: React.Dispatch<AppAction>,
  voiceName: string,
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const loopRef = useRef(false);
  const cancelRef = useRef(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rafRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const voiceId = getApiVoiceId(voiceName);

  const clearTimers = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopSource = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      unregisterActiveSource(sourceRef.current);
      sourceRef.current = null;
    }
  }, []);

  const buildFallbackUtterance = useCallback(
    (text: string, offset: number, sentenceId: number) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.onboundary = (ev) => {
        if (ev.name === 'word') {
          dispatch({ type: 'SET_CHAR_INDEX', sentenceId, charIndex: offset + ev.charIndex });
        }
      };
      u.onend = () => {
        clearTimers();
        if (loopRef.current && !cancelRef.current) {
          const next = buildFallbackUtterance(text, offset, sentenceId);
          try { window.speechSynthesis.speak(next); } catch { /* ok */ }
          const estimatedMs = (text.length / 12) * 1000 + 2000;
          timerRef.current = setTimeout(() => {
            dispatch({ type: 'STOP_PLAYBACK', sentenceId });
          }, estimatedMs);
        } else {
          dispatch({ type: 'STOP_PLAYBACK', sentenceId });
        }
      };
      u.onerror = () => {
        clearTimers();
        dispatch({ type: 'STOP_PLAYBACK', sentenceId });
      };
      return u;
    },
    [dispatch, clearTimers],
  );

  const startPlayback = useCallback(
    async (sentenceId: number, text: string, charStart: number, emotion: Emotion) => {
      cancelRef.current = true;
      if (abortRef.current) abortRef.current.abort();
      cancelAllTTS();
      cancelRef.current = false;
      clearTimers();

      setIsGenerating(true);

      const cacheKey = `api:${voiceId}:${text}:${charStart}`;
      let buffer = getCachedAudio(cacheKey);

      if (!buffer) {
        try {
          const controller = new AbortController();
          abortRef.current = controller;

          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice: voiceId }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const ctx = getAudioContext();
          buffer = await ctx.decodeAudioData(arrayBuffer);
          setCachedAudio(cacheKey, buffer);
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            setIsGenerating(false);
            return;
          }
          console.error('[useApiTTS] generation failed, falling back to SpeechSynthesis:', err);
          setIsGenerating(false);
          cancelRef.current = false;
          const utterance = buildFallbackUtterance(text, charStart, sentenceId);
          try { window.speechSynthesis.speak(utterance); } catch { /* ok */ }
          dispatch({ type: 'START_PLAYBACK', sentenceId, offset: charStart } as AppAction);
          const estimatedMs = (text.length / 12) * 1000 + 2000;
          timerRef.current = setTimeout(() => {
            dispatch({ type: 'STOP_PLAYBACK', sentenceId });
          }, estimatedMs);
          return;
        }
      }

      setIsGenerating(false);
      abortRef.current = null;

      if (cancelRef.current) return;

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      sourceRef.current = source;
      registerActiveSource(source);

      const startTime = ctx.currentTime;
      const duration = buffer.duration;

      dispatch({ type: 'START_PLAYBACK', sentenceId, offset: charStart } as AppAction);

      const updateProgress = () => {
        const elapsed = ctx.currentTime - startTime;
        if (elapsed >= duration) return;
        const fraction = Math.min(elapsed / duration, 1);
        const charIndex = charStart + Math.floor(fraction * text.length);
        dispatch({ type: 'SET_CHAR_INDEX', sentenceId, charIndex });
        rafRef.current = requestAnimationFrame(updateProgress);
      };
      rafRef.current = requestAnimationFrame(updateProgress);

      source.onended = () => {
        clearTimers();
        sourceRef.current = null;
        unregisterActiveSource(source);
        if (loopRef.current && !cancelRef.current) {
          startPlayback(sentenceId, text, charStart, emotion);
        } else {
          dispatch({ type: 'STOP_PLAYBACK', sentenceId });
        }
      };

      source.start();

      const estimatedMs = (duration + 1) * 1000;
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'STOP_PLAYBACK', sentenceId });
      }, estimatedMs);
    },
    [voiceId, dispatch, clearTimers, stopSource, buildFallbackUtterance],
  );

  const play = useCallback(
    (sentenceId: number, text: string, emotion: Emotion) => {
      loopRef.current = false;
      startPlayback(sentenceId, text, 0, emotion);
    },
    [startPlayback],
  );

  const playFrom = useCallback(
    (sentenceId: number, text: string, charStart: number, emotion: Emotion) => {
      loopRef.current = false;
      const subText = text.substring(charStart);
      startPlayback(sentenceId, subText, charStart, emotion);
    },
    [startPlayback],
  );

  const stop = useCallback(
    (sentenceId: number) => {
      loopRef.current = false;
      cancelRef.current = true;
      if (abortRef.current) abortRef.current.abort();
      cancelAllTTS();
      cancelRef.current = false;
      clearTimers();
      stopSource();
      dispatch({ type: 'STOP_PLAYBACK', sentenceId });
    },
    [dispatch, clearTimers, stopSource],
  );

  const setLoop = useCallback(
    (sentenceId: number, value: boolean) => {
      loopRef.current = value;
      dispatch({ type: 'SET_LOOP', sentenceId, value });
    },
    [dispatch],
  );

  return { play, playFrom, stop, setLoop, isGenerating };
}
