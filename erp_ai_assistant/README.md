# Hospital ERP AI Assistant Integration

Complete reference implementation for an AI assistant that integrates with hospital ERP REST APIs.

## Features

- Real-time bed availability lookup
- Insurance claim status checks
- Appointment slots lookup
- Secure patient medical records query
- OAuth2 client-credentials integration to ERP
- JWT access control for assistant consumers
- TTL caching for beds and slots
- Structured AI intent-to-API middleware
- Session/context logging to SQLite
- Unit tests for parsing, OAuth token flow, and assistant endpoint

## 1) API Contract

- ERP provider contract: [openapi/erp_contract.yaml](openapi/erp_contract.yaml)

### Sample ERP JSON responses

```json
{
  "department": "ICU",
  "available": 4,
  "total": 20,
  "updated_at": "2026-02-27T10:21:00Z"
}
```

```json
{
  "claim_id": "12345",
  "status": "approved",
  "approved_amount": 18500.0,
  "updated_at": "2026-02-27T10:25:00Z"
}
```

## 2) Backend Integration Layer

Main service: [app/main.py](app/main.py)

- Uses [app/erp_client.py](app/erp_client.py) to call ERP APIs
- Handles fallback and caching
- Returns structured responses

## 3) Authentication Flow

- Outbound (assistant -> ERP): OAuth2 client credentials
  - token endpoint in `ERP_TOKEN_URL`
- Inbound (client -> assistant): JWT Bearer
  - For local testing, call `/auth/dev-token`

## 4) Caching Strategy

- In-memory TTL cache in [app/cache.py](app/cache.py)
- Beds cache TTL: `CACHE_BEDS_TTL`
- Slots cache TTL: `CACHE_SLOTS_TTL`
- On ERP outage, stale cache is used when available

## 5) AI Middleware

- Intent parser: [app/ai_middleware.py](app/ai_middleware.py)
- Endpoint: `POST /assistant/query`
- Maps prompt to one of:
  - beds
  - claim
  - slots
  - records

## 6) Example Prompts

- Do you have any ICU beds available right now?
- Has claim #12345 been approved?
- Show appointment slots for Dr. Sharma tomorrow

## 7) Error Handling and Fallbacks

- ERP 5xx mapped to service-unavailable response
- Beds/slots return stale cache if ERP fails
- Unknown prompt intent returns structured `unknown` intent result

## 8) Security Best Practices Included

- OAuth2 client credentials for ERP
- JWT validation and scope checks per endpoint
- No hardcoded credentials
- .env-based secret management
- Principle of least privilege with endpoint scope checks

Recommended production hardening:

- Use HTTPS everywhere
- Rotate ERP/client secrets
- Store secrets in managed vault (not .env)
- Add audit trail shipping to SIEM
- Add PHI data masking before logs

## 9) Session/Context Log Schema

SQLAlchemy model: [app/models.py](app/models.py)

Columns:

- `session_id`
- `user_prompt`
- `intent`
- `api_called`
- `response_json`
- `status`
- `created_at`

## 10) Unit Tests

- [tests/test_ai_middleware.py](tests/test_ai_middleware.py)
- [tests/test_erp_client.py](tests/test_erp_client.py)
- [tests/test_assistant_api.py](tests/test_assistant_api.py)

## Configuration

Copy and fill env:

- `.env.example` -> `.env`

Required ERP fields:

- `ERP_BASE_URL`
- `ERP_TOKEN_URL`
- `ERP_CLIENT_ID`
- `ERP_CLIENT_SECRET`
- `ERP_SCOPE`

## Run

```powershell
cd erp_ai_assistant
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8100
```

Get token:

```powershell
Invoke-RestMethod -Method GET http://127.0.0.1:8100/auth/dev-token
```

Example assistant call:

```powershell
$token = (Invoke-RestMethod -Method GET http://127.0.0.1:8100/auth/dev-token).access_token
$headers = @{ Authorization = "Bearer $token" }
$body = @{ session_id = "s-001"; prompt = "Do you have any ICU beds available right now?" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://127.0.0.1:8100/assistant/query -Headers $headers -ContentType "application/json" -Body $body
```

Run tests:

```powershell
pytest -q
```
