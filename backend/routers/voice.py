import base64
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile

from models.schemas import VoiceTranscriptionResponse, VoiceTTSRequest, VoiceTTSResponse
from services.stt_service import STTService

try:
    from gtts import gTTS
except Exception:  # pragma: no cover - runtime dependency guard
    gTTS = None

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe", response_model=VoiceTranscriptionResponse)
async def transcribe_voice(file: UploadFile = File(...)) -> VoiceTranscriptionResponse:
    # Read uploaded audio bytes from the request.
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty")

    # MVP placeholder: a real STT provider can be integrated later.
    stt_service = STTService()
    transcript = await stt_service.transcribe_bytes(audio_bytes)

    # Return only safe non-diagnostic text response.
    return VoiceTranscriptionResponse(transcript=transcript)


@router.post("/tts", response_model=VoiceTTSResponse)
async def generate_tts(data: VoiceTTSRequest) -> VoiceTTSResponse:
    if gTTS is None:
        raise HTTPException(status_code=503, detail="Cloud TTS dependency is not installed")

    text = data.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    tts_language = "hi" if data.language == "hi" else "en"

    try:
        mp3_buffer = BytesIO()
        tts = gTTS(text=text, lang=tts_language, slow=False)
        tts.write_to_fp(mp3_buffer)
        encoded = base64.b64encode(mp3_buffer.getvalue()).decode("utf-8")
        return VoiceTTSResponse(audio_base64=encoded, mime_type="audio/mpeg", provider="gtts")
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Cloud TTS failed: {str(error)}") from error
