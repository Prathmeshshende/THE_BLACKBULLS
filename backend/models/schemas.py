from typing import Any

from pydantic import BaseModel, Field


class TranscriptionRequest(BaseModel):
    session_id: str = "default-session"


class TranscriptionResponse(BaseModel):
    transcript: str
    session_id: str


class StreamingTranscriptionResponse(BaseModel):
    transcript: str
    is_final: bool = False


class TriageRequest(BaseModel):
    symptom_text: str = Field(..., min_length=1)
    session_id: str = "default-session"


class TriageResponse(BaseModel):
    risk_level: str
    guidance: str


class EligibilityRequest(BaseModel):
    income: float = Field(..., ge=0)
    age: int = Field(..., ge=0)
    state: str = Field(..., min_length=2)
    bpl_card: bool | None = None
    session_id: str = "default-session"


class EligibilityResponse(BaseModel):
    eligible: bool
    reasons: list[str]
    benefits: dict[str, Any]


class StatusResponse(BaseModel):
    session_id: str
    last_interaction: str
    logs: list[str]
    history: list[str]
