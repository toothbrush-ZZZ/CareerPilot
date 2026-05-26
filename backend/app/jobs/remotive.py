import httpx
from typing import List, Dict
from app.utils.text import clean_text

class RemotiveClient:
    BASE_URL = "https://remotive.com/api/remote-jobs"

    async def search(self, search_term: str, limit: int = 10) -> List[Dict]:
        """
        GET https://remotive.com/api/remote-jobs?search={search_term}&limit={limit}
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    self.BASE_URL,
                    params={"search": search_term, "limit": limit}
                )
                response.raise_for_status()
                data = response.json()
                
                jobs = []
                for j in data.get("jobs", []):
                    jobs.append({
                        "role": j.get("title"),
                        "company": j.get("company_name"),
                        "salary_range": j.get("salary") or "Not specified",
                        "deadline": "Rolling",
                        "location": j.get("candidate_required_location") or "Remote",
                        "job_url": j.get("url"),
                        "job_type": "remote",
                        "source": "Remotive",
                        "description": clean_text(j.get("description", ""))[:1000]
                    })
                return jobs
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Remotive search error: {e}")
                return []
