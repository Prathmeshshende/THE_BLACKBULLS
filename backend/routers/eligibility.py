from typing import Protocol

from fastapi import APIRouter, Depends, Request

from models.schemas import EligibilityRequest, EligibilityResponse
from services.eligibility_service import (
    evaluate_age_eligibility,
    evaluate_deprivation_criteria,
    evaluate_income_eligibility,
)

router = APIRouter(tags=["eligibility"])

# Database integration note:
# Add `db: AsyncSession = Depends(get_db_session)` in this endpoint when you
# want to persist eligibility outcomes into `EligibilityRecord`.
#
# Example imports:
# from sqlalchemy.ext.asyncio import AsyncSession
# from db.session import get_db_session


class DatabaseClient(Protocol):
    async def log_event(self, session_id: str, message: str) -> None: ...


def get_db_client(request: Request) -> DatabaseClient:
    return request.app.state.db_client


@router.post("/eligibility", response_model=EligibilityResponse)
async def check_eligibility(
    data: EligibilityRequest,
    db_client: DatabaseClient = Depends(get_db_client),
) -> EligibilityResponse:
    # Rule 1: Income-based eligibility.
    income_ok, income_reason = evaluate_income_eligibility(data.income)

    # Rule 2: Senior expansion eligibility (70+ regardless of income).
    age_ok, age_reason = evaluate_age_eligibility(data.age)

    # Rule 3: SECC-style deprivation eligibility.
    deprivation_ok, deprivation_reason = evaluate_deprivation_criteria(
        household_type=data.household_type,
        household_members=data.household_members,
        no_adult_16_59=data.secc_no_adult_16_59,
        female_headed=data.secc_female_headed,
        disabled_no_caregiver=data.secc_disabled_no_caregiver,
    )

    reasons: list[str] = [income_reason, age_reason, deprivation_reason]

    # Additional supporting criterion.
    if data.bpl_card:
        reasons.append("Eligible support: BPL card provided")

    eligible = income_ok or age_ok or deprivation_ok or bool(data.bpl_card)

    benefits: dict[str, object] = {
        "state": data.state,
        "household_type": data.household_type,
        "matched_rules": {
            "income": income_ok,
            "age": age_ok,
            "deprivation": deprivation_ok,
            "bpl_card": bool(data.bpl_card),
        },
    }

    if eligible:
        benefits["primary_scheme"] = "Comprehensive Family Health Scheme"
        benefits["estimated_cover"] = "Up to INR 500,000"
    else:
        benefits["primary_scheme"] = "No matching scheme"
        benefits["estimated_cover"] = "N/A"

    await db_client.log_event(data.session_id, f"Eligibility checked: {eligible}")

    return EligibilityResponse(eligible=eligible, reasons=reasons, benefits=benefits)
