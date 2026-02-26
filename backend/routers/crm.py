from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models_crm import CRMRecord as SimpleCRMRecord
from db.session import get_db_session
from models.crm_schemas import (
    CRMFollowUpSimpleResponse,
    CRMRecordItem,
    CRMStoreSimpleRequest,
    CRMStoreSimpleResponse,
    CRMUserHistoryResponse,
)
from models.enterprise_schemas import CRMFollowUpRequest, CRMRecordResponse, CRMStoreRequest
from services import crm_service
from services.auth_service import get_current_user

router = APIRouter(prefix="/crm", tags=["crm"])


def _to_simple_item(row: SimpleCRMRecord) -> CRMRecordItem:
    return CRMRecordItem(
        id=row.id,
        user_id=row.user_id,
        phone_number=row.phone_number,
        symptom_text=row.symptom_text,
        risk_level=row.risk_level,
        eligibility_status=row.eligibility_status,
        follow_up_status=row.follow_up_status,
        created_at=row.created_at,
    )


@router.post("/store", response_model=CRMStoreSimpleResponse)
async def store_crm_record(
    data: CRMStoreSimpleRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_user),
) -> CRMStoreSimpleResponse:
    # Keep this endpoint beginner-friendly and lightweight:
    # store a single interaction row and return it.
    record = SimpleCRMRecord(
        user_id=data.user_id if data.user_id is not None else current_user.id,
        phone_number=data.phone_number.strip(),
        symptom_text=data.symptom_text.strip(),
        risk_level=data.risk_level.strip(),
        eligibility_status=data.eligibility_status.strip(),
        follow_up_status=data.follow_up_status.strip() or "pending",
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return CRMStoreSimpleResponse(
        success=True,
        message="CRM interaction stored",
        record=_to_simple_item(record),
    )


@router.get("/user/{phone_number}", response_model=CRMUserHistoryResponse)
async def get_crm_by_phone_number(
    phone_number: str,
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> CRMUserHistoryResponse:
    # Return complete interaction history for one phone number.
    stmt = (
        select(SimpleCRMRecord)
        .where(SimpleCRMRecord.phone_number == phone_number.strip())
        .order_by(SimpleCRMRecord.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return CRMUserHistoryResponse(
        success=True,
        message="CRM history fetched",
        phone_number=phone_number,
        records=[_to_simple_item(row) for row in rows],
    )


@router.put("/followup/{id}", response_model=CRMFollowUpSimpleResponse)
async def mark_simple_follow_up_completed(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> CRMFollowUpSimpleResponse:
    # Minimal follow-up workflow: set status to completed.
    result = await db.execute(select(SimpleCRMRecord).where(SimpleCRMRecord.id == id))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="CRM record not found")

    row.follow_up_status = "completed"
    await db.commit()
    await db.refresh(row)

    return CRMFollowUpSimpleResponse(
        success=True,
        message="Follow-up marked as completed",
        record=_to_simple_item(row),
    )


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
