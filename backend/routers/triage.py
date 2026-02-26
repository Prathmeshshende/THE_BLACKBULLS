from typing import Protocol

from fastapi import APIRouter, Depends, Request

from models.schemas import TriageRequest, TriageResponse
from services.ai_service import AIService

router = APIRouter(tags=["triage"])


class DatabaseClient(Protocol):
    async def log_event(self, session_id: str, message: str) -> None: ...


def get_ai_service(request: Request) -> AIService:
    return request.app.state.ai_service


def get_db_client(request: Request) -> DatabaseClient:
    return request.app.state.db_client


@router.post("/triage", response_model=TriageResponse)
async def classify_triage(
    data: TriageRequest,
    ai_service: AIService = Depends(get_ai_service),
    db_client: DatabaseClient = Depends(get_db_client),
) -> TriageResponse:
    # Step 1: Extract clinically relevant symptoms from free-form user text.
    symptoms = await ai_service.extract_symptoms(data.symptom_text)

    # Step 2: Classify the case into Low/Medium/High risk.
    risk_level = await ai_service.classify_risk(symptoms)

    # Step 3: Generate safe guided response based on text + extracted symptoms + risk.
    guidance = await ai_service.generate_guidance(data.symptom_text, symptoms, risk_level)

    await db_client.log_event(
        data.session_id,
        f"Triage completed with risk level: {risk_level}; symptoms: {symptoms}",
    )

    # Structured JSON response for frontend/mobile apps.
    return TriageResponse(risk_level=risk_level, guidance=guidance)
