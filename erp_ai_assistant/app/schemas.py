from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class IntentType(str, Enum):
    beds = "beds"
    claim = "claim"
    slots = "slots"
    records = "records"
    unknown = "unknown"


class AssistantQueryRequest(BaseModel):
    session_id: str = Field(..., min_length=3)
    prompt: str = Field(..., min_length=2)


class AssistantQueryResponse(BaseModel):
    session_id: str
    intent: IntentType
    success: bool
    source: str
    message: str
    data: dict[str, Any] = {}


class BedAvailabilityResponse(BaseModel):
    department: str
    available: int
    total: int
    updated_at: datetime


class ClaimStatusResponse(BaseModel):
    claim_id: str
    status: str
    approved_amount: float | None = None
    updated_at: datetime


class AppointmentSlot(BaseModel):
    doctor: str
    start_time: datetime
    end_time: datetime
    available: bool


class AppointmentSlotsResponse(BaseModel):
    doctor: str
    date: str
    slots: list[AppointmentSlot]


class PatientRecordResponse(BaseModel):
    patient_id: str
    demographics: dict[str, Any]
    allergies: list[str]
    medications: list[str]
    diagnoses: list[str]


class ErrorResponse(BaseModel):
    detail: str
