import asyncio
from typing import List, Dict, Optional
from app.jobs.remotive import RemotiveClient
from app.jobs.arbeitnow import ArbeitnowClient
from app.jobs.scraper import JobScraper
from app.agents.fit_scorer import FitScorer
from app.utils.hashing import cache_key_jobs
from app.core import redis
import google.generativeai as genai
from app.core.config import get_settings

settings = get_settings()

class JobHunterAgent:
    def __init__(self):
        self.remotive = RemotiveClient()
        self.arbeitnow = ArbeitnowClient()
        self.scraper = JobScraper()
        self.fit_scorer = FitScorer()
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def search_jobs(
        self,
        query: str,
        user_id: str,
        db,
        location_override: Optional[str] = None,
        max_results: int = 15
    ) -> List[Dict]:
        
        location = await self._resolve_location(user_id, query, location_override, db)
        
        cache_key = cache_key_jobs(query, location)
        redis_client = await redis.get_redis()
        cached = await redis_client.get_json(cache_key)
        if cached:
            return cached

        from app.jobs.mock import MockJobClient
        mock_client = MockJobClient()

        search_tasks = [
            self.remotive.search(query, limit=10),
            self.arbeitnow.search(query, location=location, limit=10),
            self.scraper.scrape_bdjobs(query, location=location)
        ]
        
        results = await asyncio.gather(*search_tasks, return_exceptions=True)
        all_jobs = []
        for res in results:
            if isinstance(res, list):
                all_jobs.extend(res)
        
        if len(all_jobs) < 5:
            # Try web search
            web_jobs = await self.scraper.ddg_search_jobs(query, location=location)
            all_jobs.extend(web_jobs)
            
            # If still low, use mock data as ultimate fallback
            if len(all_jobs) < 3:
                mock_jobs = await mock_client.search(query, location=location)
                all_jobs.extend(mock_jobs)

        deduped_jobs = self._deduplicate(all_jobs)
        # In a real system, we'd batch the fit scoring or run it in parallel
        # For simplicity here, we process top 20
        scored_jobs = []
        for job in deduped_jobs[:20]:
            try:
                fit_data = await self.fit_scorer.compute_fit(user_id, job["description"], db)
                job.update(fit_data)
                scored_jobs.append(job)
            except Exception as e:
                print(f"Scoring error for job: {e}")
                job["fit_score"] = 0.5
                job["fit_percentage"] = 50
                scored_jobs.append(job)

        scored_jobs.sort(key=lambda x: x.get("fit_score", 0), reverse=True)
        final_results = scored_jobs[:max_results]
        await redis_client.set_json(cache_key, final_results, ttl=1800) # 30 mins
        
        return final_results

    async def _resolve_location(self, user_id: str, query: str, override: Optional[str], db) -> str:
        if override: return override
        
        # Check profile
        from sqlalchemy import text
        result = await db.execute(
            text("SELECT location_city FROM profiles WHERE id = :uid"),
            {"uid": user_id}
        )
        profile_loc = result.scalar()
        if profile_loc: return profile_loc
        
        return ""

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
