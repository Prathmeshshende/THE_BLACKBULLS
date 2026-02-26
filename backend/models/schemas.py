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


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    phone: str | None = None
    state: str | None = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProtectedResponse(BaseModel):
    message: str
    user: UserResponse


class HouseholdMember(BaseModel):
    age: int = Field(..., ge=0)
    gender: str = Field(..., min_length=1)


class EligibilityRequest(BaseModel):
    income: float = Field(..., ge=0)
    age: int = Field(..., ge=0)
    state: str = Field(..., min_length=2)
    bpl_card: bool | None = None
    household_type: str = Field(..., min_length=2)
    household_members: list[HouseholdMember] | None = None
    secc_no_adult_16_59: bool = False
    secc_female_headed: bool = False
    secc_disabled_no_caregiver: bool = False
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
