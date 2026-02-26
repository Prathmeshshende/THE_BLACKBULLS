from typing import Any

from models.schemas import EligibilityRequest
from services import ai_services


class AIService:
    async def extract_symptoms(self, text: str) -> list[str]:
        # TODO: This delegates to ai_services placeholder functions.
        # Replace with a direct LLM client integration when ready.
        return await ai_services.extract_symptoms(text)

    async def classify_risk(self, symptoms: list[str]) -> str:
        # TODO: This delegates to ai_services placeholder functions.
        # Replace with a direct LLM client integration when ready.
        return await ai_services.classify_risk(symptoms)

    async def generate_guidance(self, text: str, symptoms: list[str], risk: str) -> str:
        # TODO: This delegates to ai_services placeholder functions.
        # Replace with a direct LLM client integration when ready.
        return await ai_services.generate_guidance(text, symptoms, risk)

    async def evaluate_eligibility(self, data: EligibilityRequest) -> tuple[bool, list[str], dict[str, Any]]:
        # TODO: Replace these placeholder rules with real scheme-specific logic
        # and/or call policy engines or external government eligibility services.
        reasons: list[str] = []
        benefits: dict[str, Any] = {}

        if data.bpl_card:
            reasons.append("User has a BPL card")

        if data.income <= 250000:
            reasons.append("Income is within threshold")

        if data.age >= 60:
            reasons.append("Senior citizen priority")

        eligible = len(reasons) > 0

        if eligible:
            benefits = {
                "primary_scheme": "Health Support Scheme",
                "estimated_cover": "Up to INR 500,000",
                "state": data.state,
            }

        return eligible, reasons, benefits
