from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class SessionLog(Base):
    __tablename__ = "session_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), index=True)
    user_prompt: Mapped[str] = mapped_column(Text)
    intent: Mapped[str] = mapped_column(String(40), index=True)
    api_called: Mapped[str] = mapped_column(String(120))
    response_json: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
