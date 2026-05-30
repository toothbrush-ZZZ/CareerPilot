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
        from app.utils.normalize_location import normalize_location
        
        nl_data = await self._parse_query(query)
        keywords_list = nl_data.get("keywords") or []
        target_role = " ".join(keywords_list) if keywords_list else query
        
        location = nl_data.get("location")
        if location:
            location = normalize_location(location)
        else:
            resolved_loc = await self._resolve_location(user_id, None, location_override, db)
            location = normalize_location(resolved_loc)
            
        work_type = nl_data.get("job_type", "any")
        is_remote = nl_data.get("remote", False)

        # Check cache before scraping to avoid redundant requests
        cache_key = cache_key_jobs(f"{target_role}_{work_type}_{is_remote}", location)
        redis_client = await redis.get_redis()
        cached = await redis_client.get_json(cache_key)
        if cached:
            logger.info(f"Returning cached results for {target_role} in {location}")
            return cached

        from app.jobs.mock import MockJobClient
        mock_client = MockJobClient()

        search_query = target_role
        if is_remote or work_type == "remote":
            search_query += " remote"
        elif work_type == "onsite":
            search_query += " onsite"

        # Use all scrapers with individual timeouts to prevent long waits
        async def scrape_with_timeout(coro, timeout=15):
            try:
                return await asyncio.wait_for(coro, timeout=timeout)
            except asyncio.TimeoutError:
                logger.warning(f"Scraper timed out after {timeout}s")
                return []
            except Exception as e:
                logger.error(f"Scraper failed: {e}")
                return []
        
        search_tasks = [
            scrape_with_timeout(self.remotive.search(search_query, limit=10), timeout=10),
            scrape_with_timeout(self.arbeitnow.search(search_query, location=location, limit=10), timeout=10),
            scrape_with_timeout(self.scraper.scrape_jobspy(search_query, location=location), timeout=20),
            scrape_with_timeout(self.scraper.scrape_bdjobs(search_query, location=location), timeout=15),
        ]
        
        # Use asyncio.wait with return_when=FIRST_EXCEPTION to fail fast on errors
        # But still gather all successful results
        done, pending = await asyncio.wait(
            search_tasks,
            timeout=30,  # Overall timeout for all scrapers
            return_when=asyncio.ALL_COMPLETED
        )
        
        # Cancel any pending tasks
        for task in pending:
            task.cancel()
        
        results = [task.result() for task in done if not task.exception()]
        all_jobs = []
        for res in results:
            if isinstance(res, list):
                all_jobs.extend(res)
        
        # Rank jobs by location match and skills fit
        def rank_job(job):
            score = 0
            job_loc = normalize_location(job.get("location") or "")
            
            # Location match score (higher if matches target location)
            if location and job_loc:
                if location.lower() in job_loc.lower():
                    score += 30
                elif job_loc.lower() in location.lower():
                    score += 20
                elif "remote" in job_loc.lower() and (is_remote or work_type == "remote"):
                    score += 25
            
            # Skills fit score (from fit_scorer)
            fit_score = job.get("fit_score", 0.5)
            score += fit_score * 50
            
            return score
        
        # Sort jobs by ranking score
        all_jobs.sort(key=rank_job, reverse=True)
        
        found_in_location = any(location and location.lower() in normalize_location(j.get("location") or "").lower() for j in all_jobs) if location else True
        
        if len(all_jobs) < 5:
            web_jobs = await self.scraper.ddg_search_jobs(search_query, location=location)
            all_jobs.extend(web_jobs)
            
            if len(all_jobs) < 3:
                mock_jobs = await mock_client.search(search_query, location=location)
                all_jobs.extend(mock_jobs)

        deduped_jobs = self._deduplicate(all_jobs)
        
        async def score_job(j):
            try:
                # Normalize location on display
                normalized_job_loc = normalize_location(j.get("location")) or "Remote"
                j["location"] = normalized_job_loc
                
                fit_data = await self.fit_scorer.compute_fit(user_id, j["description"], db)
                j.update(fit_data)
                
                j["id"] = j.get("job_url", "")
                j["title"] = j.get("role") or j.get("job_title", "Unknown Role")
                j["role"] = j["title"]
                j["company"] = j.get("company", "Unknown Company")
                j["salaryRange"] = j.get("salary_range") or j.get("salary") or "N/A"
                j["salary_range"] = j["salaryRange"]
                
                deadline_val = j.get("deadline") or "N/A"
                if not deadline_val or deadline_val.strip() == "":
                    deadline_val = "N/A"
                j["deadline"] = deadline_val
                
                j["jobType"] = j.get("job_type") or "Full-time"
                j["job_type"] = j["jobType"]
                j["fitScore"] = j.get("fit_percentage", 50)
                j["fit_score"] = j.get("fit_score", 0.5)
                j["fitReason"] = j.get("fit_reason") or "No reason provided."
                j["fit_reason"] = j["fitReason"]
                j["applyUrl"] = j.get("job_url", "")
                j["apply_url"] = j["applyUrl"]
                j["postedDate"] = j.get("posted_date") or "N/A"
                
                return j
            except Exception as e:
                logger.error(f"Scoring error for job '{j.get('role', 'Unknown')}': {e}")
                j["location"] = normalize_location(j.get("location")) or "Remote"
                j["fit_score"] = 0.5
                j["fit_percentage"] = 50
                j["fitScore"] = 50
                j["fitReason"] = "No reason provided."
                j["fit_reason"] = "No reason provided."
                j["title"] = j.get("role") or j.get("job_title", "Unknown Role")
                j["applyUrl"] = j.get("job_url", "")
                j["salaryRange"] = j.get("salary_range") or "N/A"
                j["jobType"] = j.get("job_type") or "Full-time"
                j["deadline"] = j.get("deadline") or "N/A"
                j["postedDate"] = "N/A"
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
        await redis_client.set_json(f"recent_searches:{user_id}", final_results, ttl=3600)
        return response_data

    async def _parse_query(self, query: str) -> Dict:
        from app.services.llm_factory import get_ai_response
        import json
        
        system_prompt = """
You are a job search query parser. Extract structured fields from the user's natural language job search query.

Return ONLY valid JSON in this exact format:
{
  "keywords": ["machine learning", "internship"],
  "location": "Dhaka",
  "job_type": "internship",
  "deadline_filter": "this month",
  "salary_min": null,
  "salary_max": null,
  "remote": false,
  "original_query": "<the raw user input>"
}

If a field is not mentioned, set it to null. Do not guess.
"""
        
        response = await get_ai_response([{"role": "user", "content": query}], system_prompt)
        if not response:
            return {
                "keywords": [query],
                "location": None,
                "job_type": "any",
                "deadline_filter": None,
                "salary_min": None,
                "salary_max": None,
                "remote": False,
                "original_query": query
            }
        try:
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
                # Ensure fields are present
                if "keywords" not in parsed:
                    parsed["keywords"] = [query]
                if "location" not in parsed:
                    parsed["location"] = None
                return parsed
            return {
                "keywords": [query],
                "location": None,
                "job_type": "any",
                "deadline_filter": None,
                "salary_min": None,
                "salary_max": None,
                "remote": False,
                "original_query": query
            }
        except Exception:
            return {
                "keywords": [query],
                "location": None,
                "job_type": "any",
                "deadline_filter": None,
                "salary_min": None,
                "salary_max": None,
                "remote": False,
                "original_query": query
            }

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
            role = j.get("role") or j.get("job_title", "")
            company = j.get("company", "")
            pair = (role.lower(), company.lower())
            
            if url and url in seen_urls: continue
            if pair in seen_pairs: continue
            
            if url: seen_urls.add(url)
            seen_pairs.add(pair)
            unique_jobs.append(j)
            
        return unique_jobs
