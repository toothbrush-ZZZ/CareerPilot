import os
import json
import re
from groq import AsyncGroq
from typing import List

_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))


async def compute_fit(job: dict, cv_chunks: List[str]) -> dict:
    cv_context = "\n\n".join(cv_chunks)

    prompt = f"""You are a career coach evaluating candidate-job fit.

CANDIDATE CV (excerpts):
{cv_context}

JOB POSTING:
Title: {job.get('title', '')}
Company: {job.get('company', '')}
Description: {job.get('description', '')}

Analyze the skills required for the job and the skills present in the candidate's CV.
Respond ONLY with valid JSON, no markdown fences, no preamble:
{{
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "reasoning": "<2 sentences explaining the match based on skills>"
}}"""

    response = await _client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=400,
        temperature=0.2,
    )

    raw = re.sub(r"```json|```", "", response.choices[0].message.content).strip()

    try:
        data = json.loads(raw)
        matched = data.get("matched_skills", [])
        missing = data.get("missing_skills", [])
        total = len(matched) + len(missing)
        
        # Compute programmatically
        score = int((len(matched) / total) * 100) if total > 0 else 0
        data["score"] = score
        return data
    except json.JSONDecodeError:
        return {
            "score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "reasoning": "Could not parse fit score. Please try again.",
        }
