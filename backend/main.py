from datetime import datetime, timezone

from fastapi import FastAPI

from routers import eligibility, status, transcription, triage
from services.ai_service import AIService
from services.stt_service import STTService


class DatabaseClient:
    def __init__(self) -> None:
        self._store: dict[str, dict[str, object]] = {}

    async def log_event(self, session_id: str, message: str) -> None:
        # TODO: Replace this in-memory stub with real DB writes.
        # Example: PostgreSQL, MongoDB, or Firestore for session/audit logs.
        now = datetime.now(timezone.utc).isoformat()
        session = self._store.setdefault(
            session_id,
            {
                "last_interaction": now,
                "logs": [],
                "history": [],
            },
        )
        session["last_interaction"] = now
        session["logs"].append(message)
        session["history"].append(f"{now} - {message}")

    async def get_status(self, session_id: str) -> dict[str, object]:
        # TODO: Replace this in-memory stub with DB reads.
        if session_id not in self._store:
            now = datetime.now(timezone.utc).isoformat()
            self._store[session_id] = {
                "last_interaction": now,
                "logs": ["Session initialized"],
                "history": [f"{now} - Session initialized"],
            }
        return self._store[session_id]


app = FastAPI(title="Healthcare Voice Assistant Backend")

app.state.stt_service = STTService()
app.state.ai_service = AIService()
app.state.db_client = DatabaseClient()


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Healthcare Voice Assistant API is running"}


app.include_router(transcription.router)
app.include_router(triage.router)
app.include_router(eligibility.router)
app.include_router(status.router)
