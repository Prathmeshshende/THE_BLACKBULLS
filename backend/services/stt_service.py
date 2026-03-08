import asyncio
import os
from io import BytesIO

try:
    from openai import OpenAI
except Exception:  # pragma: no cover - runtime dependency guard
    OpenAI = None


class STTService:
    def __init__(self) -> None:
        self._api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self._model = os.getenv("OPENAI_STT_MODEL", "gpt-4o-mini-transcribe").strip() or "gpt-4o-mini-transcribe"
        self._fallback_enabled = os.getenv("STT_ENABLE_PLACEHOLDER_FALLBACK", "true").strip().lower() == "true"
        self._client = OpenAI(api_key=self._api_key) if OpenAI is not None and self._api_key else None

    def _placeholder_response(self, byte_count: int) -> str:
        return (
            f"TRANSCRIPTION_PLACEHOLDER ({byte_count} bytes received). "
            "Set OPENAI_API_KEY to enable real speech-to-text."
        )

    def _transcribe_sync(self, audio_bytes: bytes, filename: str, language: str | None) -> str:
        if self._client is None:
            if self._fallback_enabled:
                return self._placeholder_response(len(audio_bytes))
            raise RuntimeError("OpenAI STT is not configured. Set OPENAI_API_KEY.")

        audio_file = BytesIO(audio_bytes)
        audio_file.name = filename or "audio.webm"

        kwargs: dict[str, str] = {"model": self._model}
        if language and language in {"en", "hi"}:
            kwargs["language"] = language

        try:
            response = self._client.audio.transcriptions.create(file=audio_file, **kwargs)
        except Exception as error:
            if self._fallback_enabled:
                return self._placeholder_response(len(audio_bytes))
            raise RuntimeError(f"OpenAI STT request failed: {error}") from error

        text = (getattr(response, "text", "") or "").strip()

        if text:
            return text
        if self._fallback_enabled:
            return self._placeholder_response(len(audio_bytes))
        raise RuntimeError("STT provider returned an empty transcript")

    async def transcribe_bytes(self, audio_bytes: bytes, filename: str = "audio.webm", language: str | None = None) -> str:
        byte_count = len(audio_bytes)
        if byte_count == 0:
            return ""

        return await asyncio.to_thread(self._transcribe_sync, audio_bytes, filename, language)

    async def transcribe_stream_chunk(self, audio_chunk: bytes) -> str:
        if not audio_chunk:
            return ""
        return await self.transcribe_bytes(audio_chunk, filename="stream-chunk.webm")
