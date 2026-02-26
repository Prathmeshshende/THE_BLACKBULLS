import re

from models.schemas import MEDICAL_DISCLAIMER

HINDI_MEDICAL_DISCLAIMER = "यह चिकित्सीय निदान नहीं है। कृपया लाइसेंसधारी चिकित्सा विशेषज्ञ से परामर्श करें।"


HIGH_RISK_KEYWORDS = ["chest pain", "difficulty breathing", "breathing difficulty", "unconscious"]
MEDIUM_RISK_KEYWORDS = ["high fever", "fever 3 days", "fever for 3 days", "severe headache"]
LOW_RISK_KEYWORDS = ["mild cold", "mild fever"]


def _normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())


def extract_temperature_fahrenheit(symptom_text: str) -> float | None:
    """Extract temperature from free text and normalize to Fahrenheit."""
    normalized = _normalize(symptom_text)

    explicit_matches = re.findall(r"(\d{2,3}(?:\.\d+)?)\s*°?\s*([fc])\b", normalized)
    for value_str, unit in explicit_matches:
        value = float(value_str)
        if unit == "f":
            return value
        return (value * 9 / 5) + 32

    degree_match = re.search(r"(\d{2,3}(?:\.\d+)?)\s*(?:degrees?|degree|deg)", normalized)
    if degree_match:
        value = float(degree_match.group(1))
        if 85 <= value <= 115:
            return value
        if 30 <= value <= 47:
            return (value * 9 / 5) + 32

    fever_number_match = re.search(r"fever[^0-9]{0,12}(\d{2,3}(?:\.\d+)?)", normalized)
    if fever_number_match:
        value = float(fever_number_match.group(1))
        if 85 <= value <= 115:
            return value
        if 30 <= value <= 47:
            return (value * 9 / 5) + 32

    return None


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
    temperature_f = extract_temperature_fahrenheit(symptom_text)
    has_very_high_fever = temperature_f is not None and temperature_f >= 104.0

    return (has_chest_pain and has_sweating) or has_breathing_issue or has_unconscious or has_very_high_fever


def classify_risk(symptom_text: str, detected_symptoms: list[str], emergency_flag: bool) -> str:
    """Classify risk as Low / Medium / High based on symptom patterns."""
    if emergency_flag:
        return "HIGH"

    normalized = _normalize(symptom_text)
    temperature_f = extract_temperature_fahrenheit(symptom_text)

    if temperature_f is not None:
        if temperature_f >= 104.0:
            return "HIGH"
        if temperature_f >= 102.0:
            return "MEDIUM"

    if any(keyword in detected_symptoms for keyword in HIGH_RISK_KEYWORDS):
        return "HIGH"
    if any(keyword in detected_symptoms for keyword in MEDIUM_RISK_KEYWORDS):
        return "MEDIUM"
    if any(keyword in detected_symptoms for keyword in LOW_RISK_KEYWORDS):
        return "LOW"

    if "fever" in normalized or "headache" in normalized:
        return "MEDIUM"
    return "LOW"


def advisory_for_risk(
    risk_level: str,
    emergency_flag: bool,
    symptom_text: str,
    detected_symptoms: list[str],
    language: str = "en",
) -> str:
    """Generate non-diagnostic advisory text for user safety."""
    temperature_f = extract_temperature_fahrenheit(symptom_text)
    normalized = _normalize(symptom_text)
    symptom_note = ", ".join(detected_symptoms) if detected_symptoms else "no mapped keyword symptoms"

    why_risk_points: list[str] = []
    if temperature_f is not None:
        why_risk_points.append(f"reported temperature ≈ {temperature_f:.1f}°F")
        if temperature_f >= 104:
            why_risk_points.append("very high fever threshold reached (≥104°F)")
        elif temperature_f >= 102:
            why_risk_points.append("high fever range present (≥102°F)")

    if "chest pain" in normalized:
        why_risk_points.append("chest pain reported")
    if "difficulty breathing" in normalized or "breathing difficulty" in normalized:
        why_risk_points.append("breathing difficulty reported")
    if "unconscious" in normalized:
        why_risk_points.append("altered consciousness reported")
    if "headache" in normalized:
        why_risk_points.append("headache reported")

    if not why_risk_points:
        why_risk_points.append("risk estimated from current symptom pattern")

    specific_actions: list[str] = []
    if temperature_f is not None:
        specific_actions.append("Recheck temperature every 4 hours and maintain hydration.")
    if "chest pain" in normalized:
        specific_actions.append("Avoid exertion and keep the person seated upright while arranging urgent evaluation.")
    if "difficulty breathing" in normalized or "breathing difficulty" in normalized:
        specific_actions.append("Keep airway clear, loosen tight clothing, and seek emergency care immediately.")
    if "headache" in normalized:
        specific_actions.append("Rest in a quiet, dark room and monitor for neck stiffness, confusion, or repeated vomiting.")
    if "mild cold" in normalized or "cold" in normalized:
        specific_actions.append("Use warm fluids, steam inhalation, and rest; avoid unnecessary antibiotics.")

    if not specific_actions:
        specific_actions.append("Continue symptom tracking and avoid delayed consultation if symptoms worsen.")

    action_note = " ".join(specific_actions)
    why_note = "; ".join(why_risk_points)

    if language == "hi":
      if emergency_flag or risk_level == "HIGH":
          return (
              "स्थिति: आपके लक्षण इस समय उच्च जोखिम (HIGH risk) दिखाते हैं और यह गंभीर अवस्था हो सकती है। "
              f"जोखिम का कारण: {why_note}. पहचाने गए लक्षण: {symptom_note}. "
              "अभी क्या करें (अगले 0-2 घंटे): तुरंत नजदीकी आपातकालीन विभाग जाएं। "
              "यदि सुरक्षित रूप से जाना संभव न हो तो तुरंत इमरजेंसी सेवा को कॉल करें। "
              f"तुरंत देखभाल के कदम: {action_note} "
              "यदि भ्रम, सांस लेने में अधिक तकलीफ, लगातार उल्टी, छाती में दर्द, पेशाब कम होना, या अत्यधिक सुस्ती हो तो तुरंत आपातकालीन सहायता लें।"
          )
      if risk_level == "MEDIUM":
          return (
              "स्थिति: आपके लक्षण मध्यम जोखिम (MODERATE risk) दिखाते हैं और समय पर डॉक्टर की सलाह जरूरी है। "
              f"जोखिम का कारण: {why_note}. पहचाने गए लक्षण: {symptom_note}. "
              "अभी क्या करें (अगले 12-24 घंटे): डॉक्टर से परामर्श की व्यवस्था करें और तब तक घर पर निगरानी रखें। "
              f"घर पर देखभाल के कदम: {action_note} "
              "यदि बुखार और बढ़े, सांस खराब हो, छाती में दर्द शुरू हो, भ्रम हो, या उल्टी जारी रहे तो तुरंत आपातकालीन देखभाल लें।"
          )
      return (
          "स्थिति: इस समय उपलब्ध जानकारी के आधार पर तुरंत जोखिम अपेक्षाकृत कम (LOW risk) दिख रहा है। "
          f"जोखिम का कारण: {why_note}. पहचाने गए लक्षण: {symptom_note}. "
          "अभी क्या करें (अगले 24-48 घंटे): आराम करें, पानी पर्याप्त लें, और लक्षणों की निगरानी जारी रखें। "
          f"घर पर देखभाल के कदम: {action_note} "
          "यदि 48 घंटे से अधिक लक्षण बने रहें या कोई गंभीर चेतावनी लक्षण पहले दिखे तो डॉक्टर से तुरंत मिलें।"
      )

    if emergency_flag or risk_level == "HIGH":
        return (
            "What is happening: your symptom pattern is currently classified as HIGH risk and may represent an acute condition. "
            f"Why this risk: {why_note}. Detected symptoms: {symptom_note}. "
            "What to do now (next 0-2 hours): go to the nearest emergency department immediately. "
            "If safe transport is not possible, call emergency services right away. "
            f"Immediate care steps: {action_note} "
            "Escalate immediately if there is confusion, breathing distress, persistent vomiting, chest pain, reduced urine output, or drowsiness."
        )
    if risk_level == "MEDIUM":
        return (
            "What is happening: your symptoms suggest a MODERATE risk condition that needs timely medical review. "
            f"Why this risk: {why_note}. Detected symptoms: {symptom_note}. "
            "What to do now (next 12-24 hours): arrange a doctor consultation and continue monitoring at home meanwhile. "
            f"Home-care steps: {action_note} "
            "Escalate to emergency care immediately if fever rises further, breathing worsens, chest pain appears, confusion starts, or vomiting persists."
        )
    return (
        "What is happening: current inputs indicate a LOWER immediate risk pattern at this moment. "
        f"Why this risk: {why_note}. Detected symptoms: {symptom_note}. "
        "What to do now (next 24-48 hours): continue rest, hydration, and symptom tracking. "
        f"Home-care steps: {action_note} "
        "Seek in-person care if symptoms persist beyond 48 hours or any red-flag symptom appears earlier."
    )


async def analyze_symptoms(symptom_text: str, language: str = "en") -> dict[str, object]:
    """Main async triage entrypoint used by API routes."""
    detected_symptoms = extract_symptoms(symptom_text)
    emergency_flag = detect_emergency(symptom_text)
    risk_level = classify_risk(symptom_text, detected_symptoms, emergency_flag)

    return {
        "risk_level": risk_level,
        "emergency_flag": emergency_flag,
        "advisory_message": advisory_for_risk(risk_level, emergency_flag, symptom_text, detected_symptoms, language),
        "disclaimer": HINDI_MEDICAL_DISCLAIMER if language == "hi" else MEDICAL_DISCLAIMER,
        "detected_symptoms": detected_symptoms,
    }
