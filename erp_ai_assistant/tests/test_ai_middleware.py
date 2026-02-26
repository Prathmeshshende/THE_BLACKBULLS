from app.ai_middleware import parse_prompt
from app.schemas import IntentType


def test_parse_bed_query() -> None:
    parsed = parse_prompt("Do you have any ICU beds available right now?")
    assert parsed.intent == IntentType.beds
    assert parsed.entities["department"] == "ICU"


def test_parse_claim_query() -> None:
    parsed = parse_prompt("Has claim #12345 been approved?")
    assert parsed.intent == IntentType.claim
    assert parsed.entities["claim_id"] == "12345"


def test_parse_slot_query() -> None:
    parsed = parse_prompt("Show appointment slots for Dr. Sharma tomorrow")
    assert parsed.intent == IntentType.slots
    assert parsed.entities["doctor"] == "Sharma"
    assert parsed.entities["date"] == "tomorrow"
