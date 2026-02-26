import asyncio
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

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

NAGPUR_FALLBACK_HOSPITALS: list[dict[str, object]] = [
    {
        "hospital_name": "Government Medical College and Hospital (GMCH), Nagpur",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Indira Gandhi Government Medical College and Hospital (Mayo), Nagpur",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "AIIMS Nagpur",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
]

NAGPUR_FALLBACK_PRIVATE_HOSPITALS: list[dict[str, object]] = [
    {
        "hospital_name": "Care Hospital, Nagpur",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Wockhardt Hospitals, Nagpur",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Kingsway Hospitals, Nagpur",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
]

PUNE_FALLBACK_GOV_HOSPITALS: list[dict[str, object]] = [
    {
        "hospital_name": "Sassoon General Hospital, Pune",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Aundh District Hospital, Pune",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Yashwantrao Chavan Memorial Hospital (YCM), Pune",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
]

PUNE_FALLBACK_PRIVATE_HOSPITALS: list[dict[str, object]] = [
    {
        "hospital_name": "Ruby Hall Clinic, Pune",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Jehangir Hospital, Pune",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Sahyadri Hospital, Pune",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
]

HYDERABAD_FALLBACK_GOV_HOSPITALS: list[dict[str, object]] = [
    {
        "hospital_name": "Osmania General Hospital, Hyderabad",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Gandhi Hospital, Hyderabad",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Nizam's Institute of Medical Sciences (NIMS), Hyderabad",
        "government": True,
        "scheme_supported": True,
        "contact_number": "Not listed",
    },
]

HYDERABAD_FALLBACK_PRIVATE_HOSPITALS: list[dict[str, object]] = [
    {
        "hospital_name": "Apollo Hospitals, Jubilee Hills",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "Yashoda Hospitals, Somajiguda",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
    {
        "hospital_name": "KIMS Hospitals, Secunderabad",
        "government": False,
        "scheme_supported": False,
        "contact_number": "Not listed",
    },
]

REALTIME_CITY_CONFIG: dict[str, dict[str, object]] = {
    "nagpur": {
        "display_name": "Nagpur",
        "gov_fallback": NAGPUR_FALLBACK_HOSPITALS,
        "private_fallback": NAGPUR_FALLBACK_PRIVATE_HOSPITALS,
    },
    "pune": {
        "display_name": "Pune",
        "gov_fallback": PUNE_FALLBACK_GOV_HOSPITALS,
        "private_fallback": PUNE_FALLBACK_PRIVATE_HOSPITALS,
    },
    "hyderabad": {
        "display_name": "Hyderabad",
        "gov_fallback": HYDERABAD_FALLBACK_GOV_HOSPITALS,
        "private_fallback": HYDERABAD_FALLBACK_PRIVATE_HOSPITALS,
    },
}


def _fetch_hospitals_from_osm(query_text: str, government: bool, scheme_supported: bool) -> list[dict[str, object]]:
    query = urlencode(
        {
            "q": query_text,
            "format": "jsonv2",
            "limit": 12,
            "addressdetails": 1,
        }
    )
    url = f"https://nominatim.openstreetmap.org/search?{query}"
    request = Request(url, headers={"User-Agent": "ArogyaAI/1.0 (hospital-suggestions)"})

    with urlopen(request, timeout=8) as response:
        raw = response.read().decode("utf-8")
    payload = json.loads(raw)

    if not isinstance(payload, list):
        return []

    seen: set[str] = set()
    hospitals: list[dict[str, object]] = []
    generic_names = {
        "hospital",
        "government hospital",
        "district hospital",
    }
    for row in payload:
        if not isinstance(row, dict):
            continue
        name = str(row.get("name") or "").strip()
        display_name = str(row.get("display_name") or "").strip()
        hospital_name = name or display_name.split(",")[0].strip()
        if not hospital_name:
            continue
        if hospital_name.lower() in generic_names:
            continue

        key = hospital_name.lower()
        if key in seen:
            continue
        seen.add(key)

        hospitals.append(
            {
                "hospital_name": hospital_name,
                "government": government,
                "scheme_supported": scheme_supported,
                "contact_number": "Not listed",
            }
        )

    return hospitals


async def suggest_hospitals(city: str) -> dict[str, object]:
    normalized_city = city.strip().lower()

    city_config = REALTIME_CITY_CONFIG.get(normalized_city)
    if city_config is not None:
        display_name = str(city_config["display_name"])
        gov_fallback = list(city_config["gov_fallback"])
        private_fallback = list(city_config["private_fallback"])

        try:
            gov_live, private_live = await asyncio.gather(
                asyncio.to_thread(_fetch_hospitals_from_osm, f"government hospital in {display_name}", True, True),
                asyncio.to_thread(_fetch_hospitals_from_osm, f"private hospital in {display_name}", False, False),
            )

            hospitals: list[dict[str, object]] = []
            seen_names: set[str] = set()

            for entry in [*gov_live, *private_live]:
                hospital_name = str(entry.get("hospital_name", "")).strip().lower()
                if not hospital_name or hospital_name in seen_names:
                    continue
                seen_names.add(hospital_name)
                hospitals.append(entry)

            if not hospitals:
                hospitals = [*gov_fallback, *private_fallback]
            else:
                for fallback in [*gov_fallback, *private_fallback]:
                    fallback_name = str(fallback.get("hospital_name", "")).strip().lower()
                    if fallback_name and fallback_name not in seen_names:
                        hospitals.append(fallback)
                        seen_names.add(fallback_name)
                    if len(hospitals) >= 8:
                        break
        except Exception:
            hospitals = [*gov_fallback, *private_fallback]

        return {
            "city": city,
            "hospitals": hospitals,
            "disclaimer": MEDICAL_DISCLAIMER,
        }

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
