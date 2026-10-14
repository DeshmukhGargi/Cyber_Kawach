"""URL Security Heuristics Analyzer for Cyber Kawach."""

from urllib.parse import urlparse
import re
from typing import Dict, Any, List

SUSPICIOUS_TLDS = {
    'xyz', 'top', 'work', 'click', 'loan', 'zip', 'mov', 'country', 'stream',
    'download', 'racing', 'accountant', 'gq', 'cf', 'tk', 'ml', 'ga', 'buzz',
    'rest', 'fit', 'party', 'date', 'faith', 'cricket', 'win', 'men'
}

SHORTENER_DOMAINS = {
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 'ow.ly',
    'rb.gy', 'cutt.ly', 'shorturl.at', 'bl.ink', 'v.gd', 'qr.ae'
}

SUSPICIOUS_KEYWORDS = [
    'login', 'verify', 'verification', 'update', 'kyc', 'pan', 'aadhaar',
    'secure', 'account', 'banking', 'sbi', 'hdfc', 'icici', 'otp', 'free',
    'reward', 'lottery', 'jackpot', 'prize', 'bonus', 'claim', 'refund',
    'wallet', 'gift', 'password', 'signin', 'support', 'helpdesk', 'unblock',
    'suspend', 'confirm', 'security', 'billing', 'urgent', 'portal', 'auth'
]

IP_REGEX = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")

def analyze_url_heuristics(raw_url: str) -> Dict[str, Any]:
    """
    Performs passive heuristic analysis on a target URL without executing or visiting it.
    """
    clean_url = raw_url.strip()
    if not clean_url.startswith(('http://', 'https://')):
        clean_url = 'https://' + clean_url

    try:
        parsed = urlparse(clean_url)
        protocol = parsed.scheme if parsed.scheme in ('http', 'https') else 'unknown'
        domain = parsed.hostname.lower() if parsed.hostname else ''
        pathname = parsed.path.lower()
        query = parsed.query.lower()
        port = parsed.port
    except Exception:
        protocol = 'unknown'
        domain = clean_url.split('/')[0].lower()
        pathname = ''
        query = ''
        port = None

    is_ip = bool(IP_REGEX.match(domain))
    domain_parts = domain.split('.')
    tld = domain_parts[-1] if len(domain_parts) > 1 else ''
    has_suspicious_tld = tld in SUSPICIOUS_TLDS
    has_url_shortener = domain in SHORTENER_DOMAINS
    subdomain_count = max(0, len(domain_parts) - 2)

    full_target = f"{domain}{pathname}{query}"
    keywords_found = [kw for kw in SUSPICIOUS_KEYWORDS if kw in full_target]

    has_unusual_chars = bool(re.search(r"[@%_~]|(\.\.)|xn--", domain))
    has_custom_port = bool(port and port not in (80, 443))

    score = 0
    if protocol == 'http':
        score += 25
    if is_ip:
        score += 45
    if has_suspicious_tld:
        score += 30
    if has_url_shortener:
        score += 25
    if subdomain_count >= 3:
        score += 20
    if has_unusual_chars:
        score += 20
    if has_custom_port:
        score += 15
    score += min(35, len(keywords_found) * 10)

    heuristic_risk_score = max(0, min(100, score))

    return {
        "protocol": protocol,
        "is_ip_address": is_ip,
        "has_suspicious_tld": has_suspicious_tld,
        "tld": tld,
        "domain": domain,
        "has_url_shortener": has_url_shortener,
        "subdomain_count": subdomain_count,
        "suspicious_keywords_found": list(set(keywords_found)),
        "has_unusual_characters": has_unusual_chars,
        "has_port": has_custom_port,
        "heuristic_risk_score": heuristic_risk_score
    }
