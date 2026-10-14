"""Rule-based pattern matching and scam categorization engine."""

import re
from typing import Dict, Any, List

RULES: List[Dict[str, Any]] = [
    {
        "id": "BANK_ACCOUNT_BLOCKED",
        "name": "Bank Account Block Threat",
        "pattern": re.compile(r"(account\s*(will\s*be|is)\s*(blocked|suspended|freez|deactivat)|deactivated\s*within|suspend\s*your\s*account)", re.I),
        "weight": 35,
        "indicator": "Immediate threat of bank account block or suspension",
        "recommendation": "Never click links in account suspension warnings; verify directly through your official banking app.",
        "scam_type": "Banking Impersonation & Phishing"
    },
    {
        "id": "KYC_PAN_AADHAAR",
        "name": "KYC / PAN / Aadhaar Expiry Threat",
        "pattern": re.compile(r"(kyc\s*(pending|expired|verification|update)|pan\s*card\s*(blocked|linked)|aadhaar\s*(linked|update)|complete\s*your\s*kyc)", re.I),
        "weight": 35,
        "indicator": "Demands urgent KYC or PAN/Aadhaar compliance via unofficial link",
        "recommendation": "Banks and financial entities never ask to update KYC via external SMS or WhatsApp links.",
        "scam_type": "Fake KYC Phishing"
    },
    {
        "id": "URGENT_DEADLINE",
        "name": "Artificial Urgency Deadline",
        "pattern": re.compile(r"(immediately|within\s*24\s*hours|urgent|action\s*required|before\s*(today|midnight|tonight)|last\s*warning)", re.I),
        "weight": 20,
        "indicator": "High-pressure urgency tactics pushing for unthinking immediate reaction",
        "recommendation": "Scammers exploit psychological panic. Take a breath and independently verify."
    },
    {
        "id": "UPI_COLLECT_FRAUD",
        "name": "UPI / QR Code Fraud Attempt",
        "pattern": re.compile(r"(scan\s*qr\s*(to\s*receive|and\s*get)|enter\s*upi\s*pin\s*to\s*receive|send\s*money\s*request|collect\s*request|payment\s*of\s*rs)", re.I),
        "weight": 45,
        "indicator": "UPI PIN / QR code exploit (You NEVER enter a PIN to receive money)",
        "recommendation": "Entering your UPI PIN or scanning a QR code ALWAYS transfers money OUT of your account.",
        "scam_type": "UPI Fraud"
    },
    {
        "id": "OTP_CREDENTIAL_THEFT",
        "name": "OTP or Password Demands",
        "pattern": re.compile(r"(share\s*(otp|one\s*time\s*password|pin|cvv|password)|send\s*the\s*code|verify\s*otp|forward\s*sms)", re.I),
        "weight": 45,
        "indicator": "Explicit request for sensitive authentication secrets (OTP, PIN, CVV)",
        "recommendation": "Never share OTPs, CVVs, or PINs with anyone, even if they claim to be bank officials or police.",
        "scam_type": "Credential & OTP Harvesting"
    },
    {
        "id": "LOTTERY_PRIZE_FRAUD",
        "name": "Fake Lottery / Cash Prize Claim",
        "pattern": re.compile(r"(congratulations|you\s*have\s*won|won\s*(a\s*prize|lucky\s*draw|lottery|crores?|lakhs?)|claim\s*(your\s*reward|prize))", re.I),
        "weight": 35,
        "indicator": "Unsolicited notification claiming unexpected lottery or prize jackpot",
        "recommendation": "If you did not enter a contest, you did not win. Do not pay any processing or tax fee.",
        "scam_type": "Advance-Fee Lottery Scam"
    },
    {
        "id": "ELECTRICITY_DISCONNECTION",
        "name": "Electricity / Utility Cut-off Scam",
        "pattern": re.compile(r"(electricity\s*power\s*will\s*be\s*disconnect|power\s*will\s*be\s*disconnected\s*tonight|electricity\s*officer|bill\s*unpaid)", re.I),
        "weight": 40,
        "indicator": "Fraudulent utility disconnection alert prompting calls to a fake officer number",
        "recommendation": "Utility providers do not send disconnection threats via mobile phone numbers with personal contact numbers.",
        "scam_type": "Utility Disconnection Scam"
    },
    {
        "id": "JOB_TASK_FRAUD",
        "name": "Part-Time / Telegram Task Scam",
        "pattern": re.compile(r"(part[\s-]time\s*job|earn\s*(daily|\$|\u20B9)\s*\d+|like\s*youtube\s*videos|telegram\s*(task|group)|work\s*from\s*home\s*earn)", re.I),
        "weight": 35,
        "indicator": "High-payout easy work-from-home or Telegram task scheme",
        "recommendation": "Legitimate employers never require payment for registration, crypto deposit, or prepaid tasks.",
        "scam_type": "Part-Time Task / Employment Fraud"
    },
    {
        "id": "REMOTE_ACCESS_APP",
        "name": "Remote Access Tool Installation",
        "pattern": re.compile(r"(install\s*(anydesk|teamviewer|rustdesk|quicksupport)|download\s*app\s*for\s*support)", re.I),
        "weight": 50,
        "indicator": "Coercing victim to install screen-sharing or remote desktop applications",
        "recommendation": "Never install AnyDesk, TeamViewer, or QuickSupport on instructions from callers or message senders.",
        "scam_type": "Remote Device Hijacking"
    },
    {
        "id": "DIGITAL_ARREST_POLICE",
        "name": "Digital Arrest / Legal Coercion",
        "pattern": re.compile(r"(digital\s*arrest|cyber\s*crime\s*department|cbi|customs\s*officer|courier\s*drugs|arrest\s*warrant|supreme\s*court)", re.I),
        "weight": 50,
        "indicator": "Intimidation using fake law enforcement, 'Digital Arrest', or customs drug parcel claims",
        "recommendation": "Police, CBI, and Customs never conduct video call interrogations or demand money to clear charges.",
        "scam_type": "Digital Arrest & Authority Impersonation"
    }
]

def evaluate_rules(text: str) -> List[Dict[str, Any]]:
    matches = []
    for rule in RULES:
        if rule["pattern"].search(text):
            matches.append(rule)
    return matches
