
import asyncio
import sys
import os

# Add the backend directory to sys.path
sys.path.append(r'f:\ProgrammingStuff\CareerPilot\backend')

import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

from app.jobs.scraper import JobScraper

async def test_scrapers():
    scraper = JobScraper()
    
    print("Testing BdJobs scraper...")
    bd_jobs = await scraper.scrape_bdjobs("Python", location="Dhaka")
    print(f"  Found {len(bd_jobs)} jobs on BdJobs")
    if bd_jobs:
        for j in bd_jobs[:2]:
            print(f"    - {j['role']} at {j['company']} ({j['location']})")
    
    print("\nTesting DuckDuckGo web search helper...")
    web_jobs = await scraper.ddg_search_jobs("Software Engineer", location="Dhaka")
    print(f"  Found {len(web_jobs)} jobs via web search")
    if web_jobs:
        for j in web_jobs[:2]:
            print(f"    - {j['role']} at {j['company']} ({j['location']})")

if __name__ == "__main__":
    asyncio.run(test_scrapers())
