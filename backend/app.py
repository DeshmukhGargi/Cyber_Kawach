"""Cyber Kawach - Flask REST API Backend."""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from analyzer.validators import validate_analysis_request
from analyzer.ai_analyzer import analyze_with_gemini_python

load_dotenv()

app = Flask(__name__)
# Configure CORS
allowed_origin = os.getenv("ALLOWED_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": allowed_origin}})

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Cyber Kawach Flask Backend",
        "version": "1.0.0",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    })

@app.route("/api/threat-intelligence", methods=["GET"])
def get_threat_intelligence():
    """Returns real-time threat intelligence and vulnerability advisories."""
    import urllib.request
    import xml.etree.ElementTree as ET
    import re

    items = []
    try:
        req = urllib.request.Request(
            "https://feeds.feedburner.com/TheHackersNews",
            headers={"User-Agent": "CyberKawach/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            tree = ET.fromstring(response.read())
            for item in tree.findall(".//item")[:10]:
                title = item.findtext("title", "")
                link = item.findtext("link", "")
                desc = item.findtext("description", "")
                pub_date = item.findtext("pubDate", "")
                clean_desc = re.sub(r"<[^>]+>", "", desc).strip()
                items.append({
                    "id": f"thn-{len(items)}",
                    "title": title,
                    "summary": clean_desc[:220] + "..." if len(clean_desc) > 220 else clean_desc,
                    "source": "The Hacker News",
                    "source_url": link,
                    "category": "phishing" if "phishing" in (title + clean_desc).lower() else "news",
                    "published_at": pub_date,
                    "severity": "Critical" if any(w in (title + clean_desc).lower() for w in ["critical", "zero-day", "ransomware"]) else "High",
                    "tags": ["Cyber Threat", "Intelligence"]
                })
    except Exception as e:
        app.logger.warning(f"Failed to fetch remote feed: {e}")

    if not items:
        items = [{
            "id": "thn-fallback",
            "title": "Global Cyber Alert: Active Phishing Exploiting Fake Bank Portals",
            "summary": "Security agencies detect widespread credential-harvesting campaigns using SMS and messaging lures.",
            "source": "CERT Intelligence",
            "source_url": "https://cybercrime.gov.in",
            "category": "phishing",
            "published_at": "Today",
            "severity": "Critical",
            "tags": ["Phishing", "Financial Security"]
        }]

    return jsonify({
        "success": True,
        "total": len(items),
        "items": items
    })

@app.route("/api/analyze", methods=["POST"])
def analyze_content():
    payload = request.get_json(silent=True)
    is_valid, error_msg, sanitized_data = validate_analysis_request(payload)

    if not is_valid:
        return jsonify({
            "success": False,
            "error": error_msg
        }), 400

    try:
        result = analyze_with_gemini_python(sanitized_data)
        return jsonify(result), 200
    except Exception as e:
        app.logger.error(f"Analysis processing error: {e}")
        return jsonify({
            "success": False,
            "error": "Security evaluation failed due to an internal server error."
        }), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
