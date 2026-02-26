from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class InteractionLog(Base):
    __tablename__ = "interaction_logs_basic"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    phone_number: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    symptom_text: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    eligibility_result: Mapped[str] = mapped_column(String(40), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
