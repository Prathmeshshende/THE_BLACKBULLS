from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import InteractionLog, User
from db.session import get_db_session
from models.schemas import TriageRequest, TriageResponse
from services.auth_service import get_current_user
from services import logging_service, triage_service

router = APIRouter(tags=["triage"])


@router.post("/triage", response_model=TriageResponse)
async def classify_triage(
    data: TriageRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> TriageResponse:
    # Keep the route thin: business logic stays in services/triage_service.py.
    result = await triage_service.analyze_symptoms(data.symptom_text, data.language)

    interaction = InteractionLog(
        user_id=current_user.id,
        symptom_text=data.symptom_text,
        risk_level=str(result["risk_level"]),
        emergency_flag=bool(result["emergency_flag"]),
    )
    db.add(interaction)
    await db.commit()

    # Basic interaction logging for analytics (separate lightweight table).
    await logging_service.log_interaction(
        db=db,
        phone_number=current_user.phone,
        symptom_text=data.symptom_text,
        risk_level=str(result["risk_level"]),
        eligibility_result="pending",
    )

    return TriageResponse(**result)
