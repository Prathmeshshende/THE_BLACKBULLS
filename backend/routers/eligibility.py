from typing import Protocol

from fastapi import APIRouter, Depends, Request

from models.schemas import EligibilityRequest, EligibilityResponse
from services.ai_service import AIService

router = APIRouter(tags=["eligibility"])


class DatabaseClient(Protocol):
    async def log_event(self, session_id: str, message: str) -> None: ...


def get_db_client(request: Request) -> DatabaseClient:
    return request.app.state.db_client


def get_ai_service(request: Request) -> AIService:
    return request.app.state.ai_service


@router.post("/eligibility", response_model=EligibilityResponse)
async def check_eligibility(
    data: EligibilityRequest,
    ai_service: AIService = Depends(get_ai_service),
    db_client: DatabaseClient = Depends(get_db_client),
) -> EligibilityResponse:
    eligible, reasons, benefits = await ai_service.evaluate_eligibility(data)

    await db_client.log_event(data.session_id, f"Eligibility checked: {eligible}")

    return EligibilityResponse(eligible=eligible, reasons=reasons, benefits=benefits)
