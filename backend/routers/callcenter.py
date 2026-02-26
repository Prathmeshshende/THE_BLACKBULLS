from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from models.enterprise_schemas import ActiveCallResponse, EscalateCallRequest
from services import callcenter_service
from services.auth_service import get_current_user

router = APIRouter(prefix="/callcenter", tags=["callcenter"])


@router.get("/active-calls", response_model=list[ActiveCallResponse])
async def active_calls(
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> list[ActiveCallResponse]:
    rows = await callcenter_service.get_active_calls(db)
    return [
        ActiveCallResponse(
            id=row.id,
            caller_id=row.caller_id,
            risk_level=row.risk_level,
            sentiment_score=row.sentiment_score,
            status=row.status,
            call_duration=row.call_duration,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.post("/escalate", response_model=ActiveCallResponse)
async def escalate(
    data: EscalateCallRequest,
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> ActiveCallResponse:
    row = await callcenter_service.escalate_call(
        db,
        caller_id=data.caller_id,
        risk_level=data.risk_level,
        sentiment_score=data.sentiment_score,
        call_duration=data.call_duration,
    )
    return ActiveCallResponse(
        id=row.id,
        caller_id=row.caller_id,
        risk_level=row.risk_level,
        sentiment_score=row.sentiment_score,
        status=row.status,
        call_duration=row.call_duration,
        created_at=row.created_at,
    )
