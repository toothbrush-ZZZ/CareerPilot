import httpx
from typing import List, Dict, Optional
from app.utils.text import clean_text

class ArbeitnowClient:
    BASE_URL = "https://www.arbeitnow.com/api/job-board-api"

    async def search(self, search_term: str, location: str = "", limit: int = 10) -> List[Dict]:
        """
        GET https://www.arbeitnow.com/api/job-board-api?search={search_term}
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    self.BASE_URL,
                    params={"search": search_term}
                )
                response.raise_for_status()
                data = response.json()
                
                raw_jobs = data.get("data", [])
                filtered_jobs = []
                
                for j in raw_jobs:
                    job_loc = j.get("location", "").lower()
                    is_remote = j.get("remote", False)
                    
                    if location and not (location.lower() in job_loc or is_remote):
                        continue
                        
                    filtered_jobs.append({
                        "role": j.get("title"),
                        "company": j.get("company_name"),
                        "salary_range": "Not specified",
                        "deadline": "Rolling",
                        "location": j.get("location") or ("Remote" if is_remote else "Unknown"),
                        "job_url": j.get("url"),
                        "job_type": "remote" if is_remote else "onsite",
                        "source": "Arbeitnow",
                        "description": clean_text(j.get("description", ""))[:1000]
                    })
                    
                    if len(filtered_jobs) >= limit:
                        break
                        
                return filtered_jobs
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Arbeitnow search error: {e}")
                return []
