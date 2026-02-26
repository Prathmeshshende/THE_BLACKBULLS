from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import EligibilityRecord, InteractionLog
from db.models_enterprise import ActiveCall, FraudRecord, SalesRecord


async def get_dashboard_metrics(db: AsyncSession) -> dict[str, object]:
    rows = await db.execute(
        select(func.date(InteractionLog.created_at), func.count(InteractionLog.id))
        .group_by(func.date(InteractionLog.created_at))
        .order_by(func.date(InteractionLog.created_at))
    )
    calls_per_day = [{"day": str(day), "count": int(count)} for day, count in rows.all() if day is not None]

    risk_distribution = {
        "LOW": int(await db.scalar(select(func.count(InteractionLog.id)).where(InteractionLog.risk_level == "LOW")) or 0),
        "MEDIUM": int(
            await db.scalar(select(func.count(InteractionLog.id)).where(InteractionLog.risk_level == "MEDIUM")) or 0
        ),
        "HIGH": int(await db.scalar(select(func.count(InteractionLog.id)).where(InteractionLog.risk_level == "HIGH")) or 0),
    }

    eligibility_total = int(await db.scalar(select(func.count(EligibilityRecord.id))) or 0)
    eligibility_approved = int(
        await db.scalar(select(func.count(EligibilityRecord.id)).where(EligibilityRecord.eligible.is_(True))) or 0
    )
    eligibility_approval_rate = round((eligibility_approved / eligibility_total) * 100, 2) if eligibility_total else 0.0

    total_calls = int(await db.scalar(select(func.count(ActiveCall.id))) or 0)
    escalated_calls = int(await db.scalar(select(func.count(ActiveCall.id)).where(ActiveCall.status == "escalated")) or 0)
    resolved_calls = int(await db.scalar(select(func.count(ActiveCall.id)).where(ActiveCall.status == "resolved")) or 0)
    abandoned_calls = max(0, total_calls - resolved_calls - escalated_calls)

    drop_rate = round((abandoned_calls / total_calls) * 100, 2) if total_calls else 0.0
    escalation_rate = round((escalated_calls / total_calls) * 100, 2) if total_calls else 0.0

    fraud_cases = int(await db.scalar(select(func.count(FraudRecord.id)).where(FraudRecord.flagged.is_(True))) or 0)

    sales_total = int(await db.scalar(select(func.count(SalesRecord.id))) or 0)
    sales_converted = int(await db.scalar(select(func.count(SalesRecord.id)).where(SalesRecord.converted.is_(True))) or 0)
    conversion_rate = round((sales_converted / sales_total) * 100, 2) if sales_total else 0.0

    return {
        "calls_per_day": calls_per_day,
        "risk_distribution": risk_distribution,
        "eligibility_approval_rate": eligibility_approval_rate,
        "drop_rate": drop_rate,
        "escalation_rate": escalation_rate,
        "fraud_cases": fraud_cases,
        "conversion_rate": conversion_rate,
    }
