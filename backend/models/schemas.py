from datetime import datetime

from pydantic import BaseModel, Field


MEDICAL_DISCLAIMER = (
    "This is not a medical diagnosis. Please consult a licensed medical professional."
)


class VoiceTranscriptionResponse(BaseModel):
    transcript: str
    disclaimer: str = MEDICAL_DISCLAIMER


class VoiceTTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field("en", pattern="^(en|hi)$")


class VoiceTTSResponse(BaseModel):
    audio_base64: str
    mime_type: str = "audio/mpeg"
    provider: str = "gtts"


class TriageRequest(BaseModel):
    symptom_text: str = Field(..., min_length=1)
    language: str = Field("en", pattern="^(en|hi)$")


class TriageResponse(BaseModel):
    risk_level: str
    emergency_flag: bool
    advisory_message: str
    disclaimer: str = MEDICAL_DISCLAIMER
    detected_symptoms: list[str]


class EligibilityRequest(BaseModel):
    income: float = Field(..., ge=0)
    age: int = Field(..., ge=0)
    bpl_card: bool = False
    state: str = Field(..., min_length=2)
    family_size: int = Field(1, ge=1)
    has_chronic_illness: bool = False
    has_disability: bool = False
    is_pregnant: bool = False
    rural_resident: bool = False
    annual_hospital_visits: int = Field(0, ge=0)
    has_government_id: bool = True
    occupation: str | None = None


class SchemeDecision(BaseModel):
    scheme_name: str
    eligible: bool
    reason: str
    application_link: str | None = None


class EligibilityResponse(BaseModel):
    eligible: bool
    assessment_summary: str
    score: int
    matched_rules: list[str]
    scheme_decisions: list[SchemeDecision]
    reasons: list[str]
    benefits: dict[str, str]
    required_documents: list[str]
    next_steps: list[str]
    disclaimer: str = MEDICAL_DISCLAIMER


class HospitalSuggestionRequest(BaseModel):
    city: str = Field(..., min_length=2)


class HospitalItem(BaseModel):
    hospital_name: str
    government: bool = True
    scheme_supported: bool = True
    contact_number: str


class HospitalSuggestionResponse(BaseModel):
    city: str
    hospitals: list[HospitalItem]
    disclaimer: str = MEDICAL_DISCLAIMER


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


class StatusResponse(BaseModel):
    session_id: str
    last_interaction: str
    logs: list[str]
    history: list[str]


class InteractionLogResponse(BaseModel):
    id: int
    symptom_text: str
    risk_level: str
    created_at: datetime


class AnalyticsLogsResponse(BaseModel):
    total_interactions: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    total_eligibility_approved: int
