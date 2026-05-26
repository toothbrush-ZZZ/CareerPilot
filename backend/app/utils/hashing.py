import hashlib

def get_md5(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()

def cache_key_profile(user_id: str) -> str:
    return f"profile:{user_id}"

def cache_key_embed(user_id: str) -> str:
    return f"embed:{user_id}"

def cache_key_jobs(query: str, location: str) -> str:
    return f"jobs:{get_md5(query.lower() + (location or '').lower())}"

def cache_key_fit(user_id: str, jd_text: str) -> str:
    return f"fit:{user_id}:{get_md5(jd_text[:500])}"

def cache_key_session(user_id: str, session_id: str) -> str:
    return f"session:{user_id}:{session_id}"
