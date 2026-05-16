# DailySpoke

English speaking practice tool. Paste English text, get IPA phonetic transcription and TTS audio per sentence. Supports loop playback, word-level seek, and translation.

## Version History

### v2.0 — Kokoro Python Backend (2026-05)

- **New**: Kokoro-82M Python backend with CPU inference (~1-2s/sentence)
- **New**: Three-way TTS routing — System, Kokoro Python (best quality), Kokoro Browser (offline)
- **New**: One-click launcher (`start.py` / `start.bat`)
- **Changed**: Voice selector reorganized with clear quality labels
- **Changed**: Frontend proxies `/api` to Python backend on port 8000
- **Fixed**: Switched from kokoro-js WASM (poor quality on Windows) to PyTorch native backend

### v1.0 — Initial Release

- Web Speech API TTS with emotion presets
- Sentence-level playback with word highlighting
- Click-to-seek, loop playback
- IPA transcription via cmu-pronouncing-dictionary
- Translation via MyMemory (free) or DeepSeek API
- History panel, resizable sidebar

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — Apple macOS dark mode styling
- **cmu-pronouncing-dictionary** — ARPABET → IPA conversion
- **Kokoro-82M (PyTorch)** — Python backend TTS
- **kokoro-js (ONNX WASM)** — browser-side offline TTS fallback
- **Web Speech API** (SpeechSynthesis) — system TTS
- **MyMemory / DeepSeek API** — translation
- **FastAPI + Uvicorn** — Python backend server

## Getting Started

```bash
# Install frontend dependencies
npm install

# Install Python backend (requires Python 3.12)
pip install kokoro fastapi uvicorn

# One-click start
python start.py

# Or start separately
npm run dev                          # Terminal 1: frontend
python server/tts_server.py          # Terminal 2: backend
```

> **Note**: The Python backend requires **Python 3.12** (3.14 has dependency compatibility issues). Run `python --version` first. If you only have Python 3.14+, install 3.12 via `winget install Python.Python.3.12`.

## TTS Voice Options

| Group | Engine | Quality | Needs |
|-------|--------|---------|-------|
| System default | Browser SpeechSynthesis | Basic | Nothing |
| **Kokoro (Python)** | Kokoro-82M PyTorch | Best | Python 3.12 + `server/tts_server.py` running |
| Kokoro (Browser) | kokoro-js ONNX WASM | Lower | Model files in `public/models/` |

The Python backend uses the full Kokoro-82M model (no quantization), ~1-2s per sentence on CPU. The browser fallback uses ONNX q8 quantization, which reduces quality but works offline.

## Project Structure

```
src/
├── components/
│   ├── AnalysisPanel.tsx     # Translation + analysis sidebar
│   ├── AudioControls.tsx     # Play / Stop / Loop buttons
│   ├── Header.tsx            # App header with settings gear
│   ├── HistoryPanel.tsx      # Left sidebar with past inputs
│   ├── ProgressBar.tsx       # TTS playback progress indicator
│   ├── SentenceCard.tsx      # Sentence display + controls
│   ├── SentenceList.tsx      # Sentence card list container
│   ├── SentenceText.tsx      # WordSpan layout for a sentence
│   ├── SettingsModal.tsx     # DeepSeek API key + model config
│   ├── TextInput.tsx         # Text area + Process button
│   ├── VoiceSelector.tsx     # Three-way voice dropdown
│   ├── WordMenu.tsx          # Click-to-seek word menu
│   └── WordSpan.tsx          # Single word + IPA display
├── context/
│   └── AppContext.tsx        # Global state via useReducer
├── hooks/
│   ├── useApiTTS.ts          # Python backend TTS hook
│   ├── useKokoroTTS.ts       # Browser ONNX TTS hook
│   ├── useSpeechSynthesis.ts # Browser SpeechSynthesis hook
│   └── useTTS.ts             # TTS router (voice → engine)
├── types/
│   └── index.ts              # TypeScript type definitions
└── utils/
    ├── arpabetToIPA.ts       # ARPABET → IPA converter
    ├── ipaEngine.ts          # IPA lookup engine
    ├── kokoroManager.ts      # Kokoro model + voice cache
    ├── sentenceSplitter.ts   # Sentence + word tokenizer
    └── translate.ts          # MyMemory / DeepSeek translation

server/
└── tts_server.py             # FastAPI Kokoro TTS backend
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
