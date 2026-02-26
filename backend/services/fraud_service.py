from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import EligibilityRecord
from db.models_enterprise import FraudRecord


def _calculate_fraud_probability(repeated_attempts: int, suspicious_income_pattern: bool) -> float:
    probability = min(100.0, repeated_attempts * 18.0)
    if suspicious_income_pattern:
        probability = min(100.0, probability + 35.0)
    return round(probability, 2)


async def check_fraud(db: AsyncSession, *, user_id: int | None, phone: str | None, current_income: float) -> FraudRecord:
    repeated_attempts = 0
    suspicious_income_pattern = False

    if user_id is not None:
        day_start = datetime.now(timezone.utc) - timedelta(days=1)
        attempts_today = await db.scalars(
            select(EligibilityRecord).where(EligibilityRecord.user_id == user_id, EligibilityRecord.created_at >= day_start)
        )
        attempts_list = list(attempts_today)
        repeated_attempts = len(attempts_list)

        recent_attempts = await db.scalars(
            select(EligibilityRecord)
            .where(EligibilityRecord.user_id == user_id)
            .order_by(EligibilityRecord.created_at.desc())
            .limit(5)
        )
        incomes = [record.income for record in list(recent_attempts)]
        incomes.append(current_income)
        if incomes:
            suspicious_income_pattern = max(incomes) - min(incomes) > 400000

    fraud_probability = _calculate_fraud_probability(repeated_attempts, suspicious_income_pattern)
    flagged = repeated_attempts > 3 or suspicious_income_pattern or fraud_probability >= 60

    reason_parts: list[str] = []
    if repeated_attempts > 3:
        reason_parts.append("Repeated eligibility attempts above daily threshold")
    if suspicious_income_pattern:
        reason_parts.append("Suspicious income variance across attempts")
    if not reason_parts:
        reason_parts.append("No major anomaly detected")

    record = FraudRecord(
        user_id=user_id,
        phone=phone,
        suspicious_income_pattern=suspicious_income_pattern,
        repeated_attempts=repeated_attempts,
        fraud_probability=fraud_probability,
        flagged=flagged,
        reason="; ".join(reason_parts),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def get_flagged_records(db: AsyncSession, limit: int = 100) -> list[FraudRecord]:
    rows = await db.scalars(
        select(FraudRecord).where(FraudRecord.flagged.is_(True)).order_by(FraudRecord.created_at.desc()).limit(limit)
    )
    return list(rows)
