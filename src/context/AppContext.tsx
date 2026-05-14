import { createContext, useContext, useReducer } from 'react';
import type { AppState, AppAction, HistoryEntry } from '../types';
import { parseSentences } from '../utils/sentenceSplitter';

const LS_DS = 'dailyspoke_ds';
const LS_HIST = 'dailyspoke_hist';
const MAX_HISTORY = 50;

function loadSettings(): { key: string; model: string } {
  try { const raw = localStorage.getItem(LS_DS); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return { key: '', model: 'deepseek-chat' };
}
function saveSettings(key: string, model: string) {
  try { localStorage.setItem(LS_DS, JSON.stringify({ key, model })); } catch { /* ignore */ }
}
function loadHistory(): HistoryEntry[] {
  try { const raw = localStorage.getItem(LS_HIST); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return [];
}
function saveHistory(h: HistoryEntry[]) {
  try { localStorage.setItem(LS_HIST, JSON.stringify(h.slice(0, MAX_HISTORY))); } catch { /* ignore */ }
}

const initialPlayback = () => ({
  isPlaying: false,
  isLooping: false,
  currentCharIndex: null,
  offset: 0,
});

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TEXT': {
      const sentences = parseSentences(action.text);
      const playback: Record<number, ReturnType<typeof initialPlayback>> = {};
      for (const s of sentences) {
        playback[s.id] = initialPlayback();
      }
      return { ...state, rawText: action.text, sentences, playback: playback as AppState['playback'] };
    }

    case 'SET_IPA': {
      const newSentences = state.sentences.map(s => ({
        ...s,
        words: s.words.map(w => ({
          ...w,
          ipa: action.ipaMap[w.cleaned] ?? w.ipa,
        })),
        ipaLoading: false,
      }));
      return { ...state, sentences: newSentences };
    }

    case 'START_PLAYBACK':
      return {
        ...state,
        playback: {
          ...state.playback,
          [action.sentenceId]: {
            isPlaying: true,
            isLooping: state.playback[action.sentenceId]?.isLooping ?? false,
            currentCharIndex: action.offset ?? 0,
            offset: action.offset ?? 0,
          },
        },
      };

    case 'SET_CHAR_INDEX':
      return {
        ...state,
        playback: {
          ...state.playback,
          [action.sentenceId]: {
            ...state.playback[action.sentenceId],
            currentCharIndex: action.charIndex,
          },
        },
      };

    case 'STOP_PLAYBACK':
      return {
        ...state,
        playback: {
          ...state.playback,
          [action.sentenceId]: initialPlayback(),
        },
      };

    case 'SET_LOOP':
      return {
        ...state,
        playback: {
          ...state.playback,
          [action.sentenceId]: {
            ...state.playback[action.sentenceId],
            isLooping: action.value,
          },
        },
      };

    case 'SET_EMOTION':
      return {
        ...state,
        sentences: state.sentences.map(s =>
          s.id === action.sentenceId ? { ...s, emotion: action.emotion } : s,
        ),
      };

    case 'SET_TRANSLATING':
      return {
        ...state,
        sentences: state.sentences.map(s =>
          s.id === action.sentenceId ? { ...s, translating: true } : s,
        ),
      };

    case 'SET_TRANSLATION':
      return {
        ...state,
        sentences: state.sentences.map(s =>
          s.id === action.sentenceId
            ? { ...s, translation: action.translation, translating: false }
            : s,
        ),
      };

    case 'SET_DEEPSEEK':
      saveSettings(action.key, action.model);
      return { ...state, deepseek: { key: action.key, model: action.model } };

    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };

    case 'TOGGLE_HISTORY':
      return { ...state, historyOpen: !state.historyOpen };

    case 'ADD_HISTORY': {
      const h = [...state.history];
      h.unshift({ text: action.text, time: Date.now() });
      // dedupe by text
      const seen = new Set<string>();
      const deduped = h.filter(e => {
        if (seen.has(e.text)) return false;
        seen.add(e.text);
        return true;
      });
      saveHistory(deduped);
      return { ...state, history: deduped };
    }

    case 'SET_VOICE':
      return { ...state, voiceName: action.voiceName };

    default:
      return state;
  }
}

const saved = loadSettings();

const initialState: AppState = {
  rawText: '',
  sentences: [],
  playback: {},
  voiceName: '',
  deepseek: { key: saved.key, model: saved.model },
  settingsOpen: false,
  historyOpen: false,
  history: loadHistory(),
};

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
