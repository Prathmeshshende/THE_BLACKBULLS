from models.schemas import HouseholdMember


def evaluate_income_eligibility(income: float) -> tuple[bool, str]:
    """Income rule: eligible when annual income is <= 500000."""
    if income <= 500000:
        return True, "Eligible on income basis: annual income is within 500000 threshold"
    return False, "Not eligible on income basis: annual income is above 500000 threshold"


def evaluate_age_eligibility(age: int) -> tuple[bool, str]:
    """Senior rule: age 70+ is eligible regardless of income."""
    if age >= 70:
        return True, "Eligible on age basis: senior coverage expansion for age 70+"
    return False, "Not eligible on age basis: age is below 70"


def evaluate_deprivation_criteria(
    household_type: str,
    household_members: list[HouseholdMember] | None = None,
    no_adult_16_59: bool = False,
    female_headed: bool = False,
    disabled_no_caregiver: bool = False,
) -> tuple[bool, str]:
    """
    Deprivation rule:
    - Eligible if no adult in 16-59 age group
    - Eligible if female-headed household
    - Eligible if disabled member has no caregiver
    """
    matched_criteria: list[str] = []

    if no_adult_16_59:
        matched_criteria.append("No adult in 16-59 age group")

    if female_headed:
        matched_criteria.append("Female-headed household")

    if disabled_no_caregiver:
        matched_criteria.append("Disabled member with no caregiver")

    if household_members:
        has_adult_16_59 = any(16 <= member.age <= 59 for member in household_members)
        if not has_adult_16_59:
            matched_criteria.append("No adult in 16-59 age group (derived from household members)")

    if matched_criteria:
        return True, (
            f"Eligible on SECC deprivation criteria for household type '{household_type}': "
            + "; ".join(matched_criteria)
        )

    return False, (
        f"Not eligible on SECC deprivation criteria for household type '{household_type}': "
        "no qualifying deprivation condition matched"
    )
