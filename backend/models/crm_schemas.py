from datetime import datetime

from pydantic import BaseModel, Field


class CRMStoreSimpleRequest(BaseModel):
    user_id: int | None = None
    phone_number: str = Field(..., min_length=8)
    symptom_text: str = Field(..., min_length=2)
    risk_level: str = Field(..., min_length=2)
    eligibility_status: str = Field(..., min_length=2)
    follow_up_status: str = Field("pending", min_length=2)


class CRMRecordItem(BaseModel):
    id: int
    user_id: int | None
    phone_number: str
    symptom_text: str
    risk_level: str
    eligibility_status: str
    follow_up_status: str
    created_at: datetime


class CRMStoreSimpleResponse(BaseModel):
    success: bool
    message: str
    record: CRMRecordItem


class CRMUserHistoryResponse(BaseModel):
    success: bool
    message: str
    phone_number: str
    records: list[CRMRecordItem]


class CRMFollowUpSimpleResponse(BaseModel):
    success: bool
    message: str
    record: CRMRecordItem
