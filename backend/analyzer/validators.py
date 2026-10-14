"""Input validation utilities for Cyber Kawach Backend."""

from typing import Tuple, Optional, Dict, Any

SUPPORTED_TYPES = {"email", "whatsapp", "sms", "url"}
MAX_CONTENT_LENGTH = 10000

def validate_analysis_request(data: Any) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Validates the incoming analysis request.
    Returns: (is_valid, error_message, sanitized_data)
    """
    if not isinstance(data, dict):
        return False, "Request payload must be a valid JSON object.", None

    content_type = data.get("type")
    content = data.get("content")
    subject = data.get("subject")

    if not content_type or not isinstance(content_type, str):
        return False, "Missing or invalid 'type' parameter. Expected: email, whatsapp, sms, url", None

    content_type = content_type.lower().strip()
    if content_type not in SUPPORTED_TYPES:
        return False, f"Unsupported content type '{content_type}'. Must be one of {', '.join(SUPPORTED_TYPES)}", None

    if not content or not isinstance(content, str) or not content.strip():
        return False, "Content field cannot be empty. Please provide text or URL to analyze.", None

    content = content.strip()
    if len(content) > MAX_CONTENT_LENGTH:
        return False, f"Content length ({len(content)}) exceeds maximum limit of {MAX_CONTENT_LENGTH} characters.", None

    sanitized = {
        "type": content_type,
        "content": content,
        "subject": subject.strip() if isinstance(subject, str) else None
    }

    return True, None, sanitized
