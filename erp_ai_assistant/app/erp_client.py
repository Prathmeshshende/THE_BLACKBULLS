from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import HTTPException

from .config import Settings


class ERPClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._access_token: str | None = None
        self._token_expires_at: float = 0

    async def _get_access_token(self) -> str:
        now = datetime.now(timezone.utc).timestamp()
        if self._access_token and now < self._token_expires_at - 15:
            return self._access_token

        payload = {
            "grant_type": "client_credentials",
            "client_id": self.settings.erp_client_id,
            "client_secret": self.settings.erp_client_secret,
            "scope": self.settings.erp_scope,
        }

        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.post(self.settings.erp_token_url, data=payload)

        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail="Unable to authenticate with ERP OAuth2 server")

        token_data = response.json()
        self._access_token = token_data["access_token"]
        self._token_expires_at = now + int(token_data.get("expires_in", 300))
        return self._access_token

    async def _authorized_get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        token = await self._get_access_token()
        headers = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient(base_url=self.settings.erp_base_url, timeout=12) as client:
            response = await client.get(path, params=params, headers=headers)

        if response.status_code >= 500:
            raise HTTPException(status_code=503, detail="ERP server is currently unavailable")
        if response.status_code >= 400:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        return response.json()

    async def get_bed_availability(self, department: str) -> dict[str, Any]:
        return await self._authorized_get("/api/v1/beds/availability", params={"department": department})

    async def get_claim_status(self, claim_id: str) -> dict[str, Any]:
        return await self._authorized_get(f"/api/v1/claims/{claim_id}")

    async def get_appointment_slots(self, doctor: str, date: str) -> dict[str, Any]:
        return await self._authorized_get("/api/v1/appointments/slots", params={"doctor": doctor, "date": date})

    async def get_patient_records(self, patient_id: str) -> dict[str, Any]:
        return await self._authorized_get(f"/api/v1/patients/{patient_id}/records")
