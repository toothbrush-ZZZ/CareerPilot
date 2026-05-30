import asyncio
import logging
import re
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import quote_plus, urljoin

import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

from app.utils.text import clean_text

logger = logging.getLogger(__name__)

BDJOBS_BASE_URL = "https://bdjobs.com"


class JobScraper:
    def __init__(self):
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": (
                "text/html,application/xhtml+xml,"
                "application/xml;q=0.9,image/avif,"
                "image/webp,*/*;q=0.8"
            ),
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        }

    async def _get_page(self, url: str) -> Optional[str]:
        """
        Fetch page HTML with retries and anti-bot checks.
        """

        for attempt in range(3):
            try:
                async with httpx.AsyncClient(
                    headers=self.headers,
                    timeout=20.0,
                    follow_redirects=True,
                    http2=True,
                ) as client:

                    response = await client.get(url)

                    logger.info(
                        f"GET {url} -> {response.status_code}"
                    )

                    if response.status_code != 200:
                        logger.warning(
                            f"Bad status code: {response.status_code}"
                        )
                        await asyncio.sleep(2)
                        continue

                    content_type = response.headers.get(
                        "content-type",
                        ""
                    )

                    if "text/html" not in content_type:
                        logger.warning(
                            f"Unexpected content type: {content_type}"
                        )
                        return None

                    html = response.text

                    lower_html = html.lower()

                    if (
                        "cf-browser-verification" in lower_html
                        or "attention required" in lower_html
                        or "cloudflare" in lower_html
                    ):
                        logger.warning(
                            "Blocked by Cloudflare protection"
                        )
                        return None

                    return html

            except Exception as e:
                logger.error(
                    f"Attempt {attempt + 1} failed: {e}"
                )

            await asyncio.sleep(2)

        return None

    async def scrape_bdjobs(
        self,
        query: str,
        location: str = ""
    ) -> List[Dict]:
        """
        Scrape BDJobs search results using BeautifulSoup.
        """

        jobs = []

        try:
            search_query = f"{query} {location}".strip()

            encoded_query = quote_plus(search_query)

            url = f"{BDJOBS_BASE_URL}/h/jobs?txtsearch={encoded_query}"
            if location:
                url += f"&LocationId={quote_plus(location)}"

            logger.info(f"Searching BDJobs: {url}")

            html = await self._get_page(url)

            if not html:
                logger.warning(
                    "No HTML received from BDJobs"
                )
                return []

            soup = BeautifulSoup(html, "html.parser")

            logger.info(
                f"Page title: {soup.title.string if soup.title else 'No title'}"
            )

            cards = soup.select(
                'a.group[href*="/h/details/"]'
            )

            logger.info(
                f"Found {len(cards)} potential job cards"
            )

            if not cards:
                logger.warning(
                    "No job cards found. HTML structure may have changed."
                )

                if logger.isEnabledFor(logging.DEBUG):
                    with open("bdjobs_debug.html", "w", encoding="utf-8") as f:
                        f.write(html)

                return []

            for card in cards[:20]:
                try:
                    title_el = (
                        card.select_one("h2 a")
                        or card.select_one(".job-title a")
                        or card.select_one(".title a")
                        or card.select_one("a[href]")
                    )

                    if not title_el:
                        continue

                    title = clean_text(
                        title_el.get_text(separator=" ", strip=True)
                    )

                    href = title_el.get("href", "").strip()

                    if (
                        not href
                        or "javascript:" in href.lower()
                    ):
                        continue

                    if href.startswith("/"):
                        href = urljoin(
                            BDJOBS_BASE_URL,
                            href
                        )

                    p_tags = card.find_all("p", limit=10)
                    
                    company = "Unknown Company"
                    job_location = location or "Bangladesh"
                    deadline = "Not specified"

                    if len(p_tags) >= 2:
                        company = clean_text(p_tags[1].get_text(strip=True))

                    for p in p_tags:
                        p_text = p.get_text(strip=True)
                        if any(city in p_text for city in ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"]):
                            job_location = clean_text(p_text)
                            break
                    
                    deadline_el = card.find(lambda t: t.name in ["span", "p"] and "Deadline:" in t.get_text())
                    if deadline_el:
                        deadline = clean_text(deadline_el.get_text().replace("Deadline:", "").strip())

                    description = (
                        f"{title} at {company} "
                        f"in {job_location}. "
                        f"Deadline: {deadline}"
                    )

                    jobs.append({
                        "role": title,
                        "company": company,
                        "salary_range": "Negotiable",
                        "deadline": deadline,
                        "location": job_location,
                        "job_url": href,
                        "job_type": "onsite",
                        "source": "BDJobs",
                        "description": description
                    })

                except Exception as e:
                    logger.error(
                        f"Error parsing job card: {e}"
                    )

            logger.info(
                f"Successfully scraped {len(jobs)} BDJobs listings"
            )

            return jobs

        except Exception as e:
            logger.error(f"BDJobs scraping failed: {e}")
            return []


    async def scrape_jobspy(
        self,
        query: str,
        location: str = "Bangladesh"
    ) -> List[Dict]:
        """
        Scrape jobs using JobSpy (LinkedIn, Indeed, Glassdoor).
        """
        try:
            from jobspy import scrape_jobs
            import pandas as pd

            if not location:
                location = "Bangladesh"

            logger.info(f"Searching JobSpy: {query} in {location}")
            def _scrape():
                try:
                    sites = ["indeed", "linkedin"]
                    
                    loc_lower = location.lower() if location else ""
                    is_bd = any(c in loc_lower for c in ["bangladesh", "dhaka", "chittagong", "sylhet", "rajshahi", "khulna", "barisal", "rangpur", "mymensingh"]) or not location
                    
                    return scrape_jobs(
                        site_name=sites,
                        search_term=query,
                        location=location,
                        results_wanted=15,
                        country_indeed="bangladesh" if is_bd else None,
                    )
                except Exception as e:
                    logger.error(f"JobSpy scrape_jobs call failed: {e}")
                    try:
                        return scrape_jobs(
                            site_name=["linkedin"],
                            search_term=query,
                            location=location,
                            results_wanted=10,
                        )
                    except:
                        return pd.DataFrame()

            df = await asyncio.to_thread(_scrape)

            if df is None or df.empty:
                logger.warning("JobSpy returned no results")
                return []

            jobs = []
            for _, row in df.iterrows():
                try:
                    title = str(row.get("title", "Unknown Role"))
                    company = str(row.get("company", "Unknown Company"))
                    job_url = str(row.get("job_url", ""))
                    loc = str(row.get("location", location))
                    
                    if not job_url:
                        continue

                    salary = "Negotiable"
                    min_amount = row.get("min_amount")
                    max_amount = row.get("max_amount")
                    currency = row.get("currency", "")
                    
                    if pd.notna(min_amount) and pd.notna(max_amount):
                        salary = f"{min_amount} - {max_amount} {currency}"
                    elif pd.notna(min_amount):
                        salary = f"{min_amount} {currency}"

                    desc = str(row.get("description", ""))
                    if not desc or desc == "nan":
                        desc = f"{title} at {company} in {loc}."
                    date_posted = row.get("date_posted")
                    deadline = "Not specified"
                    if pd.notna(date_posted):
                        deadline = f"Posted: {date_posted}"

                    jobs.append({
                        "role": title,
                        "company": company,
                        "salary_range": salary,
                        "deadline": deadline,
                        "location": loc,
                        "job_url": job_url,
                        "job_type": str(row.get("job_type", "onsite")),
                        "source": str(row.get("site", "JobSpy")).capitalize(),
                        "description": desc[:1500]
                    })
                except Exception as e:
                    logger.error(f"Error parsing JobSpy row: {e}")

            logger.info(f"JobSpy returned {len(jobs)} jobs")
            return jobs

        except Exception as e:
            logger.error(f"scrape_jobspy failed: {e}")
            return []

    async def ddg_search_jobs(
        self,
        query: str,
        location: str = ""
    ) -> List[Dict]:
        """
        DuckDuckGo fallback search.
        """

        try:
            search_query = (
                f"{query} {location} jobs"
            ).strip()

            logger.info(f"DDG search: {search_query}")

            def _search():
                with DDGS() as ddgs:
                    return list(
                        ddgs.text(
                            search_query,
                            max_results=15
                        )
                    )

            results = await asyncio.to_thread(_search)
            logger.info(f"DDG raw results count: {len(results)}")
            for r in results[:5]:
                logger.info(f"DDG result URL: {r.get('href')}")

            valid_domains = [
                "bdjobs.com",
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
                "careerjet.com",
                "monster.com",
                "careerbuilder.com",
                "simplyhired.com",
                "facebook.com",
                "jobs.com.bd",
                "chakri.com",
            ]

            jobs = []

            for r in results:
                try:
                    url = r.get("href", "")

                    if not any(
                        domain in url
                        for domain in valid_domains
                    ):
                        continue

                    title_raw = clean_text(
                        r.get("title", "")
                    )

                    role = title_raw
                    company = "Unknown"

                    if " at " in title_raw:
                        role, company = title_raw.split(
                            " at ",
                            1
                        )

                    elif " | " in title_raw:
                        parts = title_raw.split(" | ")

                        role = parts[0]

                        if len(parts) > 1:
                            company = parts[1]

                    jobs.append({
                        "role": clean_text(role),
                        "company": clean_text(company),
                        "salary_range": "Not specified",
                        "deadline": "Unknown",
                        "location": (
                            location or "Bangladesh"
                        ),
                        "job_url": url,
                        "job_type": "unknown",
                        "source": "DuckDuckGo",
                        "description": clean_text(
                            r.get("body", "")
                        )[:500]
                    })

                except Exception as e:
                    logger.error(
                        f"DDG parsing error: {e}"
                    )

            logger.info(
                f"DDG returned {len(jobs)} valid jobs"
            )

            return jobs

        except Exception as e:
            logger.error(f"DDG search failed: {e}")
            return []

    async def scrape_job_description(
        self,
        url: str
    ) -> str:
        """
        Scrape full job description.
        """

        try:
            html = await self._get_page(url)

            if not html:
                return ""

            soup = BeautifulSoup(html, "html.parser")

            for tag in soup([
                "script",
                "style",
                "nav",
                "footer",
                "header",
                "noscript",
                "svg",
                "form",
            ]):
                tag.decompose()

            selectors = [
                ".job-description",
                ".job_desc",
                ".JD",
                ".jobdetails",
                ".details",
                ".content",
                "article",
                "main",
            ]

            content = None

            for selector in selectors:
                content = soup.select_one(selector)

                if content:
                    break

            if not content:
                content = soup.body

            if not content:
                return ""

            text = clean_text(
                content.get_text(
                    separator=" ",
                    strip=True
                )
            )

            text = re.sub(r"\s+", " ", text)

            if len(text) < 100:
                return ""

            return text[:3000]

        except Exception as e:
            logger.error(
                f"Description scraping failed: {e}"
            )
            return ""

    async def search_jobs(
        self,
        query: str,
        location: str = ""
    ) -> List[Dict]:
        """
        Main search function.
        """

        try:
            bdjobs_task = self.scrape_bdjobs(
                query,
                location
            )

            jobspy_task = self.scrape_jobspy(
                query,
                location or "Bangladesh"
            )

            ddg_task = self.ddg_search_jobs(
                query,
                location
            )

            bdjobs_results, jobspy_results, ddg_results = (
                await asyncio.gather(
                    bdjobs_task,
                    jobspy_task,
                    ddg_task
                )
            )

            combined = (
                bdjobs_results + jobspy_results + ddg_results
            )

            unique_jobs = []
            seen = set()

            for job in combined:
                job_url = job.get(
                    "job_url",
                    ""
                ).strip()

                if not job_url:
                    continue

                if job_url in seen:
                    continue

                seen.add(job_url)

                unique_jobs.append(job)

            logger.info(
                f"Total unique jobs: {len(unique_jobs)}"
            )

            return unique_jobs[:20]

        except Exception as e:
            logger.error(
                f"Search jobs failed: {e}"
            )
            return []