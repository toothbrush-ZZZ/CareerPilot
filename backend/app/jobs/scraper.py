import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
import asyncio
from typing import List, Dict
from app.utils.text import clean_text

class JobScraper:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def scrape_bdjobs(self, query: str, location: str = "Dhaka") -> List[Dict]:
        """
        Scrape BDJobs search results.
        """
        url = f"https://jobs.bdjobs.com/jobsearch.asp?txtsearch={query}&Country=0"
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                jobs = []
                job_nodes = soup.select(".job-title-text, .job-titletag")
                
                for node in job_nodes[:8]:
                    parent = node.find_parent(class_="norm-jobs-wrapper") or node.find_parent(class_="hot-jobs-wrapper")
                    if not parent: continue
                    
                    title = node.get_text(strip=True)
                    company = ""
                    comp_node = parent.select_one(".comp-name-text, .company-name")
                    if comp_node: company = comp_node.get_text(strip=True)
                    
                    job_url = ""
                    link = node.find("a")
                    if link: job_url = "https://jobs.bdjobs.com/" + link.get("href", "")
                    
                    loc_text = ""
                    loc_node = parent.select_one(".locat-text, .job-location")
                    if loc_node: loc_text = loc_node.get_text(strip=True)
                    
                    if location.lower() not in loc_text.lower():
                        continue
                        
                    jobs.append({
                        "role": title,
                        "company": company,
                        "salary_range": "Negotiable",
                        "deadline": "See listing",
                        "location": loc_text or location,
                        "job_url": job_url,
                        "job_type": "onsite",
                        "source": "BDJobs",
                        "description": f"Job at {company} in {loc_text}. Visit BDJobs for details."
                    })
                    await asyncio.sleep(0.5) 
                    
                return jobs
            except Exception as e:
                print(f"BDJobs scrape error: {e}")
                return []

    async def ddg_search_jobs(self, query: str, location: str = "") -> List[Dict]:
        """
        DuckDuckGo fallback search.
        """
        augmented_query = f"{query} job {location} site:linkedin.com OR site:bdjobs.com OR site:glassdoor.com"
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(augmented_query, max_results=8))
                
            jobs = []
            for r in results:
                title_raw = r.get("title", "")
                role = title_raw
                company = "Unknown"
                if " at " in title_raw:
                    role, company = title_raw.split(" at ", 1)
                elif " | " in title_raw:
                    parts = title_raw.split(" | ")
                    role = parts[0]
                    if len(parts) > 1: company = parts[1]
                
                jobs.append({
                    "role": role.strip(),
                    "company": company.strip(),
                    "salary_range": "Not specified",
                    "deadline": "Unknown",
                    "location": location or "See listing",
                    "job_url": r.get("href"),
                    "job_type": "unknown",
                    "source": "Web Search",
                    "description": clean_text(r.get("body", ""))[:500]
                })
            return jobs
        except Exception as e:
            print(f"DDG search error: {e}")
            return []

    async def scrape_job_description(self, url: str) -> str:
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                content = soup.find('article') or soup.find('main') or soup.body
                if content:
                    return clean_text(content.get_text())[:2000]
                return ""
            except Exception:
                return ""
