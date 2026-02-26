import json
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import InteractionLog, User
from db.models_enterprise import CRMRecord


async def store_interaction(
    db: AsyncSession,
    *,
    user_id: int | None,
    phone: str | None,
    risk_level: str,
    sentiment_score: float,
    eligibility_status: str,
    follow_up_status: str,
) -> CRMRecord:
    interaction_id: int | None = None
    if user_id is not None:
        latest_interaction = await db.scalar(
            select(InteractionLog).where(InteractionLog.user_id == user_id).order_by(InteractionLog.created_at.desc()).limit(1)
        )
        if latest_interaction is not None:
            interaction_id = latest_interaction.id

    history = [
        {
            "status": follow_up_status,
            "at": datetime.now(timezone.utc).isoformat(),
            "note": "Initial status",
        }
    ]

    record = CRMRecord(
        user_id=user_id,
        interaction_id=interaction_id,
        phone=phone,
        risk_level=risk_level.upper(),
        sentiment_score=sentiment_score,
        eligibility_status=eligibility_status,
        follow_up_status=follow_up_status,
        follow_up_history=json.dumps(history),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def get_user_crm_records(db: AsyncSession, user_id: int) -> list[CRMRecord]:
    records = await db.scalars(select(CRMRecord).where(CRMRecord.user_id == user_id).order_by(CRMRecord.created_at.desc()))
    return list(records)


async def get_all_users_with_crm(db: AsyncSession) -> list[dict[str, object]]:
    users = await db.scalars(select(User).order_by(User.created_at.desc()))
    payload: list[dict[str, object]] = []
    for user in users:
        latest_crm = await db.scalar(
            select(CRMRecord).where(CRMRecord.user_id == user.id).order_by(CRMRecord.created_at.desc()).limit(1)
        )
        payload.append(
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "state": user.state,
                "latest_follow_up_status": latest_crm.follow_up_status if latest_crm else "none",
            }
        )
    return payload


async def mark_follow_up_completed(db: AsyncSession, crm_record_id: int, follow_up_status: str) -> CRMRecord | None:
    record = await db.get(CRMRecord, crm_record_id)
    if record is None:
        return None

    history = []
    try:
        history = json.loads(record.follow_up_history)
    except Exception:
        history = []

    history.append(
        {
            "status": follow_up_status,
            "at": datetime.now(timezone.utc).isoformat(),
            "note": "Updated by CRM endpoint",
        }
    )

    record.follow_up_status = follow_up_status
    record.follow_up_history = json.dumps(history)
    await db.commit()
    await db.refresh(record)
    return record
