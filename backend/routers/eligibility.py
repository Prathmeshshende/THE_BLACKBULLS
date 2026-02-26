from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import EligibilityRecord, User
from db.session import get_db_session
from models.schemas import EligibilityRequest, EligibilityResponse
from services.auth_service import get_current_user
from services import eligibility_service

router = APIRouter(tags=["eligibility"])


@router.post("/eligibility", response_model=EligibilityResponse)
async def check_eligibility(
    data: EligibilityRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> EligibilityResponse:
    # Keep the route thin: deterministic rule checks live in service layer.
    result = await eligibility_service.check_scheme_eligibility(data)

    record = EligibilityRecord(
        user_id=current_user.id,
        income=data.income,
        age=data.age,
        bpl_card=data.bpl_card,
        state=data.state,
        eligible=bool(result["eligible"]),
    )
    db.add(record)
    await db.commit()

    return EligibilityResponse(**result)
