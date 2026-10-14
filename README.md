# Cyber Kawach (साइबर कवच)
> **Click Smart. Stay Safe.**

Cyber Kawach is a full-stack, AI-driven cybersecurity defense and scam analysis platform. It inspects untrusted communications across four attack vectors—**Email Phishing**, **WhatsApp Scams**, **SMS Smishing**, and **Malicious URLs**—combining Google Gemini AI reasoning with heuristic rule engines, forensic Scam Detective challenges, and adaptive Cyber Fitness assessments.

---

## 🛡️ Architecture & Key Features

- **Multi-Vector Threat Analysis**:
  - **Email**: Spoofed sender domains, lookalike TLDs, urgent credential expiry, and attachment threat indicators.
  - **WhatsApp**: Digital arrest imposters, fraudulent job tasks, and unsolicited foreign routing.
  - **SMS Smishing**: Utility disconnection threats, fake parcel redelivery lures, and personal mobile sender headers.
  - **URL Inspector**: Protocol checks, raw IP addresses, deceptive subdomains, and suspicious TLD identification.
- **Hybrid Security Engine**: Google Gemini AI reasoning combined with an offline heuristic rule engine. If Gemini API is unconfigured or unavailable, heuristic detection seamlessly continues.
- **Forensic Scam Detective Challenge**: Interactive scenario forensic drills where users uncover hidden red flags.
- **Adaptive Cyber Awareness Quiz**: 80+ categorized questions tailored dynamically to user scan patterns and domain weaknesses.
- **Cyber Fitness Score (0–100)**: Transparent weighted rating evaluating quiz accuracy, improvement, training, and forensic performance.
- **Strict Data Privacy**: Sensitive credentials, payment cards, phone numbers, and emails are automatically redacted before storing summaries.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Server**: Node.js, Express, tsx (`server.ts`)
- **AI Integration**: `@google/genai` SDK (Google Gemini 2.5 / Flash)
- **Database & Auth**: Firebase Authentication & Firestore (with UID-enforced security rules)
- **Alternative Backend**: Python 3.10+ Flask (`backend/app.py`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: Version 18.x or 20.x+
- **Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/your-username/cyber-kawach.git
cd cyber-kawach
npm install
```

### 3. Environment Configuration

Copy the example environment template to create your local `.env`:

```bash
cp .env.example .env
```

Open `.env` in your editor and configure your secrets:

```ini
# Google Gemini API Key (Required for AI detection)
GEMINI_API_KEY="your_gemini_api_key_here"

# Server Port (Default: 3000)
PORT=3000
```

> **IMPORTANT**: Never commit your `.env` file to a public git repository. It is ignored by `.gitignore` by default.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🔒 Security Architecture

1. **Server-Side Secret Isolation**:
   - The `GEMINI_API_KEY` is loaded exclusively inside the Node.js Express server (`server.ts` / `server/analyzer/aiAnalyzer.ts`).
   - Browser-facing JavaScript bundles NEVER receive, reference, or bundle the Gemini API key.
2. **Untrusted Input Isolation**:
   - All user-submitted payloads (emails, messages, links) are isolated within strict containment wrappers (`<<<UNTRUSTED_CONTENT>>>`) to prevent prompt injection and instruction override attacks.
3. **Owner-Partitioned Database Security**:
   - Firestore security rules (`firestore.rules`) strictly enforce that users can read, create, or delete only their own scan history and quiz attempts (`request.auth.uid == userId`).
   - Private scan records are never accessible to other authenticated users or anonymous visitors.
4. **Data Sanitization & Redaction**:
   - Payment card numbers, email addresses, and numerical codes are redacted before audit records or preview logs are saved.

---

## 🧪 Testing & Verification

- **Lint and TypeScript Compilation**:
  ```bash
  npm run lint
  ```
- **Verify Production Build**:
  ```bash
  npm run build
  ```
- **Test Heuristic Fallback**:
  Unset or leave `GEMINI_API_KEY` blank in `.env` to verify that the heuristic rule engine analyzes payloads offline without crashing.

---

## 📄 License

This project is licensed under the MIT License.
