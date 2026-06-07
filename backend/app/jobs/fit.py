import os
import json
import re
from app.core.config import get_settings
from app.core.llm import chat
from typing import List

settings = get_settings()


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

    try:
        raw_response = await chat(
            messages=[{"role": "user", "content": prompt}],
            json_mode=True,
            max_tokens=400,
            temperature=0.2,
        )
    except Exception as e:
        print(f"[fit] LLM error during compute_fit: {e}")
        raw_response = '{"matched_skills": [], "missing_skills": [], "reasoning": "Fit analysis currently unavailable due to AI rate limits."}'

    raw = re.sub(r"```json|```", "", raw_response).strip()

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
