from datetime import datetime
import asyncio
import base64
import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models_enterprise import WhatsAppLog
from services import hospital_service


FINAL_DELIVERY_STATUSES = {
    "delivered",
    "read",
    "failed",
    "undelivered",
    "canceled",
    "mock-delivered",
    "sms-sent",
    "normal-message",
}


def _normalize_phone(phone_number: str) -> str:
    raw = phone_number.strip()
    if not raw:
        return ""
    if raw.startswith("+"):
        return "+" + "".join(ch for ch in raw[1:] if ch.isdigit())

    digits = "".join(ch for ch in raw if ch.isdigit())
    default_country_code = os.getenv("WHATSAPP_DEFAULT_COUNTRY_CODE", "+91").strip() or "+91"
    if not default_country_code.startswith("+"):
        default_country_code = "+" + default_country_code
    return f"{default_country_code}{digits}"


def _twilio_configured() -> bool:
    return all(
        os.getenv(name)
        for name in ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM"]
    )


def _textbelt_configured() -> bool:
    provider = os.getenv("SMS_PROVIDER", "").strip().lower()
    api_key = os.getenv("TEXTBELT_API_KEY", "").strip()
    return provider == "textbelt" and bool(api_key)


def _plivo_configured() -> bool:
    provider = os.getenv("SMS_PROVIDER", "").strip().lower()
    return provider == "plivo" and all(
        os.getenv(name)
        for name in ["PLIVO_AUTH_ID", "PLIVO_AUTH_TOKEN", "PLIVO_SRC"]
    )


def _send_via_textbelt(phone_number: str, message_summary: str) -> tuple[str, str | None]:
    to_phone = _normalize_phone(phone_number)
    if len(to_phone) < 10:
        return "failed", "invalid-phone"

    api_key = os.getenv("TEXTBELT_API_KEY", "").strip()
    endpoint = "https://textbelt.com/text"
    payload = urlencode(
        {
            "phone": to_phone,
            "message": message_summary,
            "key": api_key,
        }
    ).encode("utf-8")

    request = Request(
        endpoint,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    try:
        with urlopen(request, timeout=12) as response:
            body = response.read().decode("utf-8")
        parsed = json.loads(body) if body else {}
        if bool(parsed.get("success")):
            text_id = parsed.get("textId")
            return "sms-sent", f"textbelt:{text_id}" if text_id else "textbelt:accepted"

        error_message = parsed.get("error")
        if isinstance(error_message, str) and error_message.strip():
            return "failed", error_message.strip()
        return "failed", "textbelt-failed"
    except HTTPError as error:
        return "failed", f"textbelt-http-{error.code}"
    except Exception:
        return "failed", "textbelt-request-failed"


def _send_via_plivo(phone_number: str, message_summary: str) -> tuple[str, str | None]:
    to_phone = _normalize_phone(phone_number)
    if len(to_phone) < 10:
        return "failed", "invalid-phone"

    auth_id = os.getenv("PLIVO_AUTH_ID", "").strip()
    auth_token = os.getenv("PLIVO_AUTH_TOKEN", "").strip()
    src = os.getenv("PLIVO_SRC", "").strip()

    endpoint = f"https://api.plivo.com/v1/Account/{auth_id}/Message/"
    payload = json.dumps(
        {
            "src": src,
            "dst": to_phone,
            "text": message_summary,
        }
    ).encode("utf-8")

    auth_raw = f"{auth_id}:{auth_token}".encode("utf-8")
    auth_header = base64.b64encode(auth_raw).decode("utf-8")

    request = Request(
        endpoint,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=12) as response:
            body = response.read().decode("utf-8")
        parsed = json.loads(body) if body else {}

        message_uuids = parsed.get("message_uuid")
        if isinstance(message_uuids, list) and message_uuids:
            return "sms-sent", f"plivo:{message_uuids[0]}"

        api_id = parsed.get("api_id")
        if isinstance(api_id, str) and api_id.strip():
            return "sms-sent", f"plivo:{api_id.strip()}"

        return "sms-sent", "plivo:accepted"
    except HTTPError as error:
        try:
            error_body = error.read().decode("utf-8")
            parsed_error = json.loads(error_body)
            detail = parsed_error.get("error")
            if isinstance(detail, str) and detail.strip():
                return "failed", detail.strip()
        except Exception:
            pass
        return "failed", f"plivo-http-{error.code}"
    except Exception:
        return "failed", "plivo-request-failed"


def _send_via_twilio(phone_number: str, message_summary: str) -> tuple[str, str | None]:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    whatsapp_from = os.getenv("TWILIO_WHATSAPP_FROM", "")

    to_phone = _normalize_phone(phone_number)
    if len(to_phone) < 10:
        return "failed", "invalid-phone"

    endpoint = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    payload = urlencode(
        {
            "To": f"whatsapp:{to_phone}",
            "From": whatsapp_from,
            "Body": message_summary,
        }
    ).encode("utf-8")

    auth_raw = f"{account_sid}:{auth_token}".encode("utf-8")
    auth_header = base64.b64encode(auth_raw).decode("utf-8")

    request = Request(
        endpoint,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    try:
        with urlopen(request, timeout=12) as response:
            body = response.read().decode("utf-8")
        parsed = json.loads(body) if body else {}
        return str(parsed.get("status") or "queued"), str(parsed.get("sid") or "")
    except HTTPError as error:
        try:
            error_body = error.read().decode("utf-8")
            parsed_error = json.loads(error_body)
            message = parsed_error.get("message")
            if isinstance(message, str) and message.strip():
                return "failed", message.strip()
        except Exception:
            pass
        return "failed", f"twilio-http-{error.code}"
    except Exception:
        return "failed", "twilio-request-failed"


def _fetch_twilio_message_status(message_sid: str) -> tuple[str | None, str | None]:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    if not account_sid or not auth_token:
        return None, "twilio-provider-not-configured"

    endpoint = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages/{message_sid}.json"
    auth_raw = f"{account_sid}:{auth_token}".encode("utf-8")
    auth_header = base64.b64encode(auth_raw).decode("utf-8")

    request = Request(
        endpoint,
        method="GET",
        headers={
            "Authorization": f"Basic {auth_header}",
        },
    )

    try:
        with urlopen(request, timeout=12) as response:
            body = response.read().decode("utf-8")
        parsed = json.loads(body) if body else {}

        status = parsed.get("status")
        error_code = parsed.get("error_code")
        error_message = parsed.get("error_message")

        if error_code:
            if isinstance(error_message, str) and error_message.strip():
                return str(status or "failed"), error_message.strip()
            return str(status or "failed"), f"twilio-error-{error_code}"

        return str(status or "queued"), None
    except HTTPError as error:
        return None, f"twilio-http-{error.code}"
    except Exception:
        return None, "twilio-request-failed"


async def send_summary(db: AsyncSession, *, user_id: int | None, phone_number: str, message_summary: str) -> WhatsAppLog:
    normalized_phone = phone_number.strip()
    delivery_status = "failed"
    provider_reference: str | None = None

    if _twilio_configured():
        twilio_status, twilio_reference = await asyncio.to_thread(_send_via_twilio, normalized_phone, message_summary)
        delivery_status = twilio_status
        provider_reference = twilio_reference
    elif _plivo_configured():
        plivo_status, plivo_reference = await asyncio.to_thread(_send_via_plivo, normalized_phone, message_summary)
        delivery_status = plivo_status
        provider_reference = plivo_reference
    elif _textbelt_configured():
        sms_status, sms_reference = await asyncio.to_thread(_send_via_textbelt, normalized_phone, message_summary)
        delivery_status = sms_status
        provider_reference = sms_reference
    else:
        mock_enabled = os.getenv("WHATSAPP_ENABLE_MOCK", "false").strip().lower() == "true"
        if mock_enabled:
            delivery_status = "mock-delivered" if len(_normalize_phone(normalized_phone)) >= 10 else "failed"
            provider_reference = f"mock-wa-{int(datetime.utcnow().timestamp())}"
        else:
            delivery_status = "normal-message"
            provider_reference = "normal-message-fallback"

    log = WhatsAppLog(
        user_id=user_id,
        phone_number=normalized_phone,
        message_summary=message_summary,
        delivery_status=delivery_status,
        provider_reference=provider_reference,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_message_history(db: AsyncSession, limit: int = 50) -> list[WhatsAppLog]:
    rows = await db.scalars(select(WhatsAppLog).order_by(WhatsAppLog.created_at.desc()).limit(limit))
    return list(rows)


async def refresh_delivery_status(db: AsyncSession, *, log_id: int) -> WhatsAppLog | None:
    log = await db.get(WhatsAppLog, log_id)
    if log is None:
        return None

    current_status = (log.delivery_status or "").strip().lower()
    if current_status in FINAL_DELIVERY_STATUSES:
        return log

    provider_reference = (log.provider_reference or "").strip()
    is_twilio_message = provider_reference.startswith("SM") and _twilio_configured()
    if not is_twilio_message:
        return log

    updated_status, provider_error = await asyncio.to_thread(_fetch_twilio_message_status, provider_reference)
    if updated_status:
        log.delivery_status = updated_status
    if provider_error:
        log.provider_reference = provider_error

    await db.commit()
    await db.refresh(log)
    return log


async def send_conversation_summary(
    db: AsyncSession,
    *,
    user_id: int | None,
    phone_number: str,
    triage_advice: str,
    risk_level: str | None,
    eligibility_summary: str | None,
    eligible_schemes: list[str],
    city: str,
    preferred_language: str = "en",
) -> WhatsAppLog:
    hospital_result = await hospital_service.suggest_hospitals(city=city)
    top_hospitals = [item.get("hospital_name", "") for item in hospital_result.get("hospitals", [])[:2]]
    hospital_line = ", ".join([name for name in top_hospitals if name]) if top_hospitals else "No hospital suggestion available"

    is_hindi = (preferred_language or "en").strip().lower() == "hi"

    if is_hindi:
        risk_value = risk_level or "अज्ञात"
        lines = [
            "हेल्थकेयर वॉइस असिस्टेंट सारांश",
            f"जोखिम स्तर: {risk_value}",
            f"सलाह: {triage_advice}",
        ]

        if eligibility_summary:
            lines.append(f"पात्रता: {eligibility_summary}")

        if eligible_schemes:
            lines.append(f"पात्र योजनाएँ: {', '.join(eligible_schemes[:3])}")

        lines.append(f"अस्पताल ({city}): {hospital_line}")
        lines.append("यह केवल जानकारी हेतु सारांश है, चिकित्सीय निदान नहीं।")
    else:
        lines = [
            "Healthcare Voice Assistant Summary",
            f"Risk Level: {risk_level or 'Unknown'}",
            f"Advice: {triage_advice}",
        ]

        if eligibility_summary:
            lines.append(f"Eligibility: {eligibility_summary}")

        if eligible_schemes:
            lines.append(f"Eligible Schemes: {', '.join(eligible_schemes[:3])}")

        lines.append(f"Hospitals ({city}): {hospital_line}")
        lines.append("This is an informational summary and not a diagnosis.")

    final_message = "\n".join(lines)
    return await send_summary(
        db,
        user_id=user_id,
        phone_number=phone_number,
        message_summary=final_message,
    )
