from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, unique=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    session_logs: Mapped[list["SessionLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    interactions: Mapped[list["InteractionLog"]] = relationship("db.models.InteractionLog", back_populates="user", cascade="all, delete-orphan")
    eligibility_records: Mapped[list["EligibilityRecord"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class SessionLog(Base):
    __tablename__ = "session_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    session_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User | None"] = relationship(back_populates="session_logs")


class InteractionLog(Base):
    __tablename__ = "interaction_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    symptom_text: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    emergency_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User | None"] = relationship("db.models.User", back_populates="interactions")


class EligibilityRecord(Base):
    __tablename__ = "eligibility_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    income: Mapped[float] = mapped_column(Float, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    bpl_card: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    eligible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User | None"] = relationship(back_populates="eligibility_records")


class HospitalData(Base):
    __tablename__ = "hospital_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hospital_name: Mapped[str] = mapped_column(String(180), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    government: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    scheme_supported: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    contact_number: Mapped[str] = mapped_column(String(30), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
