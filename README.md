# DailySpoke

English speaking practice tool. Paste English text, get IPA phonetic transcription and TTS audio per sentence. Supports loop playback, word-level seek, and translation.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — Apple macOS dark mode styling
- **cmu-pronouncing-dictionary** — ARPABET → IPA conversion
- **Web Speech API** (SpeechSynthesis) — client-side TTS
- **MyMemory / DeepSeek API** — translation
- Pure frontend, no backend

## Getting Started

```bash
npm install
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview production build
```

## Features

- Paste English text, auto-generate IPA for each word
- Per-sentence TTS playback with word-level highlighting
- Click any word to start reading from that position
- Loop playback per sentence
- Emotion presets (neutral, excited, sad, angry, whisper, question)
- Translation via MyMemory (free) or DeepSeek API (configurable)
- Voice selector — pick from available system English voices
- History panel — past inputs saved to localStorage, click to refill
- Resizable sidebar with drag handle

## Project Structure

```
src/
├── components/
│   ├── AudioControls.tsx    # Play / Stop / Loop buttons
│   ├── Header.tsx           # App header with settings gear
│   ├── HistoryPanel.tsx     # Left sidebar with past inputs
│   ├── ProgressBar.tsx      # TTS playback progress indicator
│   ├── SentenceCard.tsx     # Sentence display + controls
│   ├── SentenceList.tsx     # Sentence card list container
│   ├── SentenceText.tsx     # WordSpan layout for a sentence
│   ├── SettingsModal.tsx    # DeepSeek API key + model config
│   ├── TextInput.tsx        # Text area + Process button
│   ├── VoiceSelector.tsx    # System voice dropdown
│   └── WordSpan.tsx         # Single word + IPA display
├── context/
│   └── AppContext.tsx       # Global state via useReducer
├── hooks/
│   └── useSpeechSynthesis.ts  # TTS hook with emotion support
├── types/
│   └── index.ts             # TypeScript type definitions
└── utils/
    ├── arpabetToIPA.ts      # ARPABET → IPA converter
    ├── ipaEngine.ts         # IPA lookup engine
    ├── sentenceSplitter.ts  # Sentence + word tokenizer
    └── translate.ts         # MyMemory / DeepSeek translation
```

## Translation Setup

By default, translation uses the free MyMemory API (no key needed). To use DeepSeek:

1. Click the gear icon in the header
2. Enter your DeepSeek API key
3. Change the model if needed (default: `deepseek-chat`)
4. Click Save

Settings are stored in `localStorage` under `dailyspoke_ds`.

## Design

Apple macOS dark mode color system. All transitions use `ease-in-out` at 200ms. Buttons have subtle scale feedback on hover/active. No pure white text — all gray-scale hierarchy.

- Background: `#0F1117`
- Sidebar/Header: `#1C1C1E`
- Cards/Inputs: `#262629`
- Borders: `#38383C`
- Accent: `#0A84FF`
- Primary button: `#30D158`
- Stop button: `#FF453A`
