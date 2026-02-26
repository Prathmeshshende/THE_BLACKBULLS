class STTService:
    async def transcribe_bytes(self, audio_bytes: bytes) -> str:
        # TODO: Integrate with a real speech-to-text provider.
        # Example options:
        # - OpenAI Realtime API
        # - Google Cloud Speech-to-Text
        # Send `audio_bytes` to the provider and return the transcript text.
        byte_count = len(audio_bytes)
        if byte_count == 0:
            return ""
        return (
            f"TRANSCRIPTION_PLACEHOLDER ({byte_count} bytes received). "
            "If this repeats, browser speech recognition fallback will be used."
        )

    async def transcribe_stream_chunk(self, audio_chunk: bytes) -> str:
        # TODO: Integrate streaming chunk transcription.
        # Accumulate chunks and call a streaming STT API, then return partial text.
        _ = audio_chunk
        return "STREAM_TRANSCRIPT_PLACEHOLDER"
