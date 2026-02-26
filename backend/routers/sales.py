from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from models.enterprise_schemas import SalesConvertRequest, SalesMetricsResponse
from services import sales_service
from services.auth_service import get_current_user

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/metrics", response_model=SalesMetricsResponse)
async def metrics(
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> SalesMetricsResponse:
    stats = await sales_service.get_metrics(db)
    return SalesMetricsResponse(**stats)


@router.post("/convert", response_model=SalesMetricsResponse)
async def convert(
    data: SalesConvertRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_user),
) -> SalesMetricsResponse:
    await sales_service.convert_case(
        db,
        user_id=data.user_id if data.user_id is not None else current_user.id,
        inquiry_source=data.inquiry_source,
        converted=data.converted,
        eligibility_approved=data.eligibility_approved,
        follow_up_pending=data.follow_up_pending,
    )
    stats = await sales_service.get_metrics(db)
    return SalesMetricsResponse(**stats)
