from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from db.database import init_db
from db import models as _db_models  # noqa: F401
from db import models_enterprise as _db_enterprise_models  # noqa: F401
from routers import analytics, auth, callcenter, crm, eligibility, erp, fraud, hospital, sales, status, triage, voice, whatsapp
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.stt_service = STTService()
app.state.ai_service = AIService()
app.state.db_client = DatabaseClient()


@app.on_event("startup")
async def on_startup() -> None:
    try:
        await init_db()
    except Exception as exc:
        print(f"[startup] Database initialization skipped: {exc}")

BASE_DIR = Path(__file__).resolve().parent


def resolve_frontend_dir() -> Path:
    candidates = [
        BASE_DIR.parent / "frontend" / "p1",
        BASE_DIR.parent / "fontend" / "p1",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


FRONTEND_DIR = resolve_frontend_dir()

if FRONTEND_DIR.exists():
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Healthcare Voice Assistant API Running"}


@app.get("/app", include_in_schema=False)
async def serve_app():
    index_candidates = [FRONTEND_DIR / "index.html", FRONTEND_DIR / "page 1.html"]
    for entry_file in index_candidates:
        if entry_file.exists():
            return FileResponse(entry_file)
    return JSONResponse(
        status_code=404,
        content={"message": "Frontend entry file not found. Expected index.html in frontend/p1."},
    )


app.include_router(voice.router)
app.include_router(triage.router)
app.include_router(eligibility.router)
app.include_router(hospital.router)
app.include_router(status.router)
app.include_router(auth.router)
app.include_router(crm.router)
app.include_router(whatsapp.router)
app.include_router(erp.router)
app.include_router(fraud.router)
app.include_router(callcenter.router)
app.include_router(sales.router)
app.include_router(analytics.router)
