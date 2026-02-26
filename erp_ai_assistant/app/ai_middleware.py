import re
from dataclasses import dataclass

from .schemas import IntentType


@dataclass
class ParsedIntent:
    intent: IntentType
    entities: dict[str, str]


def parse_prompt(prompt: str) -> ParsedIntent:
    lower_prompt = prompt.lower()

    if "bed" in lower_prompt or "icu" in lower_prompt:
        department = "ICU" if "icu" in lower_prompt else "General"
        return ParsedIntent(intent=IntentType.beds, entities={"department": department})

    claim_match = re.search(r"claim\s*#?(\w+)", lower_prompt)
    if "claim" in lower_prompt and claim_match:
        return ParsedIntent(intent=IntentType.claim, entities={"claim_id": claim_match.group(1)})

    if "slot" in lower_prompt or "appointment" in lower_prompt:
        doctor_match = re.search(r"dr\.?\s+([a-zA-Z]+)", prompt, flags=re.IGNORECASE)
        doctor = doctor_match.group(1) if doctor_match else "Unknown"
        date = "tomorrow" if "tomorrow" in lower_prompt else "today"
        return ParsedIntent(intent=IntentType.slots, entities={"doctor": doctor, "date": date})

    patient_match = re.search(r"patient\s*#?(\w+)", lower_prompt)
    if "record" in lower_prompt and patient_match:
        return ParsedIntent(intent=IntentType.records, entities={"patient_id": patient_match.group(1)})

    return ParsedIntent(intent=IntentType.unknown, entities={})
