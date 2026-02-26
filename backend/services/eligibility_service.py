from models.schemas import EligibilityRequest, MEDICAL_DISCLAIMER


async def check_scheme_eligibility(data: EligibilityRequest) -> dict[str, object]:
    """
    Rule-based eligibility (deterministic, no AI):
    - income <= 500000 OR bpl_card OR age >= 70
    """
    reasons: list[str] = []

    income_ok = data.income <= 500000
    bpl_ok = bool(data.bpl_card)
    senior_ok = data.age >= 70

    if income_ok:
        reasons.append("Eligible by income rule: income is within 500000 threshold.")
    else:
        reasons.append("Income rule not met: income is above 500000 threshold.")

    if bpl_ok:
        reasons.append("Eligible by BPL rule: BPL card is available.")
    else:
        reasons.append("BPL rule not met: BPL card is not available.")

    if senior_ok:
        reasons.append("Eligible by age rule: age is 70 or above.")
    else:
        reasons.append("Age rule not met: age is below 70.")

    eligible = income_ok or bpl_ok or senior_ok

    benefits = {
        "scheme_name": "Ayushman Bharat / PM-JAY",
        "coverage": "₹5 lakh per family",
        "state": data.state,
    }

    next_steps = [
        "Carry ID proof and family details to the hospital helpdesk.",
        "Request Ayushman Bharat / PM-JAY verification at registration.",
        "Keep relevant documents ready (income/BPL/age proof as applicable).",
    ]

    return {
        "eligible": eligible,
        "reasons": reasons,
        "benefits": benefits,
        "next_steps": next_steps,
        "disclaimer": MEDICAL_DISCLAIMER,
    }
