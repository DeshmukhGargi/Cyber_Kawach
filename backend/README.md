# Cyber Kawach — Python Flask Backend

AI-Powered Scam Detection & Cybersecurity Analysis API for Cyber Kawach.

---

## 1. Architecture Overview

```
backend/
├── app.py                     # Flask Application & REST API entry point
├── requirements.txt           # Python package dependencies
├── .env.example               # Environment variables template
├── README.md                  # Setup & architecture guide
└── analyzer/
    ├── __init__.py
    ├── validators.py          # Input validation, type guards & sanitization
    ├── rules.py               # Pattern matching, scam heuristics & indicators
    ├── url_analyzer.py        # Protocol, domain, TLD, IP & shortener inspector
    ├── risk_engine.py         # Multi-vector risk scoring (0-100) & classification
    └── ai_analyzer.py         # Google Gemini 3.8 Flash SDK integration
```

---

## 2. Prerequisites

- Python 3.10+
- A Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))

---

## 3. Local Setup Instructions

### Step 1: Create and Activate Virtual Environment

```bash
cd backend
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Gemini API Key:

```ini
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=5000
FLASK_ENV=development
ALLOWED_ORIGIN="http://localhost:3000"
```

### Step 4: Run Flask Server

```bash
python app.py
```

The API will be accessible at `http://localhost:5000/api/analyze`.

---

## 4. REST API Reference

### Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "Cyber Kawach Flask Backend",
  "version": "1.0.0",
  "gemini_configured": true
}
```

### Security Content Analysis
- **Endpoint**: `POST /api/analyze`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "type": "whatsapp",
  "content": "Dear customer, your SBI NetBanking will be blocked today due to pending KYC. Click http://sbi-kyc-verify-update.co.in to update now."
}
```

- **Supported Types**: `email`, `whatsapp`, `sms`, `url`

- **Response Body**:
```json
{
  "success": true,
  "type": "whatsapp",
  "risk_score": 92,
  "category": "DO NOT TOUCH",
  "threat_level": "Extremely High",
  "scam_type": "Fake KYC Phishing",
  "indicators": [
    "Immediate threat of bank account block or suspension",
    "Demands urgent KYC compliance via unofficial link",
    "High-pressure urgency tactics pushing for immediate reaction",
    "Domain uses high-risk suspicious TLD (.co.in impersonating SBI)"
  ],
  "explanation": "This message uses urgency and account suspension threats to coerce immediate action. It directs victims to a fraudulent credential-harvesting portal.",
  "recommendations": [
    "Do not click the link",
    "Never share OTPs, CVVs, or NetBanking credentials",
    "Verify through the official YONO SBI app or branch directly"
  ],
  "uncertainty": "Message content alone cannot authenticate the sender. Always independently verify through official banking channels.",
  "engine": "gemini-ai"
}
```

---

## 5. Production Deployment

For production deployments (e.g. AWS EC2, Google Cloud Run, Render):

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
