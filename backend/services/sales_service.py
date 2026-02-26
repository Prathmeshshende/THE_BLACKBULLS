from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models_enterprise import SalesRecord


async def convert_case(
    db: AsyncSession,
    *,
    user_id: int | None,
    inquiry_source: str,
    converted: bool,
    eligibility_approved: bool,
    follow_up_pending: bool,
) -> SalesRecord:
    row = SalesRecord(
        user_id=user_id,
        inquiry_source=inquiry_source,
        converted=converted,
        eligibility_approved=eligibility_approved,
        follow_up_pending=follow_up_pending,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def get_metrics(db: AsyncSession) -> dict[str, float | int]:
    total_inquiries = int(await db.scalar(select(func.count(SalesRecord.id))) or 0)
    converted_cases = int(await db.scalar(select(func.count(SalesRecord.id)).where(SalesRecord.converted.is_(True))) or 0)
    eligibility_approvals = int(
        await db.scalar(select(func.count(SalesRecord.id)).where(SalesRecord.eligibility_approved.is_(True))) or 0
    )
    follow_up_pending = int(
        await db.scalar(select(func.count(SalesRecord.id)).where(SalesRecord.follow_up_pending.is_(True))) or 0
    )

    conversion_rate = round((converted_cases / total_inquiries) * 100, 2) if total_inquiries else 0.0
    return {
        "total_inquiries": total_inquiries,
        "converted_cases": converted_cases,
        "eligibility_approvals": eligibility_approvals,
        "follow_up_pending": follow_up_pending,
        "conversion_rate": conversion_rate,
    }
