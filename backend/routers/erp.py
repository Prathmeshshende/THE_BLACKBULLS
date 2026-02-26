from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from models.enterprise_schemas import ERPStatusResponse, ERPSyncRequest
from services import erp_service
from services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/erp", tags=["erp"])


@router.get("/status")
async def get_erp_status(
    db: AsyncSession = Depends(get_db_session),
    _admin_user=Depends(require_admin),
) -> dict[str, object]:
    return await erp_service.get_status(db)


@router.post("/sync-hospital", response_model=ERPStatusResponse)
async def sync_hospital(
    data: ERPSyncRequest,
    db: AsyncSession = Depends(get_db_session),
    admin_user=Depends(require_admin),
) -> ERPStatusResponse:
    row = await erp_service.sync_hospital(
        db,
        user_id=admin_user.id,
        hospital_name=data.hospital_name,
        scheme_mapping=data.scheme_mapping,
        slots_available=data.slots_available,
        api_health_status=data.api_health_status,
    )
    return ERPStatusResponse(
        id=row.id,
        hospital_name=row.hospital_name,
        scheme_mapping=row.scheme_mapping,
        slots_available=row.slots_available,
        api_health_status=row.api_health_status,
        synced_at=row.synced_at,
    )
