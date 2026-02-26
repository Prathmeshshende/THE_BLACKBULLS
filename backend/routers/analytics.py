from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
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
