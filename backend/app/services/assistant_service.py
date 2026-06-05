import os
from groq import AsyncGroq
from typing import List, Optional

_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are CareerPilot, an expert AI career co-pilot.
You have been given the user's CV context. Use it as the single source of truth.
Never invent or hallucinate the user's experience, skills, or background.

When a job posting is also provided, ground ALL responses in both the CV and the JD:
- Readiness checks: compare CV skills/experience directly against JD requirements
- Skill gap analysis: identify what the JD requires that the CV doesn't show
- Cover letters: reference specific CV experiences relevant to the JD
- Roadmaps: tailor learning plan to close the gap between CV and JD

When no job posting is provided, answer based on CV context and general career advice.

You help with:
- Job readiness checks ("Am I ready for X?") — verdict with reasoning from CV vs JD
- Skill gap analysis ("What am I missing?") — CV vs JD or vs benchmark role
- Learning roadmaps ("Build me a 3-month plan") — structured weekly plan with resources
- Cover letter drafting ("Draft a cover letter") — references actual CV experience + JD
- General career advice

Keep responses clear, structured, and actionable."""


async def chat(
    user_message: str,
    cv_context: str,
    history: List[dict],
    job_context: Optional[str] = None,
) -> str:
    context_block = f"USER CV CONTEXT:\n{cv_context}"
    if job_context:
        context_block += f"\n\nJOB POSTING:\n{job_context}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context_block},
        {"role": "assistant", "content": "I've reviewed your profile. How can I help?"},
        *history,
        {"role": "user", "content": user_message},
    ]

    response = await _client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1000,
        temperature=0.7,
    )
    return response.choices[0].message.content
