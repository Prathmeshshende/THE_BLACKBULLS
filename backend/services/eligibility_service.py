from models.schemas import EligibilityRequest, MEDICAL_DISCLAIMER


async def check_scheme_eligibility(data: EligibilityRequest) -> dict[str, object]:
    """
    Rule-based eligibility (deterministic, no AI):
    Core qualifiers:
    - income <= 500000 OR bpl_card OR age >= 70
    Extended support qualifier:
    - (income <= 800000) AND (disability OR chronic illness OR pregnancy)
    """
    reasons: list[str] = []
    matched_rules: list[str] = []

    income_ok = data.income <= 500000
    bpl_ok = bool(data.bpl_card)
    senior_ok = data.age >= 70
    support_vulnerability_ok = bool(data.has_disability or data.has_chronic_illness or data.is_pregnant)
    extended_income_ok = data.income <= 800000
    extended_support_ok = extended_income_ok and support_vulnerability_ok
    family_large = data.family_size >= 5
    high_utilization = data.annual_hospital_visits >= 3

    if income_ok:
        reasons.append("Eligible by income rule: income is within 500000 threshold.")
        matched_rules.append("Income <= 500000")
    else:
        reasons.append("Income rule not met: income is above 500000 threshold.")

    if bpl_ok:
        reasons.append("Eligible by BPL rule: BPL card is available.")
        matched_rules.append("BPL Card available")
    else:
        reasons.append("BPL rule not met: BPL card is not available.")

    if senior_ok:
        reasons.append("Eligible by age rule: age is 70 or above.")
        matched_rules.append("Age >= 70")
    else:
        reasons.append("Age rule not met: age is below 70.")

    if extended_support_ok:
        reasons.append(
            "Eligible by extended support rule: vulnerability condition present with income within 800000 threshold."
        )
        matched_rules.append("Extended support rule")
    elif support_vulnerability_ok:
        reasons.append(
            "Support vulnerability noted (disability/chronic illness/pregnancy), but income is above 800000 threshold."
        )
    else:
        reasons.append("No additional vulnerability-based support rule matched.")

    if family_large:
        reasons.append("Family-size note: larger household (5+) may increase financial strain.")
    if high_utilization:
        reasons.append("Healthcare utilization note: frequent hospital usage suggests higher support need.")

    scheme_decisions: list[dict[str, object]] = []

    pmjay_eligible = income_ok or bpl_ok
    scheme_decisions.append(
        {
            "scheme_name": "Ayushman Bharat / PM-JAY",
            "eligible": pmjay_eligible,
            "reason": (
                "Income/BPL criteria matched."
                if pmjay_eligible
                else "Income and BPL criteria not matched."
            ),
        }
    )

    senior_scheme_eligible = senior_ok
    scheme_decisions.append(
        {
            "scheme_name": "Senior Citizen Health Support",
            "eligible": senior_scheme_eligible,
            "reason": (
                "Age criterion (70+) matched."
                if senior_scheme_eligible
                else "Age criterion (70+) not matched."
            ),
        }
    )

    chronic_support_eligible = data.has_chronic_illness and data.annual_hospital_visits >= 2 and extended_income_ok
    scheme_decisions.append(
        {
            "scheme_name": "Chronic Care Assistance Program",
            "eligible": chronic_support_eligible,
            "reason": (
                "Chronic condition with frequent visits and income threshold matched."
                if chronic_support_eligible
                else "Requires chronic illness + >=2 yearly visits + income within threshold."
            ),
        }
    )

    maternal_scheme_eligible = data.is_pregnant and extended_income_ok
    scheme_decisions.append(
        {
            "scheme_name": "Maternal Health Benefit Scheme",
            "eligible": maternal_scheme_eligible,
            "reason": (
                "Pregnancy support criteria matched."
                if maternal_scheme_eligible
                else "Requires pregnancy status and eligible income band."
            ),
        }
    )

    disability_scheme_eligible = data.has_disability and extended_income_ok
    scheme_decisions.append(
        {
            "scheme_name": "Disability Health Protection Scheme",
            "eligible": disability_scheme_eligible,
            "reason": (
                "Disability support criteria matched."
                if disability_scheme_eligible
                else "Requires disability status and eligible income band."
            ),
        }
    )

    rural_family_scheme_eligible = data.rural_resident and data.family_size >= 5 and extended_income_ok
    scheme_decisions.append(
        {
            "scheme_name": "Rural Family Health Relief Scheme",
            "eligible": rural_family_scheme_eligible,
            "reason": (
                "Rural large-family support criteria matched."
                if rural_family_scheme_eligible
                else "Requires rural residence, family size >=5, and eligible income band."
            ),
        }
    )

    eligible = any(bool(item["eligible"]) for item in scheme_decisions)

    score = 0
    if income_ok:
        score += 40
    elif extended_income_ok:
        score += 20
    if bpl_ok:
        score += 35
    if senior_ok:
        score += 20
    if support_vulnerability_ok:
        score += 20
    if family_large:
        score += 10
    if high_utilization:
        score += 10

    score = min(score, 100)

    if eligible:
        assessment_summary = (
            "Preliminary eligibility appears positive based on provided socioeconomic and medical-support indicators."
        )
    else:
        assessment_summary = (
            "Preliminary eligibility appears negative on current inputs; document verification and local scheme mapping are recommended."
        )

    benefits = {
        "scheme_name": "Ayushman Bharat / PM-JAY",
        "coverage": "₹5 lakh per family",
        "state": data.state,
        "estimated_priority": "High" if score >= 70 else "Medium" if score >= 40 else "Low",
        "household_context": f"Family size: {data.family_size}",
    }

    required_documents = [
        "Government photo ID (Aadhaar/Voter ID/Driving License)",
        "Address proof",
        "Income proof or income certificate",
        "BPL/ration card (if applicable)",
        "Age proof (for senior eligibility)",
    ]

    if data.has_chronic_illness:
        required_documents.append("Recent clinical records/prescriptions for chronic condition")
    if data.has_disability:
        required_documents.append("Disability certificate (if available)")
    if data.is_pregnant:
        required_documents.append("Pregnancy/maternal health record from registered facility")

    next_steps = [
        "Review required documents list and keep originals + photocopies ready.",
        "Visit nearest empanelled government hospital/helpdesk for PM-JAY verification.",
        "Request official beneficiary check using ID details and household data.",
        "If declined, ask for written reason and re-apply with missing documents corrected.",
    ]

    if not data.has_government_id:
        next_steps.insert(0, "Obtain/restore at least one valid government ID before verification.")

    return {
        "eligible": eligible,
        "assessment_summary": assessment_summary,
        "score": score,
        "matched_rules": matched_rules,
        "scheme_decisions": scheme_decisions,
        "reasons": reasons,
        "benefits": benefits,
        "required_documents": required_documents,
        "next_steps": next_steps,
        "disclaimer": MEDICAL_DISCLAIMER,
    }
