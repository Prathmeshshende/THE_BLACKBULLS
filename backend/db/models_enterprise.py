from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class CRMRecord(Base):
    __tablename__ = "crm_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    interaction_id: Mapped[int | None] = mapped_column(ForeignKey("interaction_logs.id"), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="LOW")
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    eligibility_status: Mapped[str] = mapped_column(String(30), nullable=False, default="unknown")
    follow_up_status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    follow_up_history: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class WhatsAppLog(Base):
    __tablename__ = "whatsapp_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    phone_number: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    message_summary: Mapped[str] = mapped_column(Text, nullable=False)
    delivery_status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued")
    provider_reference: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ERPStatus(Base):
    __tablename__ = "erp_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hospital_name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    scheme_mapping: Mapped[str] = mapped_column(String(180), nullable=False)
    slots_available: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    api_health_status: Mapped[str] = mapped_column(String(20), nullable=False, default="healthy")
    synced_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    synced_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class FraudRecord(Base):
    __tablename__ = "fraud_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    suspicious_income_pattern: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    repeated_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    fraud_probability: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    flagged: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="No anomaly")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ActiveCall(Base):
    __tablename__ = "active_calls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    caller_id: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="LOW")
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    call_duration: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class SalesRecord(Base):
    __tablename__ = "sales_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    inquiry_source: Mapped[str] = mapped_column(String(80), nullable=False, default="voice")
    converted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    eligibility_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    follow_up_pending: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
