from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.auth import create_access_token
from app.main import app, erp_client


def test_assistant_query_beds(monkeypatch):
    async def fake_get_beds(department: str):
        return {
            "department": department,
            "available": 3,
            "total": 20,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    monkeypatch.setattr(erp_client, "get_bed_availability", fake_get_beds)

    token = create_access_token("tester", ["beds:read", "claims:read", "appointments:read", "records:read"])
    client = TestClient(app)

    response = client.post(
        "/assistant/query",
        json={"session_id": "s01", "prompt": "Do you have any ICU beds available right now?"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["intent"] == "beds"
