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
    state_normalized = data.state.strip().lower()
    scheme_application_links: dict[str, str] = {
        "Ayushman Bharat - PM-JAY": "https://beneficiary.nha.gov.in/",
        "ABHA Health ID (Ayushman Bharat Digital Mission)": "https://abha.abdm.gov.in/abha/v3/",
        "National Dialysis Programme (under NHM)": "https://nhm.gov.in/",
        "Pradhan Mantri Matru Vandana Yojana (PMMVY)": "https://pmmvy.wcd.gov.in/",
        "Janani Suraksha Yojana (JSY)": "https://nhm.gov.in/",
        "Janani Shishu Suraksha Karyakram (JSSK)": "https://nhm.gov.in/",
        "Rashtriya Bal Swasthya Karyakram (RBSK)": "https://nhm.gov.in/",
        "Rashtriya Kishor Swasthya Karyakram (RKSK)": "https://nhm.gov.in/",
        "National Programme for Health Care of Elderly (NPHCE)": "https://nhm.gov.in/",
        "Rashtriya Vayoshri Yojana (assistive support for senior citizens)": "https://www.alimco.in/",
        "Disability Health Support (state/central disability-linked benefits)": "https://www.swavlambancard.gov.in/",
        "Chronic Disease Support Programmes (state/NHM clinics)": "https://nhm.gov.in/",
        "National TB Elimination Programme (NTEP)": "https://tbcindia.gov.in/",
        "National AIDS Control Programme (NACP) - free HIV services": "https://naco.gov.in/",
        "Mahatma Jyotiba Phule Jan Arogya Yojana (Maharashtra)": "https://www.jeevandayee.gov.in/",
        "Mukhyamantri Amrutam / MA Vatsalya (Gujarat)": "https://maa.gujarat.gov.in/",
        "Aarogyasri (Telangana)": "https://www.aarogyasri.telangana.gov.in/",
        "Dr. YSR Aarogyasri (Andhra Pradesh)": "https://www.ysraarogyasri.ap.gov.in/",
        "Karunya Arogya Suraksha Padhathi (Kerala)": "https://sha.kerala.gov.in/karunya-arogya-suraksha-padhathi-kasp/",
        "Chief Minister's Comprehensive Health Insurance Scheme (Tamil Nadu)": "https://www.cmchistn.com/",
        "Biju Swasthya Kalyan Yojana (Odisha)": "https://bsky.odisha.gov.in/",
        "Mukhyamantri Chiranjeevi Health Insurance (Rajasthan)": "https://chiranjeevi.rajasthan.gov.in/",
        "Ayushman Bharat - Mukhyamantri Jan Arogya Yojana (Karnataka)": "https://arogya.karnataka.gov.in/",
        "Ayushman Bharat / State Health Assurance (Uttar Pradesh family schemes)": "https://pmjay.gov.in/",
    }

    def add_scheme(name: str, eligible_flag: bool, ok_reason: str, fail_reason: str) -> None:
        scheme_decisions.append(
            {
                "scheme_name": name,
                "eligible": bool(eligible_flag),
                "reason": ok_reason if eligible_flag else fail_reason,
                "application_link": scheme_application_links.get(name),
            }
        )

    # --- National umbrella / insurance schemes ---
    add_scheme(
        "Ayushman Bharat - PM-JAY",
        income_ok or bpl_ok or family_large,
        "Household meets low-income/BPL or family-risk profile often mapped to PM-JAY verification.",
        "Usually requires low-income/BPL or similar deprivation indicators during official verification.",
    )
    add_scheme(
        "ABHA Health ID (Ayushman Bharat Digital Mission)",
        data.has_government_id,
        "Government ID available; digital health ID enrollment is typically feasible.",
        "Government ID usually required for ABHA registration.",
    )
    add_scheme(
        "National Dialysis Programme (under NHM)",
        data.has_chronic_illness and high_utilization,
        "Chronic condition with repeated hospital utilization may qualify for subsidized dialysis pathway.",
        "Typically considered when chronic renal/related high-burden clinical need is documented.",
    )

    # --- Maternal / child health schemes ---
    add_scheme(
        "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        data.is_pregnant and data.has_government_id,
        "Pregnancy and ID status indicate potential PMMVY entitlement.",
        "Generally requires pregnancy-linked registration and identity documentation.",
    )
    add_scheme(
        "Janani Suraksha Yojana (JSY)",
        data.is_pregnant and (income_ok or bpl_ok or (data.rural_resident and data.family_size >= 4)),
        "Maternal profile with socio-economic vulnerability matches common JSY screening factors.",
        "Usually prioritized for pregnant beneficiaries with socioeconomic vulnerability and institutional delivery linkage.",
    )
    add_scheme(
        "Janani Shishu Suraksha Karyakram (JSSK)",
        data.is_pregnant or data.age <= 5,
        "Maternal/newborn-child care profile aligns with JSSK support pathway.",
        "Primarily applicable for pregnancy, childbirth, newborn, and young child care episodes.",
    )
    add_scheme(
        "Rashtriya Bal Swasthya Karyakram (RBSK)",
        data.age <= 18,
        "Child/adolescent age group fits RBSK screening age bands.",
        "RBSK is generally targeted to newborn/child/adolescent age groups.",
    )
    add_scheme(
        "Rashtriya Kishor Swasthya Karyakram (RKSK)",
        10 <= data.age <= 19,
        "Age falls in adolescent bracket commonly covered under RKSK.",
        "RKSK is mainly designed for adolescent age group.",
    )

    # --- Senior, disability, chronic care ---
    add_scheme(
        "National Programme for Health Care of Elderly (NPHCE)",
        data.age >= 60,
        "Senior age profile maps to geriatric care programme pathways.",
        "Generally oriented toward elderly beneficiaries (typically 60+).",
    )
    add_scheme(
        "Rashtriya Vayoshri Yojana (assistive support for senior citizens)",
        data.age >= 60 and income_ok,
        "Senior low-income profile may fit assistive-care screening.",
        "Usually requires both senior age and socioeconomic need criteria.",
    )
    add_scheme(
        "Disability Health Support (state/central disability-linked benefits)",
        data.has_disability,
        "Declared disability indicates potential eligibility for disability-linked health benefits.",
        "Disability-linked health support generally requires certified disability status.",
    )
    add_scheme(
        "Chronic Disease Support Programmes (state/NHM clinics)",
        data.has_chronic_illness,
        "Chronic illness profile aligns with long-term disease support pathways.",
        "Usually triggered when chronic disease documentation is available.",
    )

    # --- Disease specific public programmes ---
    add_scheme(
        "National TB Elimination Programme (NTEP)",
        data.has_chronic_illness and high_utilization,
        "Frequent clinical burden may warrant TB-program screening/referral workflow.",
        "Programme linkage generally depends on disease-specific diagnosis workflow.",
    )
    add_scheme(
        "National AIDS Control Programme (NACP) - free HIV services",
        data.has_chronic_illness,
        "Chronic-care pathway can include referral for free HIV-related public services when indicated.",
        "Service access is disease-indication based and confirmed by medical evaluation.",
    )

    # --- Major state health protection schemes (broad screening by state + vulnerability) ---
    add_scheme(
        "Mahatma Jyotiba Phule Jan Arogya Yojana (Maharashtra)",
        "maharashtra" in state_normalized and (income_ok or bpl_ok or data.rural_resident),
        "State and vulnerability profile broadly align with MJPJAY screening factors.",
        "Primarily for Maharashtra residents meeting socioeconomic criteria.",
    )
    add_scheme(
        "Mukhyamantri Amrutam / MA Vatsalya (Gujarat)",
        "gujarat" in state_normalized and (income_ok or bpl_ok),
        "Gujarat residence with low-income/BPL indicators matches common MA scheme filters.",
        "Requires Gujarat residence plus eligible income/deprivation criteria.",
    )
    add_scheme(
        "Aarogyasri (Telangana)",
        "telangana" in state_normalized and (income_ok or bpl_ok),
        "Telangana household with vulnerable economic profile may fit Aarogyasri pathway.",
        "Usually mapped for Telangana residents with qualifying socioeconomic category.",
    )
    add_scheme(
        "Dr. YSR Aarogyasri (Andhra Pradesh)",
        ("andhra" in state_normalized or "ap" == state_normalized) and (income_ok or bpl_ok),
        "Andhra Pradesh and low-income/BPL profile align with YSR Aarogyasri screening.",
        "Generally requires AP residence and qualifying socioeconomic status.",
    )
    add_scheme(
        "Karunya Arogya Suraksha Padhathi (Kerala)",
        "kerala" in state_normalized and (income_ok or bpl_ok or data.has_chronic_illness),
        "Kerala residence with financial/clinical vulnerability fits Karunya-style support checks.",
        "Typically requires Kerala residence and approved vulnerability/clinical criteria.",
    )
    add_scheme(
        "Chief Minister's Comprehensive Health Insurance Scheme (Tamil Nadu)",
        ("tamil" in state_normalized or "tn" == state_normalized) and (income_ok or bpl_ok),
        "Tamil Nadu residence with income vulnerability aligns with CMCHIS screening.",
        "Requires Tamil Nadu residence and approved family income/category criteria.",
    )
    add_scheme(
        "Biju Swasthya Kalyan Yojana (Odisha)",
        "odisha" in state_normalized and (income_ok or bpl_ok or data.rural_resident),
        "Odisha residence and vulnerability indicators align with BSKY-style public support.",
        "Usually requires Odisha residence with approved beneficiary category.",
    )
    add_scheme(
        "Mukhyamantri Chiranjeevi Health Insurance (Rajasthan)",
        "rajasthan" in state_normalized and (income_ok or bpl_ok),
        "Rajasthan household with vulnerable income profile matches common Chiranjeevi checks.",
        "Requires Rajasthan residence and qualifying enrollment category.",
    )
    add_scheme(
        "Ayushman Bharat - Mukhyamantri Jan Arogya Yojana (Karnataka)",
        "karnataka" in state_normalized and (income_ok or bpl_ok or family_large),
        "Karnataka residence with socioeconomic vulnerability aligns with state AB-PMJAY linkage.",
        "Usually needs Karnataka residence plus eligible deprivation/income category.",
    )
    add_scheme(
        "Ayushman Bharat / State Health Assurance (Uttar Pradesh family schemes)",
        ("uttar pradesh" in state_normalized or state_normalized == "up") and (income_ok or bpl_ok),
        "UP residence and vulnerable income profile fit common public health assurance filters.",
        "Primarily requires UP residence and qualifying socioeconomic status.",
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

    top_eligible_scheme = next(
        (item["scheme_name"] for item in scheme_decisions if bool(item["eligible"])),
        "No strongly matched scheme from current rule set",
    )

    benefits = {
        "scheme_name": str(top_eligible_scheme),
        "coverage": "Scheme-dependent (often hospitalization support under public entitlement norms)",
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
