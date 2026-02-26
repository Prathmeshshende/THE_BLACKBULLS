from typing import Protocol

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, WebSocket

from models.schemas import StreamingTranscriptionResponse, TranscriptionResponse
from services.stt_service import STTService

router = APIRouter(tags=["transcription"])

# Database integration note:
# Add `db: AsyncSession = Depends(get_db_session)` in `/transcribe` when you
# want to store transcript rows in PostgreSQL.
#
# Example imports:
# from sqlalchemy.ext.asyncio import AsyncSession
# from db.session import get_db_session
#
# Then persist transcript/log rows via SQLAlchemy models in `db/models.py`.


class DatabaseClient(Protocol):
    async def log_event(self, session_id: str, message: str) -> None: ...


def get_stt_service(request: Request) -> STTService:
    return request.app.state.stt_service


def get_db_client(request: Request) -> DatabaseClient:
    return request.app.state.db_client


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    stt_service: STTService = Depends(get_stt_service),
    db_client: DatabaseClient = Depends(get_db_client),
) -> TranscriptionResponse:
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty")

    transcript = await stt_service.transcribe_bytes(audio_bytes)
    session_id = "default-session"
    await db_client.log_event(session_id, f"File transcription completed for {file.filename}")

    return TranscriptionResponse(transcript=transcript, session_id=session_id)


@router.websocket("/ws-transcribe")
async def ws_transcribe(websocket: WebSocket) -> None:
    await websocket.accept()
    stt_service: STTService = websocket.app.state.stt_service
    db_client: DatabaseClient = websocket.app.state.db_client
    session_id = "default-session"

    await db_client.log_event(session_id, "WebSocket transcription session started")

    try:
        while True:
            audio_chunk = await websocket.receive_bytes()
            transcript = await stt_service.transcribe_stream_chunk(audio_chunk)

            payload = StreamingTranscriptionResponse(transcript=transcript, is_final=False)
            await websocket.send_json(payload.model_dump())
    except Exception:
        await db_client.log_event(session_id, "WebSocket transcription session ended")
