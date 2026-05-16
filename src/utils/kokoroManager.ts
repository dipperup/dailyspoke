import type { KokoroTTS } from 'kokoro-js';

let localModelConfigured = false;
let voiceCachePopulated = false;

async function configureLocalModel() {
  if (localModelConfigured) return;
  try {
    const { env } = await import('@huggingface/transformers');
    env.allowLocalModels = true;
    env.allowRemoteModels = false;
    env.localModelPath = '/models/';
    localModelConfigured = true;
    console.log('[kokoroManager] Local model loading configured: /models/');
  } catch { /* config is best-effort */ }
}

async function prepopulateVoiceCache() {
  if (voiceCachePopulated) return;
  try {
    const cache = await caches.open('kokoro-voices');
    const baseUrl = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/';
    const localBase = '/models/onnx-community/Kokoro-82M-v1.0-ONNX/voices/';

    for (const v of KOKORO_VOICES) {
      const cacheUrl = `${baseUrl}${v.id}.bin`;
      const cached = await cache.match(cacheUrl);
      if (cached) continue;

      const response = await fetch(`${localBase}${v.id}.bin`);
      if (response.ok) {
        await cache.put(cacheUrl, response.clone());
        console.log(`[kokoroManager] Cached voice: ${v.id}`);
      }
    }
    voiceCachePopulated = true;
    console.log('[kokoroManager] Voice cache populated from local files');
  } catch (err) {
    console.warn('[kokoroManager] Voice cache prepopulation failed:', err);
  }
}

// ---- Voice naming convention ----

export const KOKORO_VOICE_PREFIX = 'kokoro:';
export const API_VOICE_PREFIX = 'api:';

export function isKokoroVoice(voiceName: string): boolean {
  return voiceName.startsWith(KOKORO_VOICE_PREFIX);
}

export function getKokoroVoiceId(voiceName: string): string {
  return voiceName.slice(KOKORO_VOICE_PREFIX.length);
}

export function isApiVoice(voiceName: string): boolean {
  return voiceName.startsWith(API_VOICE_PREFIX);
}

export function getApiVoiceId(voiceName: string): string {
  return voiceName.slice(API_VOICE_PREFIX.length);
}

// ---- Voice list ----

export interface KokoroVoiceInfo {
  id: string;
  label: string;
  quality: string;
}

export const KOKORO_VOICES: KokoroVoiceInfo[] = [
  { id: 'af_heart', label: 'Heart (US Female)', quality: 'A' },
  { id: 'af_bella', label: 'Bella (US Female)', quality: 'A−' },
  { id: 'af_nicole', label: 'Nicole (US Female)', quality: 'B−' },
  { id: 'af_sarah', label: 'Sarah (US Female)', quality: 'C+' },
  { id: 'af_sky', label: 'Sky (US Female)', quality: 'C−' },
  { id: 'bf_emma', label: 'Emma (UK Female)', quality: 'A' },
  { id: 'bf_alice', label: 'Alice (UK Female)', quality: 'A−' },
  { id: 'bf_lily', label: 'Lily (UK Female)', quality: 'B' },
  { id: 'bf_isabella', label: 'Isabella (UK Female)', quality: 'B' },
  { id: 'am_michael', label: 'Michael (US Male)', quality: 'C+' },
  { id: 'am_onyx', label: 'Onyx (US Male)', quality: 'D' },
  { id: 'am_puck', label: 'Puck (US Male)', quality: 'C+' },
  { id: 'bm_george', label: 'George (UK Male)', quality: 'B' },
  { id: 'bm_lewis', label: 'Lewis (UK Male)', quality: 'C+' },
];

// ---- KokoroTTS singleton ----

let instancePromise: Promise<KokoroTTS> | null = null;
let instance: KokoroTTS | null = null;
let loadError: Error | null = null;
let loading = false;

export function getKokoroError(): Error | null { return loadError; }
export function isKokoroReady(): boolean { return instance !== null; }
export function isKokoroLoading(): boolean { return loading; }

export function resetKokoroError(): void {
  loadError = null;
  instancePromise = null;
}

export async function getKokoroInstance(): Promise<KokoroTTS> {
  if (instance) return instance;
  if (instancePromise) return instancePromise;
  // Allow retry — clear previous error
  if (loadError) {
    console.log('[kokoroManager] retrying after previous error:', loadError.message);
    loadError = null;
  }

  loading = true;
  instancePromise = (async () => {
    try {
      await configureLocalModel();
      const { KokoroTTS: KTTS } = await import('kokoro-js');
      const device = 'wasm';
      const [tts] = await Promise.all([
        KTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device }),
        prepopulateVoiceCache(),
      ]);
      instance = tts;
      loading = false;
      console.log('[kokoroManager] model loaded from local, device:', device);
      return instance;
    } catch (err) {
      loading = false;
      loadError = err as Error;
      instancePromise = null;
      console.error('[kokoroManager] failed to load model:', err);
      throw err;
    }
  })();

  return instancePromise;
}

// ---- AudioContext singleton ----

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ---- AudioBuffer cache ----

const audioCache = new Map<string, AudioBuffer>();

export function getCachedAudio(key: string): AudioBuffer | null {
  return audioCache.get(key) ?? null;
}

export function setCachedAudio(key: string, buffer: AudioBuffer): void {
  audioCache.set(key, buffer);
}

// ---- Cross-provider cancellation ----

const activeSources = new Set<AudioBufferSourceNode>();

export function registerActiveSource(source: AudioBufferSourceNode): void {
  activeSources.add(source);
}

export function unregisterActiveSource(source: AudioBufferSourceNode): void {
  activeSources.delete(source);
}

export function cancelAllTTS(): void {
  try { window.speechSynthesis.cancel(); } catch { /* ok */ }
  for (const source of activeSources) {
    try { source.stop(); } catch { /* already stopped */ }
  }
  activeSources.clear();
}
