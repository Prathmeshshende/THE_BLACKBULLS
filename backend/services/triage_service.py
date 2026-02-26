from models.schemas import MEDICAL_DISCLAIMER


HIGH_RISK_KEYWORDS = ["chest pain", "difficulty breathing", "breathing difficulty", "unconscious"]
MEDIUM_RISK_KEYWORDS = ["high fever", "fever 3 days", "fever for 3 days", "severe headache"]
LOW_RISK_KEYWORDS = ["mild cold", "mild fever"]


def _normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())


def extract_symptoms(symptom_text: str) -> list[str]:
    """Extract matched symptom keywords from free text using simple rule matching."""
    normalized = _normalize(symptom_text)
    all_keywords = HIGH_RISK_KEYWORDS + MEDIUM_RISK_KEYWORDS + LOW_RISK_KEYWORDS
    return [keyword for keyword in all_keywords if keyword in normalized]


def detect_emergency(symptom_text: str) -> bool:
    """
    Conservative emergency detection rules.
    Escalate if any emergency pattern is present.
    """
    normalized = _normalize(symptom_text)
    has_chest_pain = "chest pain" in normalized
    has_sweating = "sweating" in normalized or "sweat" in normalized
    has_breathing_issue = "difficulty breathing" in normalized or "breathing difficulty" in normalized
    has_unconscious = "unconscious" in normalized

    return (has_chest_pain and has_sweating) or has_breathing_issue or has_unconscious


def classify_risk(symptom_text: str, detected_symptoms: list[str], emergency_flag: bool) -> str:
    """Classify risk as Low / Medium / High based on symptom patterns."""
    if emergency_flag:
        return "HIGH"

    normalized = _normalize(symptom_text)

    if any(keyword in detected_symptoms for keyword in HIGH_RISK_KEYWORDS):
        return "HIGH"
    if any(keyword in detected_symptoms for keyword in MEDIUM_RISK_KEYWORDS):
        return "MEDIUM"
    if any(keyword in detected_symptoms for keyword in LOW_RISK_KEYWORDS):
        return "LOW"

    if "fever" in normalized or "headache" in normalized:
        return "MEDIUM"
    return "LOW"


def advisory_for_risk(risk_level: str, emergency_flag: bool) -> str:
    """Generate non-diagnostic advisory text for user safety."""
    if emergency_flag or risk_level == "HIGH":
        return (
            "Emergency warning: your symptoms may need immediate medical care. "
            "Please go to the nearest hospital or call emergency services now."
        )
    if risk_level == "MEDIUM":
        return (
            "Your symptoms may need prompt clinical review. "
            "Please consult a doctor within 24 hours and monitor worsening signs."
        )
    return (
        "Current risk appears lower based on provided symptoms. "
        "Please rest, hydrate, and seek care if symptoms worsen."
    )


async def analyze_symptoms(symptom_text: str) -> dict[str, object]:
    """Main async triage entrypoint used by API routes."""
    detected_symptoms = extract_symptoms(symptom_text)
    emergency_flag = detect_emergency(symptom_text)
    risk_level = classify_risk(symptom_text, detected_symptoms, emergency_flag)

    return {
        "risk_level": risk_level,
        "emergency_flag": emergency_flag,
        "advisory_message": advisory_for_risk(risk_level, emergency_flag),
        "disclaimer": MEDICAL_DISCLAIMER,
        "detected_symptoms": detected_symptoms,
    }
