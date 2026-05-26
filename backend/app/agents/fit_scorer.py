import re
import numpy as np
import httpx
from typing import List, Dict, Set, Optional
from app.services import cv_service, embed_service
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)

settings = get_settings()

# Skill keyword bank
TECH_SKILLS = {
    "python", "javascript", "typescript", "java", "c++", "sql", "r",
    "machine learning", "deep learning", "nlp", "computer vision",
    "react", "next.js", "fastapi", "django", "flask", "node.js",
    "docker", "kubernetes", "aws", "gcp", "azure", "linux",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "git", "agile", "scrum", "rest api", "graphql", "postgresql",
    "mongodb", "redis", "elasticsearch", "spark", "hadoop",
    "data analysis", "data engineering", "mlops", "devops",
}

def _section_text(chunks: List[Dict], *keywords: str) -> str:
    """Match CV chunks by section header keywords (e.g. WORK EXPERIENCE, TECHNICAL SKILLS)."""
    parts = []
    for c in chunks:
        sec = (c.get("section") or "").upper()
        if any(kw in sec for kw in keywords):
            parts.append(c["content"])
    return " ".join(parts)


class FitScorer:
    def __init__(self):
        pass

    async def _get_embedding(self, text: str) -> Optional[List[float]]:
        """Get embedding from central embed service."""
        try:
            return await embed_service.embed_one(text[:2000])
        except Exception as e:
            logger.error(f"Embedding error in FitScorer for text '{text[:50]}...': {e}")
        return None

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        """Compute cosine similarity between two vectors."""
        if not v1 or not v2: return 0.0
        vec1 = np.array(v1)
        vec2 = np.array(v2)
        dot = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0: return 0.0
        return float(dot / (norm1 * norm2))

    async def compute_fit(self, user_id: str, job_description: str, db) -> Dict:
        """
        Computes a deterministic fit score using a weighted formula.
        TOTAL SCORE = (skill_overlap × 0.40) + (experience_match × 0.30) + 
                      (keyword_density × 0.20) + (education_match × 0.10)
        """
        chunks = await cv_service.get_cv_chunks(user_id, db)
        
        cv_skills_text = _section_text(chunks, "SKILL", "TECHNOLOG")
        cv_exp_text = _section_text(chunks, "EXPERIENCE", "EMPLOYMENT", "WORK")
        cv_edu_text = _section_text(chunks, "EDUCATION", "ACADEMIC")
        cv_proj_text = _section_text(chunks, "PROJECT", "PORTFOLIO")
        cv_full_text = " ".join([c["content"] for c in chunks])

        jd_skills = self._extract_skills(job_description)
        cv_skills = self._extract_skills(cv_skills_text + " " + cv_exp_text + " " + cv_proj_text)

        skill_score = self._skill_overlap(jd_skills, cv_skills)
        
        # Refactored experience match to use remote embedding
        exp_score = await self._experience_match(job_description, cv_exp_text)
        
        kw_score = self._keyword_density(job_description, cv_full_text)
        edu_score = self._education_match(job_description, cv_edu_text)

        total = (skill_score * 0.40) + (exp_score * 0.30) + (kw_score * 0.20) + (edu_score * 0.10)
        
        matched_skills = list(jd_skills & cv_skills)
        missing_skills = list(jd_skills - cv_skills)

        return {
            "fit_score": round(total, 3),
            "fit_percentage": int(total * 100),
            "breakdown": {
                "skill_overlap": round(skill_score, 3),
                "experience_match": round(exp_score, 3),
                "keyword_density": round(kw_score, 3),
                "education_match": round(edu_score, 3),
            },
            "matched_skills": sorted(matched_skills),
            "missing_skills": sorted(missing_skills),
            "fit_reason": self._generate_reason(total, matched_skills, missing_skills)
        }

    def _extract_skills(self, text: str) -> Set[str]:
        if not text: return set()
        text = text.lower()
        found = set()
        for skill in TECH_SKILLS:
            if re.search(rf'\b{re.escape(skill)}\b', text):
                found.add(skill)
        return found

    def _skill_overlap(self, jd_skills: Set[str], cv_skills: Set[str]) -> float:
        if not jd_skills: return 0.5
        overlap = len(jd_skills & cv_skills)
        return min(overlap / len(jd_skills), 1.0)

    async def _experience_match(self, job_desc: str, cv_exp: str) -> float:
        if not cv_exp or not job_desc: return 0.0
        
        # Get embeddings from internal service
        jd_emb = await self._get_embedding(job_desc)
        cv_emb = await self._get_embedding(cv_exp)
        
        if not jd_emb or not cv_emb:
            return 0.5 # Default if service fails
            
        sim = self._cosine_similarity(jd_emb, cv_emb)
        # Scale score: 0.3 similarity is baseline 0, 0.8+ is 1.0
        score = (sim - 0.3) / 0.5 
        return max(0.0, min(1.0, score))

    def _keyword_density(self, job_desc: str, cv_full: str) -> float:
        if not job_desc: return 0.0
        keywords = set(re.findall(r'\b[a-z]{5,}\b', job_desc.lower()))
        if not keywords: return 0.0
        
        found = 0
        cv_lower = cv_full.lower()
        for kw in keywords:
            if kw in cv_lower:
                found += 1
        return min(found / len(keywords), 1.0)

    def _education_match(self, job_desc: str, cv_edu: str) -> float:
        jd_lower = job_desc.lower()
        cv_lower = cv_edu.lower()
        
        req_phd = "phd" in jd_lower or "doctorate" in jd_lower
        req_masters = "master" in jd_lower or "msc" in jd_lower or "mba" in jd_lower
        req_bachelors = "bachelor" in jd_lower or "bsc" in jd_lower or "degree" in jd_lower
        
        has_phd = "phd" in cv_lower or "doctorate" in cv_lower
        has_masters = "master" in cv_lower or "msc" in cv_lower or "mba" in cv_lower
        has_bachelors = "bachelor" in cv_lower or "bsc" in cv_lower or "degree" in cv_lower
        
        if req_phd: return 1.0 if has_phd else 0.4
        if req_masters: return 1.0 if (has_phd or has_masters) else 0.5
        if req_bachelors: return 1.0 if (has_phd or has_masters or has_bachelors) else 0.6
        
        return 0.5

    def _generate_reason(self, score: float, matched: List[str], missing: List[str]) -> str:
        top_matched = ", ".join(matched[:3]) if matched else "relevant keywords"
        top_missing = ", ".join(missing[:3]) if missing else "specific niche skills"
        
        if score >= 0.8:
            return f"Excellent match! Your profile aligns strongly with the requirements, especially in {top_matched}."
        if score >= 0.6:
            return f"Good fit. You have solid experience in {top_matched}, though adding {top_missing} would make you a top candidate."
        if score >= 0.4:
            return f"Fair match. You bring {top_matched} to the table, but there are notable gaps in {top_missing}."
        return f"Low match. This role requires technical depth in {top_missing} which isn't prominent in your profile yet."
