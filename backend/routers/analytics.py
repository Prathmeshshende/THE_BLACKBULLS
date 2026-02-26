from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models_logging import InteractionLog
from db.session import get_db_session
from models.schemas import AnalyticsLogsResponse
from models.enterprise_schemas import AnalyticsDashboardResponse
from services import analytics_service
from services.auth_service import require_admin

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
async def dashboard(
    db: AsyncSession = Depends(get_db_session),
    _admin_user=Depends(require_admin),
) -> AnalyticsDashboardResponse:
    payload = await analytics_service.get_dashboard_metrics(db)
    return AnalyticsDashboardResponse(**payload)


@router.get("/logs", response_model=AnalyticsLogsResponse)
async def logs_analytics(
    db: AsyncSession = Depends(get_db_session),
    _admin_user=Depends(require_admin),
) -> AnalyticsLogsResponse:
    # Basic counts for lightweight analytics.
    total_interactions = await db.scalar(select(func.count()).select_from(InteractionLog))
    high_risk_count = await db.scalar(
        select(func.count()).select_from(InteractionLog).where(func.lower(InteractionLog.risk_level) == "high")
    )
    medium_risk_count = await db.scalar(
        select(func.count()).select_from(InteractionLog).where(func.lower(InteractionLog.risk_level) == "medium")
    )
    low_risk_count = await db.scalar(
        select(func.count()).select_from(InteractionLog).where(func.lower(InteractionLog.risk_level) == "low")
    )
    total_eligibility_approved = await db.scalar(
        select(func.count())
        .select_from(InteractionLog)
        .where(func.lower(InteractionLog.eligibility_result) == "approved")
    )

    return AnalyticsLogsResponse(
        total_interactions=int(total_interactions or 0),
        high_risk_count=int(high_risk_count or 0),
        medium_risk_count=int(medium_risk_count or 0),
        low_risk_count=int(low_risk_count or 0),
        total_eligibility_approved=int(total_eligibility_approved or 0),
    )
