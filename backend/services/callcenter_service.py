from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models_enterprise import ActiveCall


async def get_active_calls(db: AsyncSession) -> list[ActiveCall]:
    rows = await db.scalars(select(ActiveCall).order_by(ActiveCall.created_at.desc()).limit(100))
    return list(rows)


async def escalate_call(
    db: AsyncSession,
    *,
    caller_id: str,
    risk_level: str,
    sentiment_score: float,
    call_duration: int,
) -> ActiveCall:
    existing = await db.scalar(
        select(ActiveCall).where(ActiveCall.caller_id == caller_id, ActiveCall.status == "active").limit(1)
    )

    if existing is None:
        existing = ActiveCall(
            caller_id=caller_id,
            risk_level=risk_level.upper(),
            sentiment_score=sentiment_score,
            call_duration=call_duration,
            status="escalated",
        )
        db.add(existing)
    else:
        existing.risk_level = risk_level.upper()
        existing.sentiment_score = sentiment_score
        existing.call_duration = call_duration
        existing.status = "escalated"

    await db.commit()
    await db.refresh(existing)
    return existing
