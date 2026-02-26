# Async AI service helper functions for triage workflows.
# Replace placeholder logic with real GPT/LLM API calls.


async def extract_symptoms(text: str) -> list[str]:
    # TODO: Use an LLM prompt to extract structured symptoms from free text.
    # Example output: ["fever", "cough", "fatigue"]
    normalized = text.lower()
    candidates = ["fever", "cough", "headache", "chest pain", "breathless", "fatigue"]
    return [symptom for symptom in candidates if symptom in normalized]


async def classify_risk(symptoms: list[str]) -> str:
    # TODO: Replace these placeholders with LLM-based risk scoring.
    if any(symptom in symptoms for symptom in ["chest pain", "breathless"]):
        return "High"
    if any(symptom in symptoms for symptom in ["fever", "cough", "headache", "fatigue"]):
        return "Medium"
    return "Low"


async def generate_guidance(text: str, symptoms: list[str], risk: str) -> str:
    # TODO: Use an LLM to generate safe, localized, policy-aligned medical guidance.
    # Always include emergency escalation language when risk is high.
    _ = text
    if risk == "High":
        return "Your symptoms may need urgent care. Please seek emergency medical help immediately."
    if risk == "Medium":
        return "Please consult a doctor within 24 hours and monitor your symptoms closely."
    if symptoms:
        return "Your symptoms look mild right now. Rest, hydrate, and monitor for any worsening."
    return "No clear symptoms were detected. If you feel unwell, consult a clinician for proper evaluation."
