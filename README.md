# 🏥 Arogya AI  
### AI Multilingual Healthcare & Government Scheme Assistant

## 📌 Overview
Arogya AI is a voice-enabled AI assistant designed to help citizens access healthcare information and government health schemes easily. It supports multilingual voice interaction and provides eligibility guidance for major health schemes.

## 🎯 Problem
Many citizens struggle to understand healthcare schemes, check eligibility, and access reliable information due to complex portals and language barriers.

## 🚀 Features
- 🎤 Voice-based interaction (Speech-to-Text)
- 🔊 AI voice responses (Text-to-Speech)
- 🌐 Multilingual support (Hindi & English)
- 📋 Scheme eligibility checker
- 🏥 Government hospital guidance
- ♿ Simple and accessible UI

## 🛠 Tech Stack
- Frontend: React / Streamlit
- Backend: Python (FastAPI)
- AI: Whisper + GPT API
- Database: SQLite

## 🏗 Workflow
User Voice → Speech-to-Text → Intent Detection → Eligibility Logic → AI Response → Text-to-Speech → Voice Output

## 🏥 Supported Schemes (Demo)
- Ayushman Bharat
- Pradhan Mantri Jan Arogya Yojana
- National Health Mission

## ⚠ Disclaimer
Arogya AI provides informational assistance only and does not replace professional medical advice or official government portals.

## ▶ Run Full Website (One Command)

From project root, run:

```powershell
.\start_all.ps1
```

This starts:
- Frontend: http://127.0.0.1:3000
- Dashboard Login: http://127.0.0.1:3000/dashboard-login
- Backend API: http://127.0.0.1:8000

## 📲 Real WhatsApp Delivery (Twilio)

By default, WhatsApp sending is not real unless provider credentials are configured.

Quick setup:

1. Copy `.env.example` to `.env` in project root.
2. Fill your Twilio values in `.env`.
3. Run `./start_all.ps1` again (it now auto-loads `.env`).

Set these environment variables before starting backend:

```powershell
$env:TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$env:TWILIO_AUTH_TOKEN = "your_auth_token"
$env:TWILIO_WHATSAPP_FROM = "whatsapp:+14155238886"
```

Optional:

```powershell
$env:WHATSAPP_DEFAULT_COUNTRY_CODE = "+91"
```

If you want demo/mock sends (no real WhatsApp message), enable:

```powershell
$env:WHATSAPP_ENABLE_MOCK = "true"
```

## 📩 Real SMS Without Twilio (TextBelt)

You can send real SMS using TextBelt instead of Twilio WhatsApp.

Set these in `.env`:

```powershell
SMS_PROVIDER=textbelt
TEXTBELT_API_KEY=your_textbelt_key
```

Then restart:

```powershell
.\start_all.ps1
```

Notes:
- Phone number should include country code (e.g. `+919699526226`).
- TextBelt delivery/quota depends on your TextBelt key/plan.

## 📩 Real SMS Without Twilio (Plivo)

You can also use Plivo for SMS delivery.

Set these in `.env`:

```powershell
SMS_PROVIDER=plivo
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_SRC=your_plivo_sender
```

Then restart:

```powershell
.\start_all.ps1
```

Notes:
- Phone number should include country code (e.g. `+919699526226`).
- `PLIVO_SRC` must be a valid sender configured in your Plivo account.
