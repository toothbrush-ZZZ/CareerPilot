import asyncio
from typing import List, Dict, Optional
from app.jobs.remotive import RemotiveClient
from app.jobs.arbeitnow import ArbeitnowClient
from app.jobs.scraper import JobScraper
from app.agents.fit_scorer import FitScorer
from app.utils.hashing import cache_key_jobs
from app.core import redis
import logging
import re

logger = logging.getLogger(__name__)

class JobHunterAgent:
    def __init__(self):
        self.remotive = RemotiveClient()
        self.arbeitnow = ArbeitnowClient()
        self.scraper = JobScraper()
        self.fit_scorer = FitScorer()

    async def search_jobs(
        self,
        query: str,
        user_id: str,
        db,
        location_override: Optional[str] = None,
        max_results: int = 15
    ) -> List[Dict]:
        
        nl_data = await self._parse_query(query)
        target_role = nl_data.get("role", query)
        location = await self._resolve_location(user_id, nl_data.get("location"), location_override, db)
        work_type = nl_data.get("work_type", "any")

        cache_key = cache_key_jobs(f"{target_role}_{work_type}", location)
        redis_client = await redis.get_redis()
        cached = await redis_client.get_json(cache_key)
        if cached:
            return cached

        from app.jobs.mock import MockJobClient
        mock_client = MockJobClient()

        search_query = target_role
        if work_type == "remote":
            search_query += " remote"
        elif work_type == "onsite":
            search_query += " onsite"

        search_tasks = [
            self.remotive.search(search_query, limit=10),
            self.arbeitnow.search(search_query, location=location, limit=10),
            self.scraper.scrape_bdjobs(search_query, location=location),
            self.scraper.scrape_jobspy(search_query, location=location)
        ]
        
        results = await asyncio.gather(*search_tasks, return_exceptions=True)
        all_jobs = []
        for res in results:
            if isinstance(res, list):
                all_jobs.extend(res)
        
        found_in_location = any(location.lower() in (j.get("location") or "").lower() for j in all_jobs) if location else True
        
        if len(all_jobs) < 5:
            web_jobs = await self.scraper.ddg_search_jobs(search_query, location=location)
            all_jobs.extend(web_jobs)
            
            if len(all_jobs) < 3:
                mock_jobs = await mock_client.search(search_query, location=location)
                all_jobs.extend(mock_jobs)

        deduped_jobs = self._deduplicate(all_jobs)
        
        async def score_job(j):
            try:
                fit_data = await self.fit_scorer.compute_fit(user_id, j["description"], db)
                j.update(fit_data)
                return j
            except Exception as e:
                logger.error(f"Scoring error for job '{j.get('role', 'Unknown')}': {e}")
                j["fit_score"] = 0.5
                j["fit_percentage"] = 50
                return j

        scoring_tasks = [score_job(job) for job in deduped_jobs[:20]]
        scored_jobs = await asyncio.gather(*scoring_tasks)

        scored_jobs.sort(key=lambda x: x.get("fit_score", 0), reverse=True)
        final_results = scored_jobs[:max_results]
        
        message = None
        if location and not found_in_location:
            message = f"No specific jobs found in '{location}'. Here are some remote and general alternatives."
        elif not final_results:
            message = "No jobs found for your search. Try broadening your keywords."

        response_data = {
            "jobs": final_results,
            "message": message,
            "location_used": location
        }
        
        await redis_client.set_json(cache_key, response_data, ttl=1800)
        return response_data

    async def _parse_query(self, query: str) -> Dict:
        from app.services.llm_factory import get_ai_response
        import json
        
        system_prompt = """
        Extract job role, location, and work type from the user's natural language job search query.
        Return ONLY a JSON object with keys: "role" (string), "location" (string or null), "work_type" ("remote", "onsite", or "any").
        Example: "Software Engineer in New York" -> {"role": "Software Engineer", "location": "New York", "work_type": "any"}
        Example: "Remote Python Developer" -> {"role": "Python Developer", "location": null, "work_type": "remote"}
        """
        
        response = await get_ai_response([{"role": "user", "content": query}], system_prompt)
        if not response:
            return {"role": query, "location": None, "work_type": "any"}
        try:
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {"role": query, "location": None, "work_type": "any"}
        except Exception:
            return {"role": query, "location": None, "work_type": "any"}

    async def _resolve_location(self, user_id: str, extracted: Optional[str], override: Optional[str], db) -> str:
        if extracted: return extracted
        if override: return override
        
        from sqlalchemy import text
        result = await db.execute(
            text("SELECT location_city FROM profiles WHERE id = :uid"),
            {"uid": user_id}
        )
        profile_loc = result.scalar()
        if profile_loc: return profile_loc
        
        return "Bangladesh"

    def _deduplicate(self, jobs: List[Dict]) -> List[Dict]:
        seen_urls = set()
        seen_pairs = set()
        unique_jobs = []
        
        for j in jobs:
            url = j.get("job_url")
            pair = (j.get("role", "").lower(), j.get("company", "").lower())
            
            if url and url in seen_urls: continue
            if pair in seen_pairs: continue
            
            if url: seen_urls.add(url)
            seen_pairs.add(pair)
            unique_jobs.append(j)
            
        return unique_jobs
