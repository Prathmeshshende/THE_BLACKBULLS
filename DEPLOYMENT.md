# Deployment Guide

## Easiest Production Setup

Use:
- Frontend: Vercel
- Backend + DB: Render

This repo is already configured for this setup:
- `render.yaml` for backend service + managed Postgres on Render
- Next.js rewrite in `frontend/next.config.mjs` to route `/api/*` to backend

## Pre-deploy Validation (already verified)

Run from local workspace:

```powershell
# Frontend production build
Set-Location frontend
npm run build

# ERP assistant tests
Set-Location ..\erp_ai_assistant
..\.venv\Scripts\python.exe -m pytest -q
```

Expected:
- Next.js build succeeds
- Tests pass

## Deploy Backend on Render

### Option A: One-click via Blueprint (recommended)

1. Push your latest code to GitHub.
2. In Render: New > Blueprint.
3. Select this repository.
4. Render reads `render.yaml` and prepares services.
5. Set required secrets in Render dashboard:
   - `JWT_SECRET_KEY`
   - `TWILIO_ACCOUNT_SID` (optional)
   - `TWILIO_AUTH_TOKEN` (optional)
   - `TWILIO_WHATSAPP_FROM` (optional)
   - `OPENAI_API_KEY` (optional, for real STT)
6. Deploy.

Render will provide backend URL:
- `https://<your-backend>.onrender.com`

### Option B: Manual Web Service

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/`

## Deploy Frontend on Vercel

1. Import the same GitHub repo in Vercel.
2. Set project root to `frontend`.
3. Add environment variable:
   - `BACKEND_BASE_URL=https://<your-backend>.onrender.com`
4. Deploy.

Your final single public app URL will be the Vercel URL.

## Post-deploy Verification Checklist

1. Open frontend URL.
2. Confirm login page loads.
3. Open `/voice` and submit symptoms.
4. Open `/eligibility-checker` and run eligibility check.
5. Click `Play Voice` in English and Hindi modes.
6. Check API calls in browser Network tab:
   - No persistent 401/500 responses on normal flows.
7. Confirm backend health URL returns `200`:
   - `https://<your-backend>.onrender.com/`

## Common Issues

- Frontend can load but API fails:
  - Verify `BACKEND_BASE_URL` in Vercel points to Render backend URL.

- Token/auth errors after deploy:
  - Ensure `JWT_SECRET_KEY` is set on backend.

- Hindi voice fallback occurs:
  - Current logic gracefully falls back when Hindi cloud voice is unavailable.

- Database table errors:
  - Startup creates tables, and logging has on-demand table creation fallback.
