import pytest

from app.config import Settings
from app.erp_client import ERPClient


class FakeResponse:
    def __init__(self, status_code: int, payload: dict):
        self.status_code = status_code
        self._payload = payload

    def json(self) -> dict:
        return self._payload


class FakeAsyncClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return None

    async def post(self, url, data=None):
        return FakeResponse(200, {"access_token": "token-abc", "expires_in": 300})


@pytest.mark.asyncio
async def test_oauth_client_credentials_token(monkeypatch):
    import app.erp_client as module

    monkeypatch.setattr(module.httpx, "AsyncClient", FakeAsyncClient)

    settings = Settings(
        ERP_CLIENT_ID="cid",
        ERP_CLIENT_SECRET="secret",
        ERP_SCOPE="beds:read",
        ERP_TOKEN_URL="https://example.com/token",
    )
    client = ERPClient(settings)

    token = await client._get_access_token()
    assert token == "token-abc"
