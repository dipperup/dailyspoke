import { useState, useRef, useCallback } from 'react';
import type { SilenceSegment } from '../types';

interface UseRecorderReturn {
  isRecording: boolean;
  isPlaying: boolean;
  hasRecording: boolean;
  recordingDuration: number;
  silenceSegments: SilenceSegment[];
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playRecording: () => Promise<void>;
  stopPlayback: () => void;
  clear: () => void;
}

export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [silenceSegments, setSilenceSegments] = useState<SilenceSegment[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const silenceDataRef = useRef<{ startMs: number | null; segments: SilenceSegment[]; totalMs: number }>({
    startMs: null,
    segments: [],
    totalMs: 0,
  });

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // AudioContext for pause analysis
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);
    analyserRef.current = analyser;

    // MediaRecorder for capture
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      audioCtx.close();

      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      audioRef.current = new Audio(URL.createObjectURL(blob));
      setHasRecording(true);

      // Compute silence segments
      const totalMs = silenceDataRef.current.totalMs;
      const segments = [...silenceDataRef.current.segments];
      if (silenceDataRef.current.startMs !== null) {
        segments.push({
          startMs: silenceDataRef.current.startMs,
          durationMs: totalMs - silenceDataRef.current.startMs,
          ratio: silenceDataRef.current.startMs / (totalMs || 1),
        });
      }
      setSilenceSegments(segments);
      setRecordingDuration(totalMs);

      // Reset
      silenceDataRef.current = { startMs: null, segments: [], totalMs: 0 };
    };

    // Volume analysis loop
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const startTime = Date.now();
    const SILENCE_THRESHOLD = 30;
    const MIN_SILENCE_MS = 400;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const elapsed = Date.now() - startTime;
      silenceDataRef.current.totalMs = elapsed;

      if (avg < SILENCE_THRESHOLD) {
        if (silenceDataRef.current.startMs === null) {
          silenceDataRef.current.startMs = elapsed;
        }
      } else {
        if (silenceDataRef.current.startMs !== null) {
          const duration = elapsed - silenceDataRef.current.startMs;
          if (duration >= MIN_SILENCE_MS) {
            silenceDataRef.current.segments.push({
              startMs: silenceDataRef.current.startMs,
              durationMs: duration,
              ratio: silenceDataRef.current.startMs / (elapsed || 1),
            });
          }
          silenceDataRef.current.startMs = null;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    recorder.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const playRecording = useCallback(async () => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    audioRef.current.onended = () => setIsPlaying(false);
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const clear = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setHasRecording(false);
    setIsPlaying(false);
    setSilenceSegments([]);
    setRecordingDuration(0);
  }, []);

  return {
    isRecording,
    isPlaying,
    hasRecording,
    recordingDuration,
    silenceSegments,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    clear,
  };
}
