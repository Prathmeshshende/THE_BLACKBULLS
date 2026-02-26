from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from models.enterprise_schemas import FraudCheckRequest, FraudRecordResponse
from services import fraud_service
from services.auth_service import get_current_user

router = APIRouter(prefix="/fraud", tags=["fraud"])


@router.get("/flagged", response_model=list[FraudRecordResponse])
async def flagged(
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> list[FraudRecordResponse]:
    rows = await fraud_service.get_flagged_records(db)
    return [
        FraudRecordResponse(
            id=row.id,
            user_id=row.user_id,
            phone=row.phone,
            fraud_probability=row.fraud_probability,
            flagged=row.flagged,
            reason=row.reason,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.post("/check", response_model=FraudRecordResponse)
async def check(
    data: FraudCheckRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_user),
) -> FraudRecordResponse:
    record = await fraud_service.check_fraud(
        db,
        user_id=data.user_id if data.user_id is not None else current_user.id,
        phone=data.phone,
        current_income=data.current_income,
    )
    return FraudRecordResponse(
        id=record.id,
        user_id=record.user_id,
        phone=record.phone,
        fraud_probability=record.fraud_probability,
        flagged=record.flagged,
        reason=record.reason,
        created_at=record.created_at,
    )
