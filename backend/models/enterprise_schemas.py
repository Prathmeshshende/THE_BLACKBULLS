from datetime import datetime

from pydantic import BaseModel, Field


class CRMStoreRequest(BaseModel):
    user_id: int | None = None
    phone: str | None = None
    risk_level: str = Field("LOW", min_length=2)
    sentiment_score: float = Field(0.0, ge=-1, le=1)
    eligibility_status: str = Field("unknown", min_length=2)
    follow_up_status: str = Field("pending", min_length=2)


class CRMRecordResponse(BaseModel):
    id: int
    user_id: int | None
    phone: str | None
    risk_level: str
    sentiment_score: float
    eligibility_status: str
    follow_up_status: str
    created_at: datetime


class CRMFollowUpRequest(BaseModel):
    crm_record_id: int
    follow_up_status: str = Field("completed", min_length=2)


class WhatsAppSummaryRequest(BaseModel):
    phone_number: str = Field(..., min_length=8)
    message_summary: str = Field(..., min_length=3)


class WhatsAppConversationSummaryRequest(BaseModel):
    phone_number: str = Field(..., min_length=8)
    triage_advice: str = Field(..., min_length=3)
    risk_level: str | None = None
    eligibility_summary: str | None = None
    eligible_schemes: list[str] = []
    city: str = Field("Bengaluru", min_length=2)
    preferred_language: str = Field("en", pattern="^(en|hi)$")


class WhatsAppSummaryResponse(BaseModel):
    id: int
    phone_number: str
    delivery_status: str
    provider_reference: str | None = None
    created_at: datetime


class ERPSyncRequest(BaseModel):
    hospital_name: str = Field(..., min_length=2)
    scheme_mapping: str = Field(..., min_length=2)
    slots_available: int = Field(0, ge=0)
    api_health_status: str = Field("healthy", min_length=2)


class ERPStatusResponse(BaseModel):
    id: int
    hospital_name: str
    scheme_mapping: str
    slots_available: int
    api_health_status: str
    synced_at: datetime


class FraudCheckRequest(BaseModel):
    user_id: int | None = None
    phone: str | None = None
    current_income: float = Field(..., ge=0)


class FraudRecordResponse(BaseModel):
    id: int
    user_id: int | None
    phone: str | None
    fraud_probability: float
    flagged: bool
    reason: str
    created_at: datetime


class EscalateCallRequest(BaseModel):
    caller_id: str = Field(..., min_length=2)
    risk_level: str = Field("MEDIUM", min_length=2)
    sentiment_score: float = Field(0.0, ge=-1, le=1)
    call_duration: int = Field(0, ge=0)


class ActiveCallResponse(BaseModel):
    id: int
    caller_id: str
    risk_level: str
    sentiment_score: float
    status: str
    call_duration: int
    created_at: datetime


class SalesConvertRequest(BaseModel):
    user_id: int | None = None
    inquiry_source: str = Field("voice", min_length=2)
    converted: bool = False
    eligibility_approved: bool = False
    follow_up_pending: bool = True


class SalesMetricsResponse(BaseModel):
    total_inquiries: int
    converted_cases: int
    eligibility_approvals: int
    follow_up_pending: int
    conversion_rate: float


class AnalyticsDayPoint(BaseModel):
    day: str
    count: int


class AnalyticsDashboardResponse(BaseModel):
    calls_per_day: list[AnalyticsDayPoint]
    risk_distribution: dict[str, int]
    eligibility_approval_rate: float
    drop_rate: float
    escalation_rate: float
    fraud_cases: int
    conversion_rate: float
