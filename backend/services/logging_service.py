from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models_logging import InteractionLog


async def log_interaction(
    db: AsyncSession,
    phone_number: str | None,
    symptom_text: str,
    risk_level: str,
    eligibility_result: str,
) -> InteractionLog:
    # Create and save one interaction row.
    row = InteractionLog(
        phone_number=phone_number,
        symptom_text=symptom_text,
        risk_level=risk_level,
        eligibility_result=eligibility_result,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def update_or_log_eligibility_result(
    db: AsyncSession,
    phone_number: str | None,
    eligibility_result: str,
) -> InteractionLog:
    # Try to update the latest row for this phone number.
    # If nothing exists, create a minimal row so analytics still capture the result.
    if phone_number:
        result = await db.execute(
            select(InteractionLog)
            .where(InteractionLog.phone_number == phone_number)
            .order_by(desc(InteractionLog.created_at))
            .limit(1)
        )
        row = result.scalar_one_or_none()
        if row is not None:
            row.eligibility_result = eligibility_result
            await db.commit()
            await db.refresh(row)
            return row

    return await log_interaction(
        db=db,
        phone_number=phone_number,
        symptom_text="Eligibility check",
        risk_level="UNKNOWN",
        eligibility_result=eligibility_result,
    )
