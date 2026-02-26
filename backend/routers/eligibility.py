from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import EligibilityRecord, User
from db.session import get_db_session
from models.schemas import EligibilityRequest, EligibilityResponse
from services.auth_service import get_current_user
from services import eligibility_service, logging_service

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

    # Keep logging simple: mark latest interaction eligibility as approved/rejected.
    await logging_service.update_or_log_eligibility_result(
        db=db,
        phone_number=current_user.phone,
        eligibility_result="approved" if bool(result["eligible"]) else "rejected",
    )

    return EligibilityResponse(**result)
