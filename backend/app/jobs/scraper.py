import asyncio
import logging
import re
from typing import List, Dict, Optional
from urllib.parse import quote_plus, urljoin

import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

from app.utils.text import clean_text

logger = logging.getLogger(__name__)

BDJOBS_BASE_URL = "https://www.bdjobs.com"


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

                    # Cloudflare / block detection
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

            url = (
                f"{BDJOBS_BASE_URL}/jobsearch.asp"
                f"?freetext={encoded_query}"
            )

            logger.info(f"Searching BDJobs: {url}")

            html = await self._get_page(url)

            if not html:
                logger.warning(
                    "No HTML received from BDJobs"
                )
                return []

            soup = BeautifulSoup(html, "lxml")

            logger.info(
                f"Page title: {soup.title.string if soup.title else 'No title'}"
            )

            # Updated selectors
            cards = soup.select(
                ".job-item-wrap, .job-item, .srch-result-wrap"
            )

            logger.info(
                f"Found {len(cards)} potential job cards"
            )

            if not cards:
                logger.warning(
                    "No job cards found. HTML structure may have changed."
                )

                # DEBUG SAVE
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
                        title_el.get_text(strip=True)
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

                    company_el = (
                        card.select_one(".comp-name")
                        or card.select_one(".company-name")
                        or card.select_one(".company")
                    )

                    location_el = (
                        card.select_one(".locon")
                        or card.select_one(".location")
                        or card.select_one(".job-location")
                    )

                    deadline_el = (
                        card.select_one(".dead-text")
                        or card.select_one(".deadline")
                    )

                    company = (
                        clean_text(
                            company_el.get_text(strip=True)
                        )
                        if company_el
                        else "Unknown Company"
                    )

                    job_location = (
                        clean_text(
                            location_el.get_text(strip=True)
                        )
                        if location_el
                        else location or "Bangladesh"
                    )

                    deadline = (
                        clean_text(
                            deadline_el.get_text(strip=True)
                        )
                        if deadline_el
                        else "Not specified"
                    )

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
                f"{query} jobs {location} Bangladesh"
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

            valid_domains = [
                "bdjobs.com",
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
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

            soup = BeautifulSoup(html, "lxml")

            # Remove junk tags
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

            # Cleanup whitespace
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

            ddg_task = self.ddg_search_jobs(
                query,
                location
            )

            bdjobs_results, ddg_results = (
                await asyncio.gather(
                    bdjobs_task,
                    ddg_task
                )
            )

            combined = (
                bdjobs_results + ddg_results
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