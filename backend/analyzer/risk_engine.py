"""Risk scoring and classification engine for Cyber Kawach."""

from typing import Dict, Any, List
from .rules import evaluate_rules
from .url_analyzer import analyze_url_heuristics

def calculate_heuristic_risk(content_type: str, content: str, subject: str = None) -> Dict[str, Any]:
    full_text = f"{subject + ' ' if subject else ''}{content}"
    matched_rules = evaluate_rules(full_text)

    url_details = None
    if content_type == 'url':
        url_details = analyze_url_heuristics(content.strip())
    elif "http://" in full_text or "https://" in full_text:
        import re
        urls = re.findall(r"https?://[^\s]+", full_text)
        if urls:
            url_details = analyze_url_heuristics(urls[0])

    total_weight = sum(r["weight"] for r in matched_rules)
    if url_details:
        total_weight += int(url_details["heuristic_risk_score"] * 0.45)

    final_score = max(0, min(100, total_weight))
    if not matched_rules and (not url_details or url_details["heuristic_risk_score"] < 20):
        final_score = min(15, 8 if len(full_text) > 0 else 0)

    # Thresholds:
    # 0 - 25: SAFE
    # 26 - 50: MODERATE
    # 51 - 80: SCAM
    # 81 - 100: DO NOT TOUCH
    if final_score <= 25:
        category = "SAFE"
        threat_level = "Low"
        scam_type = "Low Risk Communication"
    elif final_score <= 50:
        category = "MODERATE"
        threat_level = "Moderate"
        scam_type = "Potential Unsolicited / Ambiguous Outreach"
    elif final_score <= 80:
        category = "SCAM"
        threat_level = "High"
        scam_type = next((r["scam_type"] for r in matched_rules if "scam_type" in r), "Suspected Phishing / Social Engineering")
    else:
        category = "DO NOT TOUCH"
        threat_level = "Extremely High"
        scam_type = next((r["scam_type"] for r in matched_rules if "scam_type" in r), "High Threat Phishing / Financial Coercion")

    indicators = [r["indicator"] for r in matched_rules]
    if url_details and url_details["heuristic_risk_score"] > 30:
        if url_details["has_suspicious_tld"]:
            indicators.append(f"Domain uses high-risk suspicious TLD (.{url_details['tld']})")
        if url_details["has_url_shortener"]:
            indicators.append("URL is concealed behind a URL shortening redirection service")
        if url_details["is_ip_address"]:
            indicators.append("Host is a raw numeric IP address rather than a registered domain")
        if url_details["suspicious_keywords_found"]:
            indicators.append(f"URL contains deceptive keywords: {', '.join(url_details['suspicious_keywords_found'][:3])}")

    recommendations = []
    for r in matched_rules:
        rec = r.get("recommendation")
        if rec and rec not in recommendations:
            recommendations.append(rec)

    if not recommendations:
        recommendations.append("Verify unsolicited requests through official verified channels.")
        recommendations.append("Never share OTPs, CVVs, or passwords with anyone.")

    if category == "SAFE":
        explanation = "No significant scam or phishing indicators were detected in this communication."
    elif category == "MODERATE":
        explanation = "This message exhibits some suspicious characteristics such as unsolicited contact or informal phrasing."
    elif category == "SCAM":
        explanation = f"Strong indicators of fraudulent activity were detected matching {scam_type} patterns."
    else:
        explanation = "CRITICAL ALERT: This message contains severe indicators of credential theft, financial coercion, or account takeover."

    return {
        "success": True,
        "type": content_type,
        "risk_score": final_score,
        "category": category,
        "threat_level": threat_level,
        "scam_type": scam_type,
        "indicators": indicators if indicators else ["No obvious scam indicators identified"],
        "explanation": explanation,
        "recommendations": recommendations[:4],
        "uncertainty": "Heuristic evaluation provides pattern matching. Official sender verification is always recommended.",
        "url_details": url_details
    }
