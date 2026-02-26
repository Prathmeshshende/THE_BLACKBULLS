from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from models.enterprise_schemas import CRMFollowUpRequest, CRMRecordResponse, CRMStoreRequest
from services import crm_service
from services.auth_service import get_current_user

router = APIRouter(prefix="/crm", tags=["crm"])


@router.post("/store-interaction", response_model=CRMRecordResponse)
async def store_interaction(
    data: CRMStoreRequest,
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> CRMRecordResponse:
    record = await crm_service.store_interaction(
        db,
        user_id=data.user_id,
        phone=data.phone,
        risk_level=data.risk_level,
        sentiment_score=data.sentiment_score,
        eligibility_status=data.eligibility_status,
        follow_up_status=data.follow_up_status,
    )
    return CRMRecordResponse(
        id=record.id,
        user_id=record.user_id,
        phone=record.phone,
        risk_level=record.risk_level,
        sentiment_score=record.sentiment_score,
        eligibility_status=record.eligibility_status,
        follow_up_status=record.follow_up_status,
        created_at=record.created_at,
    )


@router.get("/user/{id}", response_model=list[CRMRecordResponse])
async def get_user_records(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> list[CRMRecordResponse]:
    rows = await crm_service.get_user_crm_records(db, id)
    return [
        CRMRecordResponse(
            id=row.id,
            user_id=row.user_id,
            phone=row.phone,
            risk_level=row.risk_level,
            sentiment_score=row.sentiment_score,
            eligibility_status=row.eligibility_status,
            follow_up_status=row.follow_up_status,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.get("/all-users")
async def get_all_users(
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> list[dict[str, object]]:
    return await crm_service.get_all_users_with_crm(db)


@router.post("/mark-follow-up", response_model=CRMRecordResponse)
async def mark_follow_up(
    data: CRMFollowUpRequest,
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> CRMRecordResponse:
    record = await crm_service.mark_follow_up_completed(db, data.crm_record_id, data.follow_up_status)
    if record is None:
        raise HTTPException(status_code=404, detail="CRM record not found")
    return CRMRecordResponse(
        id=record.id,
        user_id=record.user_id,
        phone=record.phone,
        risk_level=record.risk_level,
        sentiment_score=record.sentiment_score,
        eligibility_status=record.eligibility_status,
        follow_up_status=record.follow_up_status,
        created_at=record.created_at,
    )
