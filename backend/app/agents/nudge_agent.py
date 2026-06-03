import os
from datetime import datetime, timedelta
from groq import Groq
from typing import List, Optional

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def should_nudge(last_application_date: Optional[datetime]) -> bool:
    if last_application_date is None:
        return True
    return datetime.utcnow() - last_application_date > timedelta(days=7)


def generate_nudge(cv_summary: str, recent_jobs: List[dict]) -> str:
    job_list = "\n".join(
        f"- {j['title']} at {j['company']} ({j['location']})"
        for j in recent_jobs[:3]
    )

    profile_context = f"\nUser profile summary: {cv_summary[:300]}\n" if cv_summary else ""
    
    prompt = f"""You are CareerPilot. The user hasn't applied to any jobs this week.
Write a brief, encouraging nudge (2-3 sentences max) reminding them to apply,
and mention these specific openings that match their profile:

{job_list}
{profile_context}
Be warm and motivating, not naggy."""

    response = _client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.8,
    )
    return response.choices[0].message.content
