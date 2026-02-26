from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models_enterprise import ERPStatus


async def sync_hospital(
    db: AsyncSession,
    *,
    user_id: int,
    hospital_name: str,
    scheme_mapping: str,
    slots_available: int,
    api_health_status: str,
) -> ERPStatus:
    row = ERPStatus(
        hospital_name=hospital_name,
        scheme_mapping=scheme_mapping,
        slots_available=slots_available,
        api_health_status=api_health_status,
        synced_by_user_id=user_id,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def get_status(db: AsyncSession, limit: int = 10) -> dict[str, object]:
    rows = await db.scalars(select(ERPStatus).order_by(ERPStatus.synced_at.desc()).limit(limit))
    entries = list(rows)
    if not entries:
        return {
            "api_health": "unknown",
            "hospital_availability": [],
            "last_sync": None,
        }

    latest = entries[0]
    return {
        "api_health": latest.api_health_status,
        "hospital_availability": [
            {
                "hospital_name": item.hospital_name,
                "scheme_mapping": item.scheme_mapping,
                "slots_available": item.slots_available,
                "api_health_status": item.api_health_status,
                "synced_at": item.synced_at,
            }
            for item in entries
        ],
        "last_sync": latest.synced_at,
    }
