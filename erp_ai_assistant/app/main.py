from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .ai_middleware import parse_prompt
from .auth import create_access_token, require_scopes
from .cache import TTLCache
from .config import get_settings
from .db import Base, engine, get_db
from .erp_client import ERPClient
from .logging_service import log_session_interaction
from .schemas import (
    AppointmentSlotsResponse,
    AssistantQueryRequest,
    AssistantQueryResponse,
    BedAvailabilityResponse,
    ClaimStatusResponse,
    ErrorResponse,
    IntentType,
    PatientRecordResponse,
)

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0")
erp_client = ERPClient(settings)
cache = TTLCache()


@app.on_event("startup")
async def startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/auth/dev-token")
async def issue_dev_token() -> dict[str, str]:
    token = create_access_token(
        subject="demo-operator",
        scopes=["beds:read", "claims:read", "appointments:read", "records:read"],
        expires_minutes=240,
    )
    return {"access_token": token, "token_type": "bearer"}


@app.get("/integrations/beds", response_model=BedAvailabilityResponse, responses={503: {"model": ErrorResponse}})
async def beds(
    department: str = "ICU",
    _token=Depends(require_scopes(["beds:read"])),
) -> BedAvailabilityResponse:
    cache_key = f"beds:{department.lower()}"
    cached = cache.get(cache_key)
    if cached:
        return BedAvailabilityResponse(**cached)

    try:
        data = await erp_client.get_bed_availability(department)
        cache.set(cache_key, data, ttl_seconds=settings.cache_beds_ttl)
        return BedAvailabilityResponse(**data)
    except HTTPException:
        stale = cache.get_stale(cache_key)
        if stale:
            return BedAvailabilityResponse(**stale)
        raise


@app.get("/integrations/claims/{claim_id}", response_model=ClaimStatusResponse)
async def claim_status(
    claim_id: str,
    _token=Depends(require_scopes(["claims:read"])),
) -> ClaimStatusResponse:
    data = await erp_client.get_claim_status(claim_id)
    return ClaimStatusResponse(**data)


@app.get("/integrations/appointments/slots", response_model=AppointmentSlotsResponse)
async def appointment_slots(
    doctor: str,
    date: str,
    _token=Depends(require_scopes(["appointments:read"])),
) -> AppointmentSlotsResponse:
    cache_key = f"slots:{doctor.lower()}:{date}"
    cached = cache.get(cache_key)
    if cached:
        return AppointmentSlotsResponse(**cached)

    try:
        data = await erp_client.get_appointment_slots(doctor=doctor, date=date)
        cache.set(cache_key, data, ttl_seconds=settings.cache_slots_ttl)
        return AppointmentSlotsResponse(**data)
    except HTTPException:
        stale = cache.get_stale(cache_key)
        if stale:
            return AppointmentSlotsResponse(**stale)
        raise


@app.get("/integrations/patients/{patient_id}/records", response_model=PatientRecordResponse)
async def patient_records(
    patient_id: str,
    _token=Depends(require_scopes(["records:read"])),
) -> PatientRecordResponse:
    data = await erp_client.get_patient_records(patient_id)
    return PatientRecordResponse(**data)


@app.post("/assistant/query", response_model=AssistantQueryResponse)
async def assistant_query(
    payload: AssistantQueryRequest,
    db: AsyncSession = Depends(get_db),
    _token=Depends(require_scopes(["beds:read", "claims:read", "appointments:read"])),
) -> AssistantQueryResponse:
    parsed = parse_prompt(payload.prompt)
    now = datetime.now(timezone.utc)

    try:
        if parsed.intent == IntentType.beds:
            department = parsed.entities.get("department", "ICU")
            bed_data = await beds(department=department)
            response = AssistantQueryResponse(
                session_id=payload.session_id,
                intent=IntentType.beds,
                success=True,
                source="erp-api",
                message=f"{bed_data.available} {department} beds are currently available.",
                data=bed_data.model_dump(),
            )
            await log_session_interaction(
                db,
                session_id=payload.session_id,
                prompt=payload.prompt,
                intent=response.intent.value,
                api_called="GET /api/v1/beds/availability",
                response_payload=response.model_dump(),
                status="success",
            )
            return response

        if parsed.intent == IntentType.claim:
            claim_id = parsed.entities["claim_id"]
            claim_data = await claim_status(claim_id=claim_id)
            response = AssistantQueryResponse(
                session_id=payload.session_id,
                intent=IntentType.claim,
                success=True,
                source="erp-api",
                message=f"Claim {claim_id} status is {claim_data.status}.",
                data=claim_data.model_dump(),
            )
            await log_session_interaction(
                db,
                session_id=payload.session_id,
                prompt=payload.prompt,
                intent=response.intent.value,
                api_called=f"GET /api/v1/claims/{claim_id}",
                response_payload=response.model_dump(),
                status="success",
            )
            return response

        if parsed.intent == IntentType.slots:
            doctor = parsed.entities.get("doctor", "Unknown")
            date_text = parsed.entities.get("date", "today")
            date_value = (now + timedelta(days=1)).date().isoformat() if date_text == "tomorrow" else now.date().isoformat()
            slot_data = await appointment_slots(doctor=doctor, date=date_value)
            response = AssistantQueryResponse(
                session_id=payload.session_id,
                intent=IntentType.slots,
                success=True,
                source="erp-api",
                message=f"Found {len(slot_data.slots)} slots for Dr. {doctor} on {date_value}.",
                data=slot_data.model_dump(),
            )
            await log_session_interaction(
                db,
                session_id=payload.session_id,
                prompt=payload.prompt,
                intent=response.intent.value,
                api_called="GET /api/v1/appointments/slots",
                response_payload=response.model_dump(),
                status="success",
            )
            return response

        if parsed.intent == IntentType.records:
            patient_id = parsed.entities["patient_id"]
            record_data = await patient_records(patient_id=patient_id)
            response = AssistantQueryResponse(
                session_id=payload.session_id,
                intent=IntentType.records,
                success=True,
                source="erp-api",
                message=f"Retrieved records for patient {patient_id}.",
                data=record_data.model_dump(),
            )
            await log_session_interaction(
                db,
                session_id=payload.session_id,
                prompt=payload.prompt,
                intent=response.intent.value,
                api_called=f"GET /api/v1/patients/{patient_id}/records",
                response_payload=response.model_dump(),
                status="success",
            )
            return response

        unknown = AssistantQueryResponse(
            session_id=payload.session_id,
            intent=IntentType.unknown,
            success=False,
            source="ai-middleware",
            message="I could not map the request to a supported ERP operation.",
            data={},
        )
        await log_session_interaction(
            db,
            session_id=payload.session_id,
            prompt=payload.prompt,
            intent=unknown.intent.value,
            api_called="none",
            response_payload=unknown.model_dump(),
            status="failed",
        )
        return unknown

    except HTTPException as exc:
        fail = AssistantQueryResponse(
            session_id=payload.session_id,
            intent=parsed.intent,
            success=False,
            source="fallback",
            message="ERP temporarily unavailable. Please retry shortly.",
            data={"error": exc.detail},
        )
        await log_session_interaction(
            db,
            session_id=payload.session_id,
            prompt=payload.prompt,
            intent=parsed.intent.value,
            api_called="erp-call",
            response_payload=fail.model_dump(),
            status="failed",
        )
        return fail
