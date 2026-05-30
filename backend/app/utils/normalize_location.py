import re

LOCATION_ALIASES = {
    # Dhaka variants
    "dhaka": "Dhaka",
    "dhaka-1": "Dhaka",
    "dhaka-1230": "Dhaka",
    "dhaka 1230": "Dhaka",
    "dhaka, 1230": "Dhaka",
    "dhaka city": "Dhaka",
    "daka": "Dhaka",
    # Chittagong variants
    "chittagong": "Chittagong",
    "chattogram": "Chittagong",
    "ctg": "Chittagong",
}

def to_title_case(s: str) -> str:
    return re.sub(r'\w\S*', lambda m: m.group(0)[0].upper() + m.group(0)[1:].lower() if len(m.group(0)) > 0 else '', s)

def normalize_location(raw: str) -> str:
    if not raw:
        return None
    cleaned = raw.strip()
    
    # Remove postal codes (patterns like 1230, 1234, etc.)
    cleaned = re.sub(r'\b\d{3,5}\b', '', cleaned)
    # Remove hyphenated postal codes (like Dhaka-1230)
    cleaned = re.sub(r'-\d{3,5}', '', cleaned)
    # Clean up extra spaces and commas
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    key = cleaned.lower()
    if key in LOCATION_ALIASES:
        return LOCATION_ALIASES[key]
    return to_title_case(cleaned)
