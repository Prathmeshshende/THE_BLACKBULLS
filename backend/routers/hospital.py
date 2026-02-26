from fastapi import APIRouter

from models.schemas import HospitalSuggestionRequest, HospitalSuggestionResponse
from services import hospital_service

router = APIRouter(prefix="/hospital", tags=["hospital"])


@router.post("/suggest", response_model=HospitalSuggestionResponse)
async def suggest_hospital(data: HospitalSuggestionRequest) -> HospitalSuggestionResponse:
    # Route stays minimal; business logic sits in service layer.
    result = await hospital_service.suggest_hospitals(city=data.city)
    return HospitalSuggestionResponse(**result)
