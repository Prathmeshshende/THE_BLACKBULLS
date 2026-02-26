from fastapi import APIRouter, File, HTTPException, UploadFile

from models.schemas import VoiceTranscriptionResponse
from services.stt_service import STTService

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
