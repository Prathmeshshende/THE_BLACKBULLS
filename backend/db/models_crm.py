from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class CRMRecord(Base):
    __tablename__ = "crm_records_simple"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    phone_number: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    symptom_text: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    eligibility_status: Mapped[str] = mapped_column(String(30), nullable=False)
    follow_up_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
