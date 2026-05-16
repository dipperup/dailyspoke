"""
Kokoro-82M Python backend server for DailySpoke.
POST /api/tts  →  {text, voice}  →  audio/wav
GET  /api/tts/health → {"status":"ok"}
"""
import io
import os
import wave
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import torch

# ---- Globals filled during lifespan startup ----
model = None
pipeline_a = None  # American English (af_*, am_* voices)
pipeline_b = None  # British English (bf_*, bm_* voices)
SAMPLE_RATE = 24000


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_model()
    except Exception as e:
        print(f"[tts_server] WARNING: Model failed to load: {e}")
        print("[tts_server] Server will start but TTS will return 503 until model is loaded.")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Voice descriptions for the dropdown (same as before)
VOICE_DESCRIPTIONS = {
    "af_heart": "American female, warm and expressive",
    "af_bella": "American female, melodic tone",
    "af_nicole": "American female, bright and energetic",
    "af_sarah": "American female, soft and gentle",
    "af_sky": "American female, relaxed and conversational",
    "af_jessica": "American female, friendly and clear",
    "af_river": "American female, smooth and natural",
    "af_nova": "American female, vibrant and lively",
    "af_aoede": "American female, lyrical voice",
    "af_kore": "American female, bright voice",
    "af_alloy": "American female, warm tone",
    "bf_emma": "British female, posh English accent",
    "bf_alice": "British female, cheerful and warm",
    "bf_lily": "British female, soft and soothing",
    "bf_isabella": "British female, polished and educated",
    "am_michael": "American male, deep and confident",
    "am_onyx": "American male, warm and approachable",
    "am_puck": "American male, energetic and lively",
    "am_echo": "American male, resonant voice",
    "am_fenrir": "American male, deep tone",
    "am_eric": "American male, clear delivery",
    "am_liam": "American male, friendly voice",
    "am_adam": "American male, natural speech",
    "bm_george": "British male, distinguished and refined",
    "bm_lewis": "British male, friendly and natural",
    "bm_daniel": "British male, authoritative voice",
    "bm_fable": "British male, flowing speech",
}

DEFAULT_VOICE = "af_heart"

# Voice prefix → pipeline mapping
AMERICAN_PREFIXES = ("af_", "am_")
BRITISH_PREFIXES = ("bf_", "bm_")


def get_pipeline(voice_name: str):
    """Select the correct pipeline based on voice prefix."""
    if voice_name.startswith(BRITISH_PREFIXES):
        return pipeline_b
    return pipeline_a


def load_model():
    global model, pipeline_a, pipeline_b

    repo_id = "hexgrad/Kokoro-82M"

    print(f"[tts_server] Loading Kokoro model: {repo_id} ...")

    from kokoro import KPipeline
    from kokoro.model import KModel

    # Use hf-mirror.com for the large model download (1.7GB), blocked by GFW from HF directly
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = KModel(repo_id=repo_id).to(device).eval()
    print(f"[tts_server] KModel loaded on {device}")

    # Remove mirror for voice file downloads (small .pt files, ~500KB, fine from HF)
    os.environ.pop("HF_ENDPOINT", None)

    pipeline_a = KPipeline(lang_code="a", repo_id=repo_id, model=model)
    pipeline_b = KPipeline(lang_code="b", repo_id=repo_id, model=model)
    print("[tts_server] Both pipelines initialized (American + British English)")


def numpy_to_wav(audio: torch.Tensor, sr: int) -> bytes:
    """Convert float32 torch tensor to 16-bit PCM WAV bytes."""
    audio_np = audio.cpu().numpy()
    audio_np = audio_np.clip(-0.95, 0.95)
    audio_int16 = (audio_np * 32767).astype("int16")
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(audio_int16.tobytes())
    buf.seek(0)
    return buf.read()


@app.post("/api/tts")
async def generate_tts(req: dict):
    global model, pipeline_a, pipeline_b

    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    text = (req.get("text") or "").strip()
    voice = req.get("voice") or DEFAULT_VOICE

    if not text:
        raise HTTPException(status_code=400, detail="Text is empty")

    pipeline = get_pipeline(voice)

    try:
        # Generate audio — Kokoro yields generator of Result objects
        gen = pipeline(text, voice=voice, speed=1.0)
        audio_chunks = []
        for result in gen:
            if result.audio is not None:
                audio_chunks.append(result.audio)

        if not audio_chunks:
            raise HTTPException(status_code=500, detail="No audio generated")

        # Concatenate audio chunks
        audio = torch.cat(audio_chunks, dim=0) if len(audio_chunks) > 1 else audio_chunks[0]

        wav_bytes = numpy_to_wav(audio, SAMPLE_RATE)
        return Response(content=wav_bytes, media_type="audio/wav")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[tts_server] Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tts/health")
async def health():
    return {
        "status": "ok" if model is not None else "model_not_loaded",
        "model_loaded": model is not None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
