import type { AppAction, Emotion } from '../types';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useKokoroTTS } from './useKokoroTTS';
import { useApiTTS } from './useApiTTS';
import { isKokoroVoice, isApiVoice } from '../utils/kokoroManager';

export function useTTS(dispatch: React.Dispatch<AppAction>, voiceName: string) {
  const ss = useSpeechSynthesis(dispatch, voiceName);
  const kokoro = useKokoroTTS(dispatch, voiceName);
  const api = useApiTTS(dispatch, voiceName);

  if (isApiVoice(voiceName)) {
    return {
      play: api.play,
      playFrom: api.playFrom,
      stop: api.stop,
      setLoop: api.setLoop,
      isGenerating: api.isGenerating,
    };
  }

  if (isKokoroVoice(voiceName)) {
    return {
      play: kokoro.play,
      playFrom: kokoro.playFrom,
      stop: kokoro.stop,
      setLoop: kokoro.setLoop,
      isGenerating: kokoro.isGenerating,
    };
  }

  return {
    ...ss,
    isGenerating: false,
  };
}
