from models.schemas import MEDICAL_DISCLAIMER


HOSPITALS_BY_CITY: dict[str, list[dict[str, object]]] = {
    "bengaluru": [
        {
            "hospital_name": "Victoria Government Hospital",
            "government": True,
            "scheme_supported": True,
            "contact_number": "+91-80-2670-1150",
        },
        {
            "hospital_name": "Bowring and Lady Curzon Hospital",
            "government": True,
            "scheme_supported": True,
            "contact_number": "+91-80-2559-1394",
        },
    ],
    "mumbai": [
        {
            "hospital_name": "KEM Hospital",
            "government": True,
            "scheme_supported": True,
            "contact_number": "+91-22-2410-7000",
        }
    ],
    "delhi": [
        {
            "hospital_name": "Lok Nayak Hospital",
            "government": True,
            "scheme_supported": True,
            "contact_number": "+91-11-2323-6000",
        }
    ],
}


async def suggest_hospitals(city: str) -> dict[str, object]:
    normalized_city = city.strip().lower()

    hospitals = HOSPITALS_BY_CITY.get(
        normalized_city,
        [
            {
                "hospital_name": "Nearest District Government Hospital",
                "government": True,
                "scheme_supported": True,
                "contact_number": "108",
            }
        ],
    )

    return {
        "city": city,
        "hospitals": hospitals,
        "disclaimer": MEDICAL_DISCLAIMER,
    }
