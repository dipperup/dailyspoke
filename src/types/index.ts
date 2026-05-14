export interface WordToken {
  text: string;
  cleaned: string;
  charStart: number;
  charEnd: number;
  ipa: string | null;
}

export type Emotion = 'auto' | 'neutral' | 'excited' | 'sad' | 'angry' | 'whisper' | 'question';

export interface Sentence {
  id: number;
  original: string;
  words: WordToken[];
  ipaLoading: boolean;
  emotion: Emotion;
  translation: string | null;
  translating: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  isLooping: boolean;
  currentCharIndex: number | null;
  offset: number;
}

export interface TTSProvider {
  play(sentenceId: number, text: string, voiceName: string): void;
  playFrom(sentenceId: number, text: string, charStart: number, voiceName: string): void;
  stop(sentenceId: number): void;
  setLoop(sentenceId: number, value: boolean): void;
}

export interface DeepSeekConfig {
  key: string;
  model: string;
}

export interface HistoryEntry {
  text: string;
  time: number;
}

export interface AppState {
  rawText: string;
  sentences: Sentence[];
  playback: Record<number, PlaybackState>;
  voiceName: string;
  deepseek: DeepSeekConfig;
  settingsOpen: boolean;
  historyOpen: boolean;
  history: HistoryEntry[];
}

export type AppAction =
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SET_IPA'; sentenceId: number; ipaMap: Record<string, string> }
  | { type: 'START_PLAYBACK'; sentenceId: number; offset?: number }
  | { type: 'SET_CHAR_INDEX'; sentenceId: number; charIndex: number }
  | { type: 'STOP_PLAYBACK'; sentenceId: number }
  | { type: 'SET_LOOP'; sentenceId: number; value: boolean }
  | { type: 'SET_EMOTION'; sentenceId: number; emotion: Emotion }
  | { type: 'SET_TRANSLATING'; sentenceId: number }
  | { type: 'SET_TRANSLATION'; sentenceId: number; translation: string }
  | { type: 'SET_DEEPSEEK'; key: string; model: string }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_HISTORY' }
  | { type: 'ADD_HISTORY'; text: string }
  | { type: 'SET_VOICE'; voiceName: string };
