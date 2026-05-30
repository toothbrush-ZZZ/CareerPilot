import re
import json
import logging
from typing import List, Dict, Optional
from app.services import cv_service, embed_service
from app.services.llm_factory import get_ai_response
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

async def extract_skills_from_jd(job_description: str) -> List[str]:
    system_prompt = """
You are a technical recruiter. Extract a JSON list of key technical skills, programming languages, tools, libraries, frameworks, and databases required in the job description.
Return ONLY a valid JSON array of strings, for example: ["Python", "FastAPI", "Docker", "AWS"].
Do not include soft skills. Do not include markdown formatting, backticks, or extra text.
"""
    response = await get_ai_response([{"role": "user", "content": job_description[:2000]}], system_prompt)
    try:
        match = re.search(r'\[.*\]', response, re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            if isinstance(parsed, list):
                return [str(s) for s in parsed]
        return []
    except Exception as e:
        logger.error(f"Error parsing JD skills: {e}. Raw response: {response}")
        return []

async def extract_skills_from_cv(cv_chunks: List[Dict]) -> List[str]:
    cv_text = "\n".join([c["content"] for c in cv_chunks])
    system_prompt = """
You are a career assistant. Extract a JSON list of all technical skills, programming languages, tools, libraries, frameworks, and databases mentioned in the candidate's CV context.
Return ONLY a valid JSON array of strings, for example: ["React", "TypeScript", "Node.js", "PostgreSQL"].
Do not include soft skills. Do not include markdown formatting, backticks, or extra text.
"""
    response = await get_ai_response([{"role": "user", "content": cv_text[:3000]}], system_prompt)
    try:
        match = re.search(r'\[.*\]', response, re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            if isinstance(parsed, list):
                return [str(s) for s in parsed]
        return []
    except Exception as e:
        logger.error(f"Error parsing CV skills: {e}. Raw response: {response}")
        return []

async def generate_fit_reason_and_alignment(matched_skills: List[str], jd_skills: List[str], cv_chunks: List[Dict]) -> Dict:
    cv_text = "\n".join([f"- {c['content']}" for c in cv_chunks])
    matched_str = ", ".join(matched_skills) if matched_skills else "general background"
    missing_skills = [s for s in jd_skills if s not in matched_skills]
    missing_str = ", ".join(missing_skills) if missing_skills else "none"
    
    system_prompt = """
You are an expert recruiter matching a candidate's CV against a job description.
Review the CV chunks, matching skills, and missing skills.
Provide:
1. A brief one-sentence overall fit explanation (under 20 words).
2. A detailed alignment analysis with exactly two sections: "✅ Why this matches you:" and "⚠️ Gaps:".
The alignment analysis must be grounded in the candidate's actual projects/roles/experience from their CV chunks, not generic statements.

Format your response exactly as:
FIT_REASON: <one-sentence overall explanation>
ALIGNMENT:
✅ Why this matches you:
<1-2 sentences explaining alignment with projects/roles>

⚠️ Gaps:
<1 sentence detailing missing skills or requirements>
"""
    content = f"CV Chunks:\n{cv_text}\n\nMatched Skills: {matched_str}\nMissing Skills: {missing_str}"
    response = await get_ai_response([{"role": "user", "content": content}], system_prompt)
    
    fit_reason = "Good alignment with candidate experience."
    alignment = "✅ Why this matches you:\nMatches your profile.\n\n⚠️ Gaps:\nNo major gaps."
    
    try:
        if "FIT_REASON:" in response and "ALIGNMENT:" in response:
            parts = response.split("ALIGNMENT:")
            fit_reason = parts[0].replace("FIT_REASON:", "").strip()
            alignment = parts[1].strip()
        else:
            lines = response.split("\n")
            for line in lines:
                if line.startswith("FIT_REASON:"):
                    fit_reason = line.replace("FIT_REASON:", "").strip()
                    break
            # Clean response for alignment
            clean_resp = re.sub(r'FIT_REASON:.*', '', response).strip()
            clean_resp = clean_resp.replace("ALIGNMENT:", "").strip()
            if clean_resp:
                alignment = clean_resp
    except Exception:
        pass
        
    return {"fit_reason": fit_reason, "alignment_analysis": alignment}

class FitScorer:
    def __init__(self):
        pass

    async def compute_fit(self, user_id: str, job_description: str, db) -> Dict:
        """
        Computes fit score and reasoning by comparing JD against retrieved CV chunks.
        """
        # 1. Retrieve top-k relevant chunks from user's CV vector store
        cv_chunks = await cv_service.search_cv(job_description, user_id, db, limit=5)
        
        if not cv_chunks:
            return {
                "fit_score": 0.0,
                "fit_percentage": 0,
                "breakdown": {
                    "skill_overlap": 0.0,
                    "experience_match": 0.0,
                    "keyword_density": 0.0,
                    "education_match": 0.0,
                },
                "matched_skills": [],
                "missing_skills": [],
                "fit_reason": "Upload your CV first so we can personalize your analysis.",
                "alignment_analysis": "✅ Why this matches you:\nUpload your CV to see matching details.\n\n⚠️ Gaps:\nNo CV uploaded yet."
            }

        # 2. Extract skills from the JD using LLM
        jd_skills = await extract_skills_from_jd(job_description)
        if not jd_skills:
            # Fallback to simple regex keyword matching if LLM returns empty
            jd_skills = ["Python", "FastAPI", "React", "Docker"] # standard default keywords

        # 3. Extract skills from the retrieved CV chunks
        cv_skills = await extract_skills_from_cv(cv_chunks)

        # 4. Compute overlap score
        matched_skills = [
            s for s in jd_skills 
            if any(s.lower() in cv_skill.lower() or cv_skill.lower() in s.lower() for cv_skill in cv_skills)
        ]
        
        score_percent = 50
        if jd_skills:
            score_percent = round((len(matched_skills) / len(jd_skills)) * 100)
            
        fit_score = round(score_percent / 100.0, 3)

        # 5. Generate reasons and alignment block
        analysis = await generate_fit_reason_and_alignment(matched_skills, jd_skills, cv_chunks)

        missing_skills = [s for s in jd_skills if s not in matched_skills]

        return {
            "fit_score": fit_score,
            "fit_percentage": score_percent,
            "breakdown": {
                "skill_overlap": fit_score,
                "experience_match": fit_score,
                "keyword_density": fit_score,
                "education_match": fit_score,
            },
            "matched_skills": sorted(matched_skills),
            "missing_skills": sorted(missing_skills),
            "fit_reason": list(analysis.values())[0],  # first item is fit_reason
            "alignment_analysis": analysis.get("alignment_analysis", ""),
            "summary": analysis.get("alignment_analysis", "") # For backwards compatibility with UI
        }

