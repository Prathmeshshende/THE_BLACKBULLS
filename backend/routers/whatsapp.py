from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from models.enterprise_schemas import (
    WhatsAppConversationSummaryRequest,
    WhatsAppSummaryRequest,
    WhatsAppSummaryResponse,
)
from services import whatsapp_service
from services.auth_service import get_current_user

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


@router.post("/send-summary", response_model=WhatsAppSummaryResponse)
async def send_summary(
    data: WhatsAppSummaryRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_user),
) -> WhatsAppSummaryResponse:
    log = await whatsapp_service.send_summary(
        db,
        user_id=current_user.id,
        phone_number=data.phone_number,
        message_summary=data.message_summary,
    )
    return WhatsAppSummaryResponse(
        id=log.id,
        phone_number=log.phone_number,
        delivery_status=log.delivery_status,
        provider_reference=log.provider_reference,
        created_at=log.created_at,
    )


@router.post("/send-conversation-summary", response_model=WhatsAppSummaryResponse)
async def send_conversation_summary(
    data: WhatsAppConversationSummaryRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_user),
) -> WhatsAppSummaryResponse:
    log = await whatsapp_service.send_conversation_summary(
        db,
        user_id=current_user.id,
        phone_number=data.phone_number,
        triage_advice=data.triage_advice,
        risk_level=data.risk_level,
        eligibility_summary=data.eligibility_summary,
        eligible_schemes=data.eligible_schemes,
        city=data.city,
        preferred_language=data.preferred_language,
    )
    return WhatsAppSummaryResponse(
        id=log.id,
        phone_number=log.phone_number,
        delivery_status=log.delivery_status,
        provider_reference=log.provider_reference,
        created_at=log.created_at,
    )


@router.get("/history", response_model=list[WhatsAppSummaryResponse])
async def history(
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> list[WhatsAppSummaryResponse]:
    rows = await whatsapp_service.get_message_history(db)
    return [
        WhatsAppSummaryResponse(
            id=row.id,
            phone_number=row.phone_number,
            delivery_status=row.delivery_status,
            provider_reference=row.provider_reference,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.get("/status/{log_id}", response_model=WhatsAppSummaryResponse)
async def delivery_status(
    log_id: int,
    db: AsyncSession = Depends(get_db_session),
    _current_user=Depends(get_current_user),
) -> WhatsAppSummaryResponse:
    row = await whatsapp_service.refresh_delivery_status(db, log_id=log_id)
    if row is None:
        raise HTTPException(status_code=404, detail="WhatsApp log not found")

    return WhatsAppSummaryResponse(
        id=row.id,
        phone_number=row.phone_number,
        delivery_status=row.delivery_status,
        provider_reference=row.provider_reference,
        created_at=row.created_at,
    )
